// src/demo/notesStore.ts
// Учебное хранилище заметок в памяти процесса.
// Здесь важна не база данных, а типобезопасный доступ по DemoNoteId.

// Фиксированная дата: мок-данные одинаковы между запусками и сборками.
const SEED_DATE: IsoDateString = '2026-01-01T00:00:00.000Z'

const notes: DemoNote[] = [
	{
		id: 'n1',
		title: 'Первая заметка',
		status: 'draft',
		priority: 1,
		tags: ['intro'],
		description: '',
		createdAt: SEED_DATE,
		updatedAt: SEED_DATE,
	},
	{
		id: 'n2',
		title: 'TypeScript = ограничения',
		status: 'published',
		priority: 2,
		tags: ['ts', 'contracts'],
		description: '',
		createdAt: SEED_DATE,
		updatedAt: SEED_DATE,
	},
	{
		id: 'n3',
		title: 'Граница server/client',
		status: 'published',
		priority: 3,
		tags: ['next', 'app-router'],
		description: '',
		createdAt: SEED_DATE,
		updatedAt: SEED_DATE,
	},
]

export function getNotes(): DemoNote[] {
	// Возвращаем копию, чтобы внешняя логика не могла мутировать массив.
	return [...notes]
}

export function getNoteById(id: DemoNoteId): DemoNote | null {
	return notes.find((n) => n.id === id) ?? null
}
