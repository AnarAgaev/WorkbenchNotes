// src/demo/tsErrors/possiblyUndefined.ts
// Учебный файл: примеры ошибок Possibly undefined.
// Файл не используется в рантайме. Ошибочные строки держите закомментированными.

import { getStringParam } from "@/demo/searchParams";
import { parseNoteId } from "@/demo/noteId";
import { getNoteById } from "@/demo/notesStore";

// Пример 1: searchParams.note может быть undefined или string[]
export function demo_searchParams(noteRaw?: string | string[]) {
  const note = getStringParam(noteRaw);

  // ❌ note может быть null, а не строкой
//   return note.toUpperCase();

  // ✅ Guard + ранний return
  if (!note) return null;

  return note.toUpperCase();
}

// Пример 2: парсер возвращает DemoNoteId | null
export function demo_parseNoteId(raw: string) {
  const noteId = parseNoteId(raw);

  // ❌ noteId может быть null
//   return getNoteById(noteId);

  // ✅ Guard + ранний return
  if (!noteId) return null;

  return getNoteById(noteId);
}

// Пример 3: поиск может вернуть null, а не DemoNote
export function demo_storeLookup(id: DemoNoteId) {
  const note = getNoteById(id);

  // ❌ note может быть null
//   return note.title;

  // ✅ Guard + ранний return
  if (!note) return null;

  return note.title;
}
