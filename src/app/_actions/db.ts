// src/app/_actions/db.ts
'use server'

import {readWorkbenchDb} from '@/server/workbenchDb'

// Тонкий server action: отдаёт серверную истину одним снапшотом.
// Нужен для refreshFromServer() в store и для “пересинка” после мутаций.
export async function getDbSnapshot(): Promise<WorkbenchDb> {
	return await readWorkbenchDb()
}
