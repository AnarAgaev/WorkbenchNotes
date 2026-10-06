// src/server/actions/workbenchFormActions.ts
'use server'

import type {CreateProjectFormState} from '@/lib/formTypes'
import {createProjectSchema} from '@/lib/schemas'
import {readWorkbenchDb, writeWorkbenchDb} from '@/server/workbenchDb'

// минимальная проверка “похоже на uuid”, чтобы принимать clientId из формы
const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v)

// Server Action как write-точка: здесь разрешены правила и запись в серверную истину.
export async function createProjectFromForm(
	_prev: CreateProjectFormState,
	formData: FormData,
): Promise<CreateProjectFormState> {
	const rawTitle = formData.get('title')
	const rawStructure = formData.get('structure')
	const rawClientId = formData.get('clientId')

	if (typeof rawTitle !== 'string' || typeof rawStructure !== 'string') {
		return {ok: false, error: 'Некорректные данные формы', fieldErrors: {}}
	}

	// clientId нужен для совпадения optimistic-id и серверного id
	const clientIdRaw = typeof rawClientId === 'string' ? rawClientId : ''
	const clientId = isUuid(clientIdRaw) ? clientIdRaw : crypto.randomUUID()

	const parsed = createProjectSchema.safeParse({
		title: rawTitle,
		structure: rawStructure,
	})

	if (!parsed.success) {
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

	const db = await readWorkbenchDb()

	// предсказуемый id: совпадает с optimistic id на клиенте
	const projectId = `p-${clientId}`

	// idempotent: повторный submit не создаст дубль
	if (!db.projects.some((p) => p.id === projectId)) {
		db.projects.unshift({
			id: projectId,
			title: parsed.data.title,
			structure: parsed.data.structure,
			createdAt: new Date().toISOString(),
			isDemo: false,
		})

		await writeWorkbenchDb(db)
	}

	return {ok: true, value: {projectId, clientId}}
}
