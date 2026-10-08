// src/server/workbenchDb.ts
import { promises as fs } from "fs";
import path from "path";
import { getDefaultDb } from "@/data/demo";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "workbench-db.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readWorkbenchDb(): Promise<WorkbenchDb> {
  await ensureDataDir();

  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw) as WorkbenchDb;
  } catch {
    // first run → seed demo db
    const seeded = getDefaultDb();
    await writeWorkbenchDb(seeded);
    return seeded;
  }
}

export async function writeWorkbenchDb(db: WorkbenchDb): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}
