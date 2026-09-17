// src/@types/demo-notes.d.ts
export {}

declare global {
	// Все типы внутри declare global - глобальные и доступны без импорта во всей папке src/demo/.

	// Семантическая строка: тип совпадает со string, но фиксирует смысл.
	// DemoNoteId — это идентификатор заметки, а не произвольный текст.
	//! DemoNoteId - это semantic alias
	type DemoNoteId = string

	// Union: только три допустимых значения вместо произвольной строки.
	type DemoNoteStatus = 'draft' | 'published' | 'archived'

	// Union: только несколько доступных значений тегов вместо произвольной строки.
	type DemoNoteTag = 'ts' | 'contracts' | 'next' | 'app-router' | 'intro'

	// Учебная сущность: заметка демо-секции.
	type DemoNote = {
		id: DemoNoteId
		title: string
		status: DemoNoteStatus
		tags: DemoNoteTag[]
	}
}
