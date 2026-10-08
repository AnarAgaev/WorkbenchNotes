// src/app/_actions/mutations.ts
"use server";

import {
  CreateNotePayloadSchema,
  CreateProjectPayloadSchema,
  CreateSectionPayloadSchema,
  DeleteNotePayloadSchema,
  DeleteProjectPayloadSchema,
  DeleteSectionPayloadSchema,
  RenameNotePayloadSchema,
  RenameProjectPayloadSchema,
  RenameSectionPayloadSchema,
  UpdateNoteContentPayloadSchema,
} from "@/lib/schemas";

import { readWorkbenchDb, writeWorkbenchDb } from "@/server/workbenchDb";

type Ok = { ok: true };
type Fail = { ok: false; error: string };
type Result = Ok | Fail;

// Общая обёртка для “write-точки”.
// Все изменения делаем через копию db и затем атомарно записываем next.
async function mutateDb(mutator: (db: WorkbenchDb) => void): Promise<Result> {
  try {
    const db = await readWorkbenchDb();

    // structuredClone: избегаем случайных мутаций исходного объекта,
    // чтобы код mutator оставался “чистым”.
    const next: WorkbenchDb = structuredClone(db);

    mutator(next);

    // Единственное место записи в JSON db для этого набора действий.
    await writeWorkbenchDb(next);

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/* =========================
   Projects
========================= */

export async function createProjectAction(payload: unknown): Promise<Result> {
  // Server validation: никаких “доверяем клиенту”.
  const parsed = CreateProjectPayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  const { project } = parsed.data;

  return mutateDb((db) => {
    // Защита от дубля: операция идемпотентна по id.
    if (db.projects.some((p) => p.id === project.id)) return;
    db.projects.push(project);
  });
}

export async function renameProjectAction(payload: unknown): Promise<Result> {
  const parsed = RenameProjectPayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  const { projectId, title } = parsed.data;

  return mutateDb((db) => {
    const p = db.projects.find((x) => x.id === projectId);
    if (!p) return;

    // Демо-проекты защищены: не переименовываем.
    if (p.isDemo) return;

    p.title = title;
  });
}

export async function deleteProjectAction(payload: unknown): Promise<Result> {
  const parsed = DeleteProjectPayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  const { projectId } = parsed.data;

  return mutateDb((db) => {
    const p = db.projects.find((x) => x.id === projectId);
    if (!p) return;

    // Демо-проекты защищены: не удаляем.
    if (p.isDemo) return;

    // Каскад: удаляем проект и все сущности, которые на него завязаны.
    db.projects = db.projects.filter((x) => x.id !== projectId);
    db.sections = db.sections.filter((s) => s.projectId !== projectId);
    db.notes = db.notes.filter((n) => n.projectId !== projectId);
  });
}

/* =========================
   Sections
========================= */

export async function createSectionAction(payload: unknown): Promise<Result> {
  const parsed = CreateSectionPayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  const { section } = parsed.data;

  return mutateDb((db) => {
    // Родительский проект должен существовать.
    if (!db.projects.some((p) => p.id === section.projectId)) return;

    // Идемпотентность по id.
    if (db.sections.some((s) => s.id === section.id)) return;

    db.sections.push(section);
  });
}

export async function renameSectionAction(payload: unknown): Promise<Result> {
  const parsed = RenameSectionPayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  const { sectionId, title } = parsed.data;

  return mutateDb((db) => {
    const s = db.sections.find((x) => x.id === sectionId);
    if (!s) return;
    s.title = title;
  });
}

export async function deleteSectionAction(payload: unknown): Promise<Result> {
  const parsed = DeleteSectionPayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  const { sectionId } = parsed.data;

  return mutateDb((db) => {
    const s = db.sections.find((x) => x.id === sectionId);
    if (!s) return;

    // Каскад: удаляем раздел + все заметки, которые привязаны к разделу.
    db.sections = db.sections.filter((x) => x.id !== sectionId);
    db.notes = db.notes.filter((n) => !(n.parentType === "section" && n.parentId === sectionId));
  });
}

/* =========================
   Notes
========================= */

export async function createNoteAction(payload: unknown): Promise<Result> {
  const parsed = CreateNotePayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  const { note } = parsed.data;

  return mutateDb((db) => {
    // Родительский проект должен существовать.
    if (!db.projects.some((p) => p.id === note.projectId)) return;

    // Валидация связей parentType/parentId.
    if (note.parentType === "project") {
      if (note.parentId !== note.projectId) return;
    } else {
      const sec = db.sections.find((s) => s.id === note.parentId);
      if (!sec) return;
      if (sec.projectId !== note.projectId) return;
    }

    // Идемпотентность по id.
    if (db.notes.some((n) => n.id === note.id)) return;

    db.notes.push(note);
  });
}

export async function renameNoteAction(payload: unknown): Promise<Result> {
  const parsed = RenameNotePayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  const { noteId, title } = parsed.data;

  return mutateDb((db) => {
    const n = db.notes.find((x) => x.id === noteId);
    if (!n) return;

    n.title = title;

    // Для rename обновляем updatedAt сразу (это не autosave контента).
    n.updatedAt = new Date().toISOString();
  });
}

export async function deleteNoteAction(payload: unknown): Promise<Result> {
  const parsed = DeleteNotePayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  const { noteId } = parsed.data;

  return mutateDb((db) => {
    const n = db.notes.find((x) => x.id === noteId);
    if (!n) return;

    db.notes = db.notes.filter((x) => x.id !== noteId);
  });
}

export async function updateNoteContentAction(payload: unknown): Promise<Result> {
  const parsed = UpdateNoteContentPayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  const { noteId, contentHtml, updatedAt } = parsed.data;

  return mutateDb((db) => {
    const n = db.notes.find((x) => x.id === noteId);
    if (!n) return;

    // Контент сохраняем “как есть”, а updatedAt приходит от клиента после debounce.
    n.contentHtml = contentHtml;
    n.updatedAt = updatedAt;
  });
}