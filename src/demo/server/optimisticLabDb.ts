// src/demo/server/optimisticLabDb.ts
import { promises as fs } from "fs";
import path from "path";

export type OptimisticLabItem = {
  id: string;
  title: string;
  createdAt: string;
};

export type OptimisticLabDb = {
  items: OptimisticLabItem[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "optimistic-lab.json");

// Гарантируем папку .data, чтобы чтение/запись не падали на первом запуске
async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readOptimisticLabDb(): Promise<OptimisticLabDb> {
  await ensureDataDir();

  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<OptimisticLabDb>;

    // Нормализация: сервер всегда возвращает полный формат
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    // Первый запуск: файла нет или он битый → пустая база
    const seeded: OptimisticLabDb = { items: [] };
    await writeOptimisticLabDb(seeded);
    return seeded;
  }
}

export async function writeOptimisticLabDb(db: OptimisticLabDb): Promise<void> {
  await ensureDataDir();
  // Храним файл читабельным: удобно дебажить во время курса
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}
