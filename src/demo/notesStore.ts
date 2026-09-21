// src/demo/notesStore.ts
// Учебное хранилище заметок в памяти процесса.
// Здесь важна не база данных, а типобезопасный доступ по DemoNoteId.

const notes: DemoNote[] = [
	{id: 'n1', title: 'Первая заметка', status: 'draft', tags: ['intro']},
	{
		id: 'n2',
		title: 'TypeScript = ограничения',
		status: 'published',
		tags: ['ts', 'contracts'],
	},
	{
		id: 'n3',
		title: 'Граница server/client',
		status: 'published',
		tags: ['next', 'app-router'],
	},
]

export function getNotes(): DemoNote[] {
	// Возвращаем копию, чтобы внешняя логика не могла мутировать массив.
	return [...notes]
}

export function getNoteById(id: DemoNoteId): DemoNote | null {
	return notes.find((n) => n.id === id) ?? null
}
