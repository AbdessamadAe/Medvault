/**
 * Weekly backup: pg_dump the database + zip every Storage file, upload
 * both to a separate Backblaze B2 bucket, then prune old backups beyond
 * the retention count. Run via `npm run backup` (locally, for restore
 * testing) or by the GitHub Actions workflow in
 * .github/workflows/backup.yml.
 *
 * Requires the `pg_dump` binary on PATH (part of the postgresql-client
 * package) and SUPABASE_SERVICE_ROLE_KEY, which bypasses Row Level
 * Security so the backup can read every file regardless of ownership.
 */
import { config as loadEnv } from "dotenv";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import JSZip from "jszip";
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });

const RETENTION_COUNT = 8;
const BACKUP_PREFIX = "medvault-backups";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function dumpDatabase(tempDir: string): string {
  const dumpPath = path.join(tempDir, "database.dump");
  const connectionString = requireEnv("MIGRATION_DATABASE_URL");
  execFileSync("pg_dump", ["--format=custom", "--file", dumpPath, connectionString], {
    stdio: "inherit",
  });
  return dumpPath;
}

async function zipStorageFiles(tempDir: string): Promise<string> {
  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "medical-files";
  const zip = new JSZip();

  async function walk(prefix: string) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
    if (error) throw new Error(`Failed to list storage at "${prefix}": ${error.message}`);

    for (const entry of data ?? []) {
      const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) {
        await walk(fullPath); // folder
        continue;
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(fullPath);
      if (downloadError || !fileData) continue;

      zip.file(fullPath, await fileData.arrayBuffer());
    }
  }

  await walk("");

  const zipPath = path.join(tempDir, "storage-files.zip");
  const content = await zip.generateAsync({ type: "nodebuffer" });
  writeFileSync(zipPath, content);
  return zipPath;
}

function b2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: requireEnv("B2_ENDPOINT"),
    credentials: {
      accessKeyId: requireEnv("B2_APPLICATION_KEY_ID"),
      secretAccessKey: requireEnv("B2_APPLICATION_KEY"),
    },
  });
}

async function uploadAndPrune(dumpPath: string, zipPath: string, timestamp: string) {
  const client = b2Client();
  const bucket = requireEnv("B2_BUCKET_NAME");
  const runPrefix = `${BACKUP_PREFIX}/${timestamp}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: `${runPrefix}/database.dump`,
      Body: readFileSync(dumpPath),
    }),
  );
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: `${runPrefix}/storage-files.zip`,
      Body: readFileSync(zipPath),
    }),
  );

  const listed = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: `${BACKUP_PREFIX}/`,
      Delimiter: "/",
    }),
  );
  const runFolders = (listed.CommonPrefixes ?? [])
    .map((entry) => entry.Prefix)
    .filter((prefix): prefix is string => Boolean(prefix))
    .sort();

  const foldersToDelete = runFolders.slice(0, Math.max(0, runFolders.length - RETENTION_COUNT));

  for (const folder of foldersToDelete) {
    const objects = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: folder }));
    for (const object of objects.Contents ?? []) {
      if (object.Key) {
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: object.Key }));
      }
    }
    console.log(`Pruned old backup: ${folder}`);
  }
}

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const tempDir = mkdtempSync(path.join(tmpdir(), "medvault-backup-"));

  try {
    console.log("Dumping database...");
    const dumpPath = dumpDatabase(tempDir);

    console.log("Archiving storage files...");
    const zipPath = await zipStorageFiles(tempDir);

    console.log("Uploading to Backblaze B2 and pruning old backups...");
    await uploadAndPrune(dumpPath, zipPath, timestamp);

    console.log(`Backup complete: ${BACKUP_PREFIX}/${timestamp}`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error("Backup failed:", error);
  process.exit(1);
});
