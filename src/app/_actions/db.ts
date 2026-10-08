// src/app/_actions/db.ts
"use server";

import { readWorkbenchDb } from "@/server/workbenchDb";

export async function getDbSnapshot(): Promise<WorkbenchDb> {
  return readWorkbenchDb();
}