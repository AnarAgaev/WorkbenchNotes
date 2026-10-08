// src/demo/noteId.ts
// Парсер внешнего ввода: превращает string → DemoNoteId | null.
// Здесь место проверки формата, а не внутри компонентов.
export function parseNoteId(value: unknown): DemoNoteId | null {
  if (typeof value !== "string") return null;

  const v = value.trim();

  // Минимальная проверка формата id, используемая в демо.
  if (!/^n\d+$/.test(v)) return null;

  return v;
}

export function isNoteId(value: unknown): value is DemoNoteId {
  // Строгая проверка: без пробелов/мусора.
  return typeof value === "string" && value.trim() === value && /^n\d+$/.test(value);
}

export function assertNoteId(value: unknown): DemoNoteId {
  const id = parseNoteId(value);
  if (!id) throw new Error("Invalid DemoNoteId");
  return id;
}
