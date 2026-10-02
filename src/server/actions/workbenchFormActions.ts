// src/server/actions/workbenchFormActions.ts
'use server'

import {v4 as uuid} from 'uuid'
import type {CreateProjectFormState} from '@/lib/formTypes'
import {createProjectSchema} from '@/lib/schemas'
import {readWorkbenchDb, writeWorkbenchDb} from '@/server/workbenchDb'

// Server Action как write-точка: здесь разрешены правила и запись в серверную истину.
// UI передаёт FormData, сервер валидирует, меняет JSON и возвращает структурированный результат.
export async function createProjectFromForm(
	_prev: CreateProjectFormState,
	formData: FormData,
): Promise<CreateProjectFormState> {
	// Контракт формы: в action приходят “сырые” значения из FormData.
	const rawTitle = formData.get('title')
	const rawStructure = formData.get('structure')

	// Защита от некорректного ввода (например, если name потеряли или подменили)
	if (typeof rawTitle !== 'string' || typeof rawStructure !== 'string') {
		return {ok: false, error: 'Некорректные данные формы', fieldErrors: {}}
	}

	// Валидация на сервере — источник истины (клиент может ошибаться или быть отключён).
	const parsed = createProjectSchema.safeParse({
		title: rawTitle,
		structure: rawStructure,
	})

	if (!parsed.success) {
		// Унифицированный формат ошибок: fieldErrors для полей + error для общей ошибки.
		const flat = parsed.error.flatten()

		return {
			ok: false,
			error: null,
			fieldErrors: {
				title: flat.fieldErrors.title?.[0],
				structure: flat.fieldErrors.structure?.[0],
			},
		}
	}

	// Читаем актуальную серверную истину
	const db = await readWorkbenchDb()

	// id создаётся на сервере: UI не решает, как генерировать идентификаторы.
	const projectId = `p-${uuid()}`
	const now = new Date().toISOString()

	// Мутация: добавляем проект в начало списка (новые сверху)
	db.projects.unshift({
		id: projectId,
		title: parsed.data.title,
		structure: parsed.data.structure,
		createdAt: now,
		isDemo: false,
	})

	// Запись: только action пишет в JSON db
	await writeWorkbenchDb(db)

	// Возвращаем то, что нужно UI: projectId для перехода /p/[id].
	return {ok: true, value: {projectId, clientId: uuid()}}
}
