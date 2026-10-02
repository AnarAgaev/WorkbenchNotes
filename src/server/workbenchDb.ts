// src/server/workbenchDb.ts
import {promises as fs} from 'fs'
import path from 'path'
import {getDefaultDb} from '@/data/demo'

const DATA_DIR = path.join(process.cwd(), '.data')
const DB_PATH = path.join(DATA_DIR, 'workbench-db.json')

// Гарантируем папку .data, чтобы чтение/запись не падали на первом запуске
async function ensureDataDir() {
	await fs.mkdir(DATA_DIR, {recursive: true})
}

export async function readWorkbenchDb(): Promise<WorkbenchDb> {
	await ensureDataDir()

	try {
		const raw = await fs.readFile(DB_PATH, 'utf8')
		const parsed = JSON.parse(raw) as Partial<WorkbenchDb>

		// Нормализация: сервер всегда возвращает полный WorkbenchDb,
		// даже если файл был старый/частичный.
		const normalized: WorkbenchDb = {
			projects: Array.isArray(parsed.projects) ? parsed.projects : [],
			sections: Array.isArray(parsed.sections) ? parsed.sections : [],
			notes: Array.isArray(parsed.notes) ? parsed.notes : [],
		}

		// Если серверная БД пустая, считаем это первым запуском и сидим demo-данные.
		// Это убирает эффект демо мелькнуло и исчезло после refreshFromServer().
		const isEmpty =
			normalized.projects.length === 0 &&
			normalized.sections.length === 0 &&
			normalized.notes.length === 0

		if (isEmpty) {
			const seeded = getDefaultDb()
			await writeWorkbenchDb(seeded)
			return seeded
		}

		// Авто-починка: если в файле не было sections/notes, переписываем в полный формат.
		const needsFix =
			!Array.isArray(parsed.sections) || !Array.isArray(parsed.notes)
		if (needsFix) {
			await writeWorkbenchDb(normalized)
		}

		return normalized
	} catch {
		// Первый запуск: файла нет или он битый → сидим demo-db и пишем его на диск.
		const seeded = getDefaultDb()
		await writeWorkbenchDb(seeded)
		return seeded
	}
}

export async function writeWorkbenchDb(db: WorkbenchDb): Promise<void> {
	await ensureDataDir()
	// Храним файл читабельным: удобно дебажить на этапе курса.
	await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8')
}
