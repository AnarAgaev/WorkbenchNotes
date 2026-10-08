// src/demo/server/actions/optimisticLabActions.ts
"use server";

import { z } from "zod";
import { titleSchema } from "@/lib/schemas";
import {
  readOptimisticLabDb,
  writeOptimisticLabDb,
  type OptimisticLabItem,
  type OptimisticLabDb,
} from "@/demo/server/optimisticLabDb";

export type OptimisticLabFormState =
  | { ok: true; itemId: string }
  | { ok: false; error: string | null; fieldErrors: { title?: string } };

const schema = z.object({
  title: titleSchema,
  clientId: z.string().uuid(),
});

// Read-точка: возвращает серверную истину одним снапшотом
export async function getOptimisticLabSnapshot(): Promise<OptimisticLabDb> {
  return await readOptimisticLabDb();
}

// Write-точка: валидирует FormData, пишет в JSON и возвращает FormState
export async function createOptimisticItemFromForm(
  _prev: OptimisticLabFormState,
  formData: FormData
): Promise<OptimisticLabFormState> {
  const titleRaw = String(formData.get("title") ?? "");
  const clientId = String(formData.get("clientId") ?? "");

  // Контракт формы: safeParse превращает FormData в проверенный payload
  const parsed = schema.safeParse({ title: titleRaw, clientId });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      error: null,
      fieldErrors: { title: flat.fieldErrors.title?.[0] ?? "Некорректное название" },
    };
  }

  // Детерминированная ошибка: сервер отказывает и ничего не пишет
  if (parsed.data.title.toLowerCase().includes("ошибка")) {
    return { ok: false, error: "Сервер: слово «ошибка» запрещено в этом демо", fieldErrors: {} };
  }

  // Чуть реальности: ответ приходит не мгновенно
  await new Promise((r) => setTimeout(r, 250));

  const itemId = `i-${parsed.data.clientId}`;

  // Серверная запись: добавляем элемент в начало списка
  const db = await readOptimisticLabDb();
  const now = new Date().toISOString();

  const item: OptimisticLabItem = {
    id: itemId,
    title: parsed.data.title,
    createdAt: now,
  };

  // Защита от дублей по id
  if (!db.items.some((x) => x.id === item.id)) {
    db.items.unshift(item);
    await writeOptimisticLabDb(db);
  }

  // Детерминированная частичная ситуация: сервер записал, но вернул ошибку
  // Это показывает, почему пересинк надёжнее локального rollback
  if (parsed.data.title.toLowerCase().includes("частично")) {
    return {
      ok: false,
      error: "Сервер: запись выполнена, но операция завершилась ошибкой",
      fieldErrors: {},
    };
  }

  return { ok: true, itemId };
}
