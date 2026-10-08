// src/server/actions/workbenchProjectDraftActions.ts
'use server'

import {z} from 'zod'
import {titleSchema} from '@/lib/schemas'
import {
	readProjectDraftDb,
	writeProjectDraftDb,
} from '@/server/workbenchProjectDraftDb'

export type SaveProjectDraftResult =
	| {ok: true; value: {updatedAt: string; requestId: string}}
	| {ok: false; error: string; requestId: string}

const schema = z.object({
	clientId: z.string().uuid(),
	requestId: z.string().uuid(),
	title: titleSchema,
	structure: z.enum(['entries', 'sections']),
})

export async function saveProjectDraftAction(
	payload: unknown,
): Promise<SaveProjectDraftResult> {
	// Контракт: на сервер приходит unknown, дальше только safeParse.
	const parsed = schema.safeParse(payload)
	if (!parsed.success) {
		return {
			ok: false,
			error: parsed.error.issues[0]?.message ?? 'Некорректные данные',
			requestId: crypto.randomUUID(),
		}
	}

	const {clientId, requestId, title, structure} = parsed.data

	// Детерминированная ошибка для проверки status=error
	if (title.toLowerCase().includes('ошибка')) {
		return {
			ok: false,
			error: 'Сервер: слово «ошибка» запрещено в этом демо',
			requestId,
		}
	}

	// Чуть реальности: чтобы saving был заметен
	await new Promise((r) => setTimeout(r, 250))

	const db = await readProjectDraftDb()
	const updatedAt = new Date().toISOString()

	const idx = db.items.findIndex((x) => x.clientId === clientId)
	const nextItem = {clientId, title, structure, updatedAt}

	if (idx >= 0) db.items[idx] = nextItem
	else db.items.unshift(nextItem)

	await writeProjectDraftDb(db)

	return {ok: true, value: {updatedAt, requestId}}
}
