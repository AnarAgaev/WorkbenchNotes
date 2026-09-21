// src/@types/demo-notes.d.ts
export {}

declare global {
	// Все типы внутри declare global - глобальные и доступны без импорта во всей папке src/demo/.

	// Семантическая строка: тип совпадает со string, но фиксирует смысл.
	// DemoNoteId — это идентификатор заметки, а не произвольный текст.
	//! DemoNoteId - это semantic alias
	type DemoNoteId = string

	type IsoDateString = string

	// Union: только три допустимых значения вместо произвольной строки.
	type DemoNoteStatus = 'draft' | 'published' | 'archived'

	// Union: только несколько доступных значений тегов вместо произвольной строки.
	type DemoNoteTag = 'ts' | 'contracts' | 'next' | 'app-router' | 'intro'

	// Сущность демо: внутри проекта поля всегда определены.
	// Это снижает количество защитного кода в UI.
	type DemoNote = {
		id: DemoNoteId
		title: string

		status: DemoNoteStatus
		priority: DemoNotePriority

		tags: DemoNoteTag[]
		description: string

		createdAt: IsoDateString
		updatedAt: IsoDateString
	}

	type DemoNotePriority = 1 | 2 | 3

	// Входной формат: на границе поля могут отсутствовать.
	// Этот тип удобен для сборки сущности через дефолты.
	type DemoNoteCreateInput = {
		title: string
		status?: DemoNoteStatus
		priority?: DemoNotePriority
		tags?: string[]
		description?: string
	}
}
