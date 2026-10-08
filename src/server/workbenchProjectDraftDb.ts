// src/server/workbenchProjectDraftDb.ts
import {promises as fs} from 'fs'
import path from 'path'

export type ProjectDraft = {
	clientId: string
	title: string
	structure: Project['structure']
	updatedAt: string
}

export type ProjectDraftDb = {
	items: ProjectDraft[]
}

const DATA_DIR = path.join(process.cwd(), '.data')
const DB_PATH = path.join(DATA_DIR, 'workbench-project-drafts.json')

// Гарантируем папку .data, чтобы чтение/запись не падали на первом запуске
async function ensureDataDir() {
	await fs.mkdir(DATA_DIR, {recursive: true})
}

export async function readProjectDraftDb(): Promise<ProjectDraftDb> {
	await ensureDataDir()

	try {
		const raw = await fs.readFile(DB_PATH, 'utf8')
		const parsed = JSON.parse(raw) as Partial<ProjectDraftDb>

		// Нормализация: сервер всегда возвращает полный формат
		return {
			items: Array.isArray(parsed.items) ? parsed.items : [],
		}
	} catch {
		// Первый запуск: файла нет или он битый → пустая база
		const seeded: ProjectDraftDb = {items: []}
		await writeProjectDraftDb(seeded)
		return seeded
	}
}

export async function writeProjectDraftDb(db: ProjectDraftDb): Promise<void> {
	await ensureDataDir()
	// Храним файл читабельным: удобно дебажить во время курса
	await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8')
}
