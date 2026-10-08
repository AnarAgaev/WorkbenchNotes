// src/demo/actionResult.ts
// Учебный паттерн: единый формат ответа для операций, которые могут завершиться ошибкой.
// Удобно читать в UI и безопасно обрабатывать через narrowing.

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}
