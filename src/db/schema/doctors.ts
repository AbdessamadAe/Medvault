import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { ownedRowColumns } from "./columns.helpers";

export const doctors = pgTable("doctors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  specialty: text("specialty"),
  clinic: text("clinic"),
  city: text("city"),
  phone: text("phone"),
  mapsUrl: text("maps_url"),
  notes: text("notes"),
  ...ownedRowColumns,
});
