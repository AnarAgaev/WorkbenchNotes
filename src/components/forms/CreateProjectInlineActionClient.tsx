// src/components/forms/CreateProjectInlineActionClient.tsx
'use client'

import {useRouter} from 'next/navigation'
import {
	useActionState,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition,
} from 'react'

import {createProjectFormInitialState} from '@/lib/formStates'
import type {CreateProjectFormState} from '@/lib/formTypes'
import {useWorkbenchStore} from '@/lib/workbenchStore'
import {createProjectFromForm} from '@/server/actions/workbenchFormActions'

function Spinner() {
	return (
		<span className="inline-block h-3 w-3 animate-spin rounded-full border border-slate-400 border-t-transparent align-[-2px]" />
	)
}

export default function CreateProjectInlineActionClient({
	onCancel,
}: {
	onCancel: () => void
}) {
	const router = useRouter()
	const store = useWorkbenchStore()

	const [title, setTitle] = useState('')
	const [structure, setStructure] = useState<Project['structure']>('entries')

	// clientId нужен, чтобы optimistic-id совпал с серверным id: p-${clientId}
	const clientId = useMemo(() => crypto.randomUUID(), [])
	const optimisticId = `p-${clientId}`

	// флаг: делали ли optimistic-вставку в текущем submit
	// ref читается только в эффектах/хендлерах, не в render
	const hadOptimisticInsertRef = useRef(false)

	const [state, formAction, isPending] = useActionState<
		CreateProjectFormState,
		FormData
	>(createProjectFromForm, createProjectFormInitialState)

	const [, startTransition] = useTransition()

	useEffect(() => {
		if (state.ok) {
			// успех: проект уже есть в store (optimistic),
			// остаётся перейти в workspace и закрыть инлайн
			hadOptimisticInsertRef.current = false

			const {projectId} = state.value
			startTransition(() => {
				router.push(`/p/${projectId}`)
				onCancel()
			})

			return
		}

		// ошибка: откатываем optimistic-проект, если он был вставлен
		if (
			state.ok === false &&
			(state.error || state.fieldErrors.title || state.fieldErrors.structure)
		) {
			if (!hadOptimisticInsertRef.current) return

			hadOptimisticInsertRef.current = false

			startTransition(() => {
				// rollback локального optimistic-результата
				// deleteProject удалит проект и связанные данные из in-memory db
				store.deleteProject(optimisticId)
			})
		}
	}, [state, router, onCancel, startTransition, store, optimisticId])

	return (
		<div className="app-card">
			<form
				action={formAction}
				className="flex flex-col gap-3 sm:flex-row sm:items-end"
				onSubmit={() => {
					const t = title.trim()

					// optimistic делаем только при валидном вводе,
					// иначе пусть сервер вернёт fieldErrors без локальных вставок
					if (t.length < 2) {
						hadOptimisticInsertRef.current = false
						return
					}

					hadOptimisticInsertRef.current = true

					startTransition(() => {
						store.insertProjectLocal({
							id: optimisticId,
							title: t,
							structure,
							createdAt: new Date().toISOString(),
							isDemo: false,
						})
					})
				}}
			>
				<input type="hidden" name="clientId" value={clientId} />
				<input type="hidden" name="structure" value={structure} />

				<div className="flex-1">
					<div className="wb-tree-meta mb-1">Название</div>

					<input
						name="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Например: Мои заметки…"
						className={`app-input w-full ${
							state.ok === false && (state.fieldErrors.title || state.error)
								? 'ring-1 ring-rose-500/60'
								: ''
						}`}
						autoComplete="off"
						disabled={isPending}
						onKeyDown={(e) => {
							if (e.key === 'Escape') {
								e.preventDefault()
								onCancel()
							}
						}}
					/>

					{state.ok === false && state.fieldErrors.title ? (
						<div className="mt-1 text-xs text-rose-300">
							{state.fieldErrors.title}
						</div>
					) : state.ok === false && state.error ? (
						<div className="mt-1 text-xs text-rose-300">{state.error}</div>
					) : (
						<div className="mt-1 text-xs text-slate-500">
							Подсказка: минимум 2 символа.
						</div>
					)}
				</div>

				<div className="sm:w-64">
					<div className="wb-tree-meta mb-1">Тип проекта</div>

					<select
						className="app-input w-full"
						value={structure}
						onChange={(e) =>
							setStructure(e.target.value as Project['structure'])
						}
						disabled={isPending}
					>
						<option value="entries">Заметки</option>
						<option value="sections">Вложенные заметки</option>
					</select>
				</div>

				<div className="flex gap-2 sm:w-56">
					<button
						type="submit"
						className={`app-btn flex-1 ${isPending ? 'opacity-70' : ''}`}
						disabled={title.trim().length === 0 || isPending}
					>
						{isPending ? (
							<>
								<Spinner /> <span className="ml-2">Создание…</span>
							</>
						) : (
							'Создать'
						)}
					</button>

					<button
						type="button"
						className="app-btn app-btn-ghost flex-1"
						onClick={onCancel}
						disabled={isPending}
					>
						Отмена
					</button>
				</div>
			</form>
		</div>
	)
}
