// src/demo/tsErrors/narrowingByOk.ts
// Учебный файл: narrowing по if (state.ok) на union-типах.
// Файл не используется в рантайме. Ошибочные строки держите закомментированными.

import type { ActionResult } from "@/demo/actionResult";
import { ok, fail } from "@/demo/actionResult";

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

export function demo_narrowing() {
  const state = createResult(Math.random() > 0.5);

  // ❌ Без narrowing нельзя читать data: ветка ok: false не содержит data
//   return state.data.title;

  // ✅ Narrowing: сначала выбираем ветку
  if (!state.ok) {
    return state.error;
  }

  // После проверки TS знает: здесь state имеет тип { ok: true; data: Note }
  return state.data.title;
}

export function demo_twoBranches() {
  const state = createResult(Math.random() > 0.5);

  if (state.ok) {
    // ✅ Здесь доступно data
    return `created: ${state.data.id}`;
  }

  // ✅ Здесь доступно error
  return `failed: ${state.error}`;
}
