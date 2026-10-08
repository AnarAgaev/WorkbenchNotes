// src/demo/server/actions/autosaveLabActions.ts
"use server";

import { z } from "zod";

export type AutosaveLabResult =
  | { ok: true; value: { updatedAt: string; requestId: string } }
  | { ok: false; error: string; requestId: string };

const schema = z.object({
  text: z.string().max(5000, "Слишком большой текст"),
  requestId: z.string().uuid(),
});

export async function saveAutosaveLabAction(payload: unknown): Promise<AutosaveLabResult> {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Некорректные данные",
      requestId: crypto.randomUUID(),
    };
  }

  const { text, requestId } = parsed.data;

  if (text.toLowerCase().includes("ошибка")) {
    return { ok: false, error: "Сервер: слово «ошибка» запрещено в этом демо", requestId };
  }

  // Делаем задержку зависящей от длины текста,
  // чтобы легче поймать “ответы не по порядку”.
  const delay = 120 + Math.min(600, text.length * 20);
  await new Promise((r) => setTimeout(r, delay));

  return { ok: true, value: { updatedAt: new Date().toISOString(), requestId } };
}
