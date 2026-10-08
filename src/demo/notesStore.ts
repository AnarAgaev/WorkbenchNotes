// src/demo/notesStore.ts
// Учебное хранилище заметок в памяти процесса.
// Подходит для демонстрации границ props/params/searchParams без подключения БД.

function nowIso(): IsoDateString {
  return new Date().toISOString();
}

let notes: DemoNote[] = [
  {
    id: "n1",
    title: "Первая заметка",
    status: "draft",
    tags: ["intro"],
    createdAt: nowIso(),
    updatedAt: nowIso(),
    description: "",
    priority: 2,
  },
  {
    id: "n2",
    title: "TypeScript = ограничения",
    status: "published",
    tags: ["ts", "contracts"],
    createdAt: nowIso(),
    updatedAt: nowIso(),
    description: "Типы ограничивают невозможные состояния и убирают лишние проверки.",
    priority: 1,
  },
  {
    id: "n3",
    title: "Граница server/client",
    status: "published",
    tags: ["next", "app-router"],
    createdAt: nowIso(),
    updatedAt: nowIso(),
    description: "На границах особенно важны контракты: что приходит и что возвращается.",
    priority: 1,
  },
];

export function getNotes(): DemoNote[] {
  return [...notes];
}

export function getNoteById(id: DemoNoteId): DemoNote | null {
  return notes.find(n => n.id === id) ?? null;
}

export function createNote(input: DemoNoteCreateInput): DemoNote {
  const id: DemoNoteId = `n${Date.now()}`;
  const t = nowIso();

  // Default values: превращаем неполный ввод в полную сущность.
  const note: DemoNote = {
    id,
    title: input.title.trim(),

    status: input.status ?? "draft",
    priority: input.priority ?? 2,

    tags: input.tags ?? ["new"],
    description: input.description ?? "",

    createdAt: t,
    updatedAt: t,
  };

  notes = [note, ...notes];
  return note;
}
