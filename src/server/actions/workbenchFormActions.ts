// src/server/actions/workbenchFormActions.ts
"use server";

import { revalidatePath } from "next/cache";

import { readWorkbenchDb, writeWorkbenchDb } from "@/server/workbenchDb";
import { createNoteSchema, createSectionSchema, editTitleSchema, titleSchema } from "@/lib/schemas";
import type {
  CreateProjectFormState,
  CreateSectionFormState,
  CreateNoteFormState,
  RenameProjectFormState,
  RenameSectionFormState,
  RenameNoteFormState,
  DeleteProjectFormState,
  DeleteSectionFormState,
  DeleteNoteFormState,
} from "@/lib/formTypes";

// минимальная проверка “похоже на uuid”, чтобы принимать clientId из формы
const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

export async function createProjectFromForm(
  _prev: CreateProjectFormState,
  formData: FormData
): Promise<CreateProjectFormState> {
  const titleRaw = String(formData.get("title") ?? "");
  const structureRaw = String(formData.get("structure") ?? "entries");
  const clientIdRaw = String(formData.get("clientId") ?? "");

  // clientId делает id проекта предсказуемым: p-${clientId}
  // это нужно для совпадения optimistic-id и серверного id
  const clientId = isUuid(clientIdRaw) ? clientIdRaw : crypto.randomUUID();

  const parsedTitle = titleSchema.safeParse(titleRaw);
  if (!parsedTitle.success) {
    return {
      ok: false,
      error: null,
      fieldErrors: { title: parsedTitle.error.issues[0]?.message ?? "Некорректное название" },
    };
  }

  const structure = structureRaw === "sections" ? "sections" : "entries";
  const projectId = `p-${clientId}`;

  const db = await readWorkbenchDb();

  // idempotent: повторная отправка формы не создаст дубль
  if (!db.projects.some((p) => p.id === projectId)) {
    db.projects.unshift({
      id: projectId,
      title: parsedTitle.data,
      structure,
      createdAt: new Date().toISOString(),
      isDemo: false,
    });

    await writeWorkbenchDb(db);
  }

  // маршруты в ISR, после мутации инвалидируем server snapshot и server-projects
  revalidatePath("/");
  revalidatePath("/server-projects");
  return { ok: true, projectId, clientId };
}

export async function createSectionFromForm(
  _prev: CreateSectionFormState,
  formData: FormData
): Promise<CreateSectionFormState> {
  const projectId = String(formData.get("projectId") ?? "");
  const titleRaw = String(formData.get("title") ?? "");
  const clientIdRaw = String(formData.get("clientId") ?? "");
  const clientId = isUuid(clientIdRaw) ? clientIdRaw : crypto.randomUUID();

  if (!projectId) {
    return { ok: false, error: "Нет projectId", fieldErrors: {} };
  }

  const parsed = createSectionSchema.safeParse({ title: titleRaw });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      error: null,
      fieldErrors: { title: flat.fieldErrors.title?.[0] ?? "Некорректное название" },
    };
  }

  const db = await readWorkbenchDb();
  const sectionId = `s-${clientId}`;

  // order считаем по факту в db (сервер — источник истины)
  const nextOrder = db.sections.filter((s) => s.projectId === projectId).length + 1;

  // idempotent
  if (!db.sections.some((s) => s.id === sectionId)) {
    db.sections.push({
      id: sectionId,
      projectId,
      title: parsed.data.title,
      order: nextOrder,
      createdAt: new Date().toISOString(),
    });

    await writeWorkbenchDb(db);
  }

  return { ok: true, sectionId, clientId };
}

export async function createNoteFromForm(
  _prev: CreateNoteFormState,
  formData: FormData
): Promise<CreateNoteFormState> {
  const projectId = String(formData.get("projectId") ?? "");
  const parentType = String(formData.get("parentType") ?? "");
  const parentId = String(formData.get("parentId") ?? "");
  const titleRaw = String(formData.get("title") ?? "");
  const clientIdRaw = String(formData.get("clientId") ?? "");
  const clientId = isUuid(clientIdRaw) ? clientIdRaw : crypto.randomUUID();

  // базовая проверка обязательных полей
  if (!projectId) return { ok: false, error: "Нет projectId", fieldErrors: {} };
  if (!parentId) return { ok: false, error: "Нет parentId", fieldErrors: {} };
  if (parentType !== "project" && parentType !== "section") {
    return { ok: false, error: "Неверный parentType", fieldErrors: {} };
  }

  const parsed = createNoteSchema.safeParse({ title: titleRaw });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      error: null,
      fieldErrors: { title: flat.fieldErrors.title?.[0] ?? "Некорректное название" },
    };
  }

  const db = await readWorkbenchDb();
  const noteId = `n-${clientId}`;
  const now = new Date().toISOString();

  // idempotent
  if (!db.notes.some((n) => n.id === noteId)) {
    db.notes.push({
      id: noteId,
      projectId,
      parentType: parentType as "project" | "section",
      parentId,
      title: parsed.data.title,
      contentHtml: "",
      updatedAt: now,
    });

    await writeWorkbenchDb(db);
  }

  return { ok: true, noteId, clientId };
}

export async function renameProjectFromForm(
  _prev: RenameProjectFormState,
  formData: FormData
): Promise<RenameProjectFormState> {
  const projectId = String(formData.get("projectId") ?? "");
  const titleRaw = String(formData.get("title") ?? "");

  if (!projectId) {
    return { ok: false, error: "Нет projectId", fieldErrors: {} };
  }

  // editTitleSchema даёт fieldErrors по “title”
  const parsed = editTitleSchema.safeParse({ title: titleRaw });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      error: null,
      fieldErrors: { title: flat.fieldErrors.title?.[0] ?? "Некорректное название" },
    };
  }

  const db = await readWorkbenchDb();
  const p = db.projects.find((x) => x.id === projectId);

  if (!p) {
    return { ok: false, error: "Проект не найден", fieldErrors: {} };
  }

  p.title = parsed.data.title;
  await writeWorkbenchDb(db);

  // сбрасываем server snapshot главной и server-projects
  revalidatePath("/");
  revalidatePath("/server-projects");
  return { ok: true, projectId, clientId: projectId };
}

export async function renameSectionFromForm(
  _prev: RenameSectionFormState,
  formData: FormData
): Promise<RenameSectionFormState> {
  const sectionId = String(formData.get("sectionId") ?? "");
  const titleRaw = String(formData.get("title") ?? "");

  if (!sectionId) {
    return { ok: false, error: "Нет sectionId", fieldErrors: {} };
  }

  const parsed = editTitleSchema.safeParse({ title: titleRaw });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      error: null,
      fieldErrors: { title: flat.fieldErrors.title?.[0] ?? "Некорректное название" },
    };
  }

  const db = await readWorkbenchDb();
  const s = db.sections.find((x) => x.id === sectionId);

  if (!s) {
    return { ok: false, error: "Секция не найдена", fieldErrors: {} };
  }

  s.title = parsed.data.title;
  s.updatedAt = new Date().toISOString();

  await writeWorkbenchDb(db);

  return { ok: true, sectionId, clientId: sectionId };
}

export async function renameNoteFromForm(
  _prev: RenameNoteFormState,
  formData: FormData
): Promise<RenameNoteFormState> {
  const noteId = String(formData.get("noteId") ?? "");
  const titleRaw = String(formData.get("title") ?? "");

  if (!noteId) {
    return { ok: false, error: "Нет noteId", fieldErrors: {} };
  }

  // для inline-rename используем titleSchema
  const parsedTitle = titleSchema.safeParse(titleRaw);
  if (!parsedTitle.success) {
    return {
      ok: false,
      error: null,
      fieldErrors: { title: parsedTitle.error.issues[0]?.message ?? "Некорректное название" },
    };
  }

  const db = await readWorkbenchDb();
  const n = db.notes.find((x) => x.id === noteId);

  if (!n) {
    return { ok: false, error: "Заметка не найдена", fieldErrors: {} };
  }

  n.title = parsedTitle.data;
  n.updatedAt = new Date().toISOString();

  await writeWorkbenchDb(db);

  return { ok: true, noteId, clientId: noteId };
}

export async function deleteProjectFromForm(
  _prev: DeleteProjectFormState,
  formData: FormData
): Promise<DeleteProjectFormState> {
  const projectId = String(formData.get("projectId") ?? "");

  if (!projectId) {
    return { ok: false, error: "Нет projectId" };
  }

  const db = await readWorkbenchDb();

  // idempotent
  const existed = db.projects.some((p) => p.id === projectId);
  if (existed) {
    db.projects = db.projects.filter((p) => p.id !== projectId);
    db.sections = db.sections.filter((s) => s.projectId !== projectId);
    db.notes = db.notes.filter((n) => n.projectId !== projectId);
    await writeWorkbenchDb(db);
  }

  // сбрасываем server snapshot главной и server-projects
  revalidatePath("/");
  revalidatePath("/server-projects");
  return { ok: true, projectId };
}

export async function deleteSectionFromForm(
  _prev: DeleteSectionFormState,
  formData: FormData
): Promise<DeleteSectionFormState> {
  const sectionId = String(formData.get("sectionId") ?? "");

  if (!sectionId) {
    return { ok: false, error: "Нет sectionId" };
  }

  const db = await readWorkbenchDb();

  // idempotent
  const existed = db.sections.some((s) => s.id === sectionId);
  if (existed) {
    db.sections = db.sections.filter((s) => s.id !== sectionId);
    db.notes = db.notes.filter((n) => !(n.parentType === "section" && n.parentId === sectionId));
    await writeWorkbenchDb(db);
  }

  return { ok: true, sectionId };
}

export async function deleteNoteFromForm(
  _prev: DeleteNoteFormState,
  formData: FormData
): Promise<DeleteNoteFormState> {
  const noteId = String(formData.get("noteId") ?? "");

  if (!noteId) {
    return { ok: false, error: "Нет noteId" };
  }

  const db = await readWorkbenchDb();

  // idempotent
  const existed = db.notes.some((n) => n.id === noteId);
  if (existed) {
    db.notes = db.notes.filter((n) => n.id !== noteId);
    await writeWorkbenchDb(db);
  }

  return { ok: true, noteId };
}