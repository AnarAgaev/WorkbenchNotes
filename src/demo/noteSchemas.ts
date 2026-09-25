// src/demo/noteSchemas.ts
import {z} from 'zod'

// Схема для одного поля title.
// Здесь живут min/max/refine и сообщения об ошибках.
export const noteTitleSchema = z
	.string()
	.trim()
	.min(1, 'Введите заголовок.')
	.max(60, 'Заголовок слишком длинный (макс. 60).')
	// refine — пример правила, которое не покрывается min/max.
	// Для input это реальная практика: двойные пробелы легко вставить.
	.refine(
		(v) => !/\s{2,}/.test(v),
		'Заголовок не должен содержать двойные пробелы.',
	)
	// Второе правило: прикладная бизнес-валидация.
	.refine(
		(v) => !/test/i.test(v),
		'Заголовок не должен содержать слово test.',
	)

// Схема для формы (объекта), даже если поле пока одно.
export const createNoteInputSchema = z.object({
	title: noteTitleSchema,
})

export type CreateNoteInput = z.infer<typeof createNoteInputSchema>
