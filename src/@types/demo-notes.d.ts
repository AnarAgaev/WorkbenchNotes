// src/@types/demo-notes.d.ts
export {}

type TagsVariants = 'ts' | 'contracts' | 'next' | 'app-router' | 'intro'

declare global {
	// Учебная сущность: заметка демо-секции.
	// Тип глобальный — доступен без импорта во всей папке src/demo/.
	type DemoNote = {
		id: string
		title: string
		status: 'draft' | 'published'
		tags: TagsVariants[]
	}
}
