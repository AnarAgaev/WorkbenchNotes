// src/lib/schemas.ts
import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().trim().min(2, "Минимум 2 символа").max(80, "Слишком длинное название"),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const titleSchema = z
  .string()
  .trim()
  .min(2, "Минимум 2 символа")
  .max(80, "Слишком длинное название");

export const createSectionSchema = z.object({
  title: titleSchema,
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;

export const editTitleSchema = z.object({
  title: titleSchema,
});

export type EditTitleInput = z.infer<typeof editTitleSchema>;

// Демо Модуля 4: useActionState + Server Action
export const formLabSchema = z.object({
  title: titleSchema,
});
export type FormLabInput = z.infer<typeof formLabSchema>;

// Базовые
export const IdSchema = z.string().min(1);

export const ProjectStructureSchema = z.enum(["entries", "sections"]);
export const NoteParentTypeSchema = z.enum(["project", "section"]);

// Сущности (совпадают с global types)
export const ProjectEntitySchema = z.object({
  id: IdSchema,
  title: z.string().trim().min(2).max(80),
  createdAt: z.string().min(1),
  structure: ProjectStructureSchema,
  isDemo: z.boolean().optional(),
});

export const SectionEntitySchema = z.object({
  id: IdSchema,
  projectId: IdSchema,
  title: z.string().trim().min(2).max(80),
  order: z.number().int().min(0),
});

export const NoteEntitySchema = z.object({
  id: IdSchema,
  projectId: IdSchema,
  parentType: NoteParentTypeSchema,
  parentId: IdSchema,
  title: z.string().trim().min(2).max(120),
  contentHtml: z.string(),
  updatedAt: z.string().min(1),
});

export const WorkbenchDbSchema = z.object({
  projects: z.array(ProjectEntitySchema),
  sections: z.array(SectionEntitySchema),
  notes: z.array(NoteEntitySchema),
});

// Payload schemas для server actions
export const CreateProjectPayloadSchema = z.object({ project: ProjectEntitySchema });
export const RenameProjectPayloadSchema = z.object({
  projectId: IdSchema,
  title: z.string().trim().min(2).max(80),
});
export const DeleteProjectPayloadSchema = z.object({ projectId: IdSchema });

export const CreateSectionPayloadSchema = z.object({ section: SectionEntitySchema });
export const RenameSectionPayloadSchema = z.object({
  sectionId: IdSchema,
  title: z.string().trim().min(2).max(80),
});
export const DeleteSectionPayloadSchema = z.object({ sectionId: IdSchema });

export const CreateNotePayloadSchema = z.object({ note: NoteEntitySchema });
export const RenameNotePayloadSchema = z.object({
  noteId: IdSchema,
  title: z.string().trim().min(2).max(120),
});
export const DeleteNotePayloadSchema = z.object({ noteId: IdSchema });
export const UpdateNoteContentPayloadSchema = z.object({
  noteId: IdSchema,
  contentHtml: z.string(),
  updatedAt: z.string().min(1),
});

export const SectionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  order: z.number(),
  createdAt: z.string().datetime().optional(),
});
