// src/demo/tsErrors/typeIsNotAssignable.ts
// Учебный файл: примеры ошибок Type is not assignable.
// Файл не используется в рантайме. Ошибочные строки держите закомментированными.

// Пример 1: объект не соответствует контракту Note (не хватает полей или неверные типы)
export function demo_note_shape() {
  // ❌ Не хватает обязательных полей Note + неверный тип у tags
//   const badNote: Note = {
//     id: "n100",
//     title: "Неполный объект",
//     status: "draft",
//     tags: "intro", // должно быть string[]
//   };

  // ✅ Правильно: заполняем все обязательные поля и типы совпадают
  const t = new Date().toISOString();

  const goodNote: DemoNote = {
    id: "n100",
    title: "Корректный объект",
    status: "draft",
    tags: ["intro"],
    createdAt: t,
    updatedAt: t,
    priority: 1,
    description: "",
  };

  return goodNote;
}

// Пример 2: внешний ввод (string) нельзя напрямую использовать там, где ждут NoteId
import { getNoteById } from "@/demo/notesStore";
import { parseNoteId } from "@/demo/noteId";

export function demo_id_barrier(raw: string) {
  // ❌ Нельзя: getNoteById ждёт NoteId, а raw — обычная string
//   return getNoteById(raw);

  // ✅ Правильно: приводим внешний ввод на границе
  const noteId = parseNoteId(raw);
  if (!noteId) return null;

  return getNoteById(noteId);
}

export function demo_bad_fix(raw: string) {
  // ❌ Плохой фикс: подавляет ошибку вместо исправления контракта
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unsafeId = raw as any;

  // TypeScript молчит, но контракт сломан: сюда может попасть что угодно
  return getNoteById(unsafeId);
}
