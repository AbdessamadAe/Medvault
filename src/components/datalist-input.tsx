"use client";

import { useId, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";

/**
 * A text input with a native browser suggestion dropdown (via <datalist>).
 * Unlike a closed <Select>, the user can still type any value not in the
 * list — for fields where a fixed vocabulary is either impossible
 * (clinic names, test names) or too narrow to force (specialties).
 */
export function DatalistInput({
  options,
  ...props
}: ComponentProps<typeof Input> & { options: readonly string[] }) {
  const listId = useId();

  return (
    <>
      <Input list={listId} {...props} />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
}
