// src/lib/searchParams.ts
// Утилиты для чтения параметров URL.
// Идея: один раз нормализуем внешний ввод → дальше работаем с простыми типами.

export type StringParamValue = string | string[] | undefined | null;

/**
 * Возвращает строковое значение параметра.
 * - string → возвращаем как есть
 * - string[] → берём первый элемент
 * - undefined/null → undefined
 */
export function getStringParam(value: StringParamValue): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}
