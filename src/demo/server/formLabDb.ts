// src/demo/server/formLabDb.ts
import { promises as fs } from "fs";
import path from "path";

/**
 * Один элемент истории form-lab.
 * Это серверная истина: именно такие объекты будут лежать в .data/form-lab.json
 */
export type FormLabItem = {
  title: string;
  savedAt: string;
};

/**
 * Храним данные в .data рядом с корнем проекта.
 * Это удобно для учебных демо: файл не попадает в git и легко чистится.
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "form-lab.json");

/**
 * Гарантируем, что папка .data существует.
 * Без этого fs.writeFile упадёт, если папки ещё нет.
 */
async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/**
 * Минимальный type guard: проверяет, что значение похоже на объект.
 * Нужен, чтобы безопасно обращаться к полям после JSON.parse (там всегда unknown).
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Type guard для одного элемента истории.
 * Это главный фильтр, который превращает "грязный" JSON в типизированный массив.
 *
 * Почему важно:
 * - JSON может быть пустым/битым/в другом формате
 * - JSON может быть вручную отредактирован
 * - старые версии могли писать другой формат
 */
function isFormLabItem(value: unknown): value is FormLabItem {
  if (!isRecord(value)) return false;

  return typeof value.title === "string" && typeof value.savedAt === "string";
}

/**
 * Поддерживаем два формата хранения, чтобы демо было устойчивым к прошлым версиям:
 * 1) массив: [ {title, savedAt}, ... ]
 * 2) объект: { items: [ {title, savedAt}, ... ] }
 *
 * Возвращаем "сырые" элементы (unknown[]), дальше их нормализует type guard.
 */
function extractItems(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;

  if (isRecord(parsed) && Array.isArray(parsed.items)) {
    return parsed.items;
  }

  return [];
}

/**
 * Нормализация:
 * - берём элементы из поддерживаемых форматов
 * - оставляем только валидные FormLabItem
 * Итог всегда FormLabItem[] без any и без падений в UI.
 */
function normalizeItems(parsed: unknown): FormLabItem[] {
  const rawItems = extractItems(parsed);
  return rawItems.filter(isFormLabItem);
}

/**
 * Чтение истории.
 *
 * Контракт функции "железный":
 * - всегда возвращает массив (никогда undefined)
 * - никогда не кидает исключение наружу (для учебного UI это важнее)
 *
 * Если файла нет или JSON битый, возвращаем пустую историю.
 * Страница form-lab может отрендериться без падений.
 */
export async function readFormLabItems(): Promise<FormLabItem[]> {
  await ensureDataDir();

  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed: unknown = JSON.parse(raw);

    return normalizeItems(parsed);
  } catch {
    return [];
  }
}

/**
 * Добавление элемента в историю.
 *
 * Важная дисциплина:
 * - читаем текущий список через readFormLabItems() (там уже нормализация)
 * - добавляем в начало (свежие сверху)
 * - пишем обратно в одном каноническом формате: массив
 *
 * Это снижает вероятность расхождений и упрощает поддержку.
 */
export async function appendFormLabItem(item: FormLabItem): Promise<void> {
  const items = await readFormLabItems();
  items.unshift(item);

  await ensureDataDir();
  await fs.writeFile(DB_PATH, JSON.stringify(items, null, 2), "utf8");
}