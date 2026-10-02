// src/lib/schemas.ts
// Единый файл контрактов: схемы Zod и выведенные из них типы.
import {z} from 'zod'

export const titleSchema = z
	.string()
	.trim()
	.min(2, 'Минимум 2 символа')
	.max(80, 'Слишком длинное название')

export const createNoteSchema = z.object({
	title: titleSchema,
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>

export const createSectionSchema = z.object({
	title: titleSchema,
})

export type CreateSectionInput = z.infer<typeof createSectionSchema>

export const editTitleSchema = z.object({
	title: titleSchema,
})

export type EditTitleInput = z.infer<typeof editTitleSchema>

// Демо модуля 4: Server Actions + форма
export const formLabSchema = z.object({
	title: titleSchema,
})

export type FormLabInput = z.infer<typeof formLabSchema>

export const createProjectSchema = z.object({
	title: titleSchema,
	structure: z.enum(['entries', 'sections']),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
