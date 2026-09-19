// src/@types/notes.d.ts
export {}

declare global {
	// Универсальный идентификатор: семантический псевдоним string.
	// Используется везде — у проектов, разделов и заметок.
	type Id = string

	// Два варианта структуры проекта:
	// "entries" — плоский список заметок (проект → заметки)
	// "sections" — заметки внутри разделов (проект → разделы → заметки)
	type ProjectStructure = 'entries' | 'sections'

	// Заметка привязана либо к проекту, либо к разделу.
	// Поле parentType фиксирует, к чему именно.
	type NoteParentType = 'project' | 'section'

	interface Project {
		id: Id
		title: string
		createdAt: string // ISO-строка: безопасно проходит через server→client
		structure: ProjectStructure
		isDemo?: boolean // помечаем демо-проекты, чтобы держать их сверху списка
	}

	interface Section {
		id: Id
		projectId: Id // связь с проектом через Id
		title: string
		order: number // порядок отображения разделов
		createdAt?: string
		updatedAt?: string
	}

	interface Note {
		id: Id
		projectId: Id
		parentType: NoteParentType
		parentId: Id // id проекта или раздела — зависит от parentType
		title: string
		contentHtml: string
		updatedAt: string // ISO-строка
	}

	// Общая форма базы данных в памяти.
	// Все сущности хранятся плоско — связи через Id, а не вложенность.
	interface WorkbenchDb {
		projects: Project[]
		sections: Section[]
		notes: Note[]
	}
}
