"use client";

import { useEffect } from "react";
import { cabinetStore } from "@/lib/cabinet";

/** Adds the current record to the visitor's recently viewed list. Renders nothing. */
export function RecordView({ id }: { id: string }) {
  useEffect(() => {
    cabinetStore.recordView(id);
  }, [id]);
  return null;
}
