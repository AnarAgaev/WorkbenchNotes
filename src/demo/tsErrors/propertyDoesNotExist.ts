// src/demo/tsErrors/propertyDoesNotExist.ts
// Учебный файл: примеры ошибок Property does not exist.
// Файл не используется в рантайме. Ошибочные строки держите закомментированными.

import type { ActionResult } from "@/demo/actionResult";
import { ok, fail } from "@/demo/actionResult";

// Пример 1: опечатка в имени поля у сущности Note
export function demo_typo(note: DemoNote) {
  // ❌ Опечатка: поля titel не существует в Note
//   return note.titel;

  // ✅ Правильно: поле title
  return note.title;
}

// Пример 2: поле существует только в одной ветке union-типа
function createResult(isOk: boolean): ActionResult<DemoNote> {
  return isOk
    ? ok({
        id: "n1",
        title: "Заметка",
        status: "draft",
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: 1,
        description: "",
      })
    : fail("Ошибка создания");
}

export function demo_union() {
  const result = createResult(Math.random() > 0.5);

  // ❌ data есть только при ok: true, поэтому без проверки TS должен ругаться
//   return result.data.title;

  // ✅ Сужение по ok: после проверки TS знает, что result имеет ветку без data
  if (!result.ok) return result.error;

  return result.data.title;
}
