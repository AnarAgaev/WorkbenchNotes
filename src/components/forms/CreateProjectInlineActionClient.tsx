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
import {saveProjectDraftAction} from '@/server/actions/workbenchProjectDraftActions'

type DraftStatus = 'idle' | 'saving' | 'saved' | 'error'

function Spinner() {
	return (
		<span className="inline-block h-3 w-3 animate-spin rounded-full border border-slate-400 border-t-transparent align-[-2px]" />
	)
}

function DraftStatusBadge({
	status,
	updatedAt,
}: {
	status: DraftStatus
	updatedAt: string | null
}) {
	if (status === 'idle')
		return <span className="text-xs text-slate-500">idle</span>
	if (status === 'saving')
		return <span className="text-xs text-slate-300">saving…</span>
	if (status === 'error')
		return <span className="text-xs text-rose-300">error</span>
	return (
		<span className="text-xs text-slate-300">
			saved{updatedAt ? ` • ${updatedAt}` : ''}
		</span>
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

	// clientId нужен и для optimistic-id, и для server id: p-${clientId}
	const clientId = useMemo(() => crypto.randomUUID(), [])
	const optimisticId = `p-${clientId}`

	// optimistic: делали ли вставку проекта при submit
	const hadOptimisticInsertRef = useRef(false)

	// autosave черновика: requestId последнего запущенного сохранения
	const activeDraftRequestIdRef = useRef<string | null>(null)
	const draftTimerRef = useRef<number | null>(null)

	const [draftUpdatedAt, setDraftUpdatedAt] = useState<string | null>(null)
	const [draftError, setDraftError] = useState<string | null>(null)
	const [isDraftSaving, setIsDraftSaving] = useState(false)

	const canDraftRun = useMemo(() => title.trim().length >= 2, [title])

	// derived status: не храним status отдельным useState
	const draftStatus: DraftStatus = useMemo(() => {
		if (!canDraftRun) return 'idle'
		if (isDraftSaving) return 'saving'
		if (draftError) return 'error'
		if (draftUpdatedAt) return 'saved'
		return 'idle'
	}, [canDraftRun, isDraftSaving, draftError, draftUpdatedAt])

	const [state, formAction, isPending] = useActionState<
		CreateProjectFormState,
		FormData
	>(createProjectFromForm, createProjectFormInitialState)

	const [, startTransition] = useTransition()

	// autosave черновика: title/structure → debounce → server action → updatedAt
	useEffect(() => {
		if (draftTimerRef.current) window.clearTimeout(draftTimerRef.current)

		// черновик не сохраняем, если ещё нет валидного title
		if (!canDraftRun) return

		draftTimerRef.current = window.setTimeout(() => {
			const requestId = crypto.randomUUID()
			activeDraftRequestIdRef.current = requestId

			setIsDraftSaving(true)
			setDraftError(null)

			void saveProjectDraftAction({
				clientId,
				requestId,
				title: title.trim(),
				structure,
			})
				.then((r) => {
					const rRequestId = r.ok ? r.value.requestId : r.requestId

					// игнорируем ответы старых запросов
					if (activeDraftRequestIdRef.current !== rRequestId) return

					if (!r.ok) {
						setDraftError(r.error)
						return
					}

					// updatedAt только после успеха
					setDraftUpdatedAt(r.value.updatedAt)
				})
				.catch(() => {
					if (activeDraftRequestIdRef.current !== requestId) return
					setDraftError('Network error')
				})
				.finally(() => {
					if (activeDraftRequestIdRef.current !== requestId) return
					setIsDraftSaving(false)
				})
		}, 650)

		return () => {
			if (draftTimerRef.current) window.clearTimeout(draftTimerRef.current)
		}
	}, [title, structure, clientId, canDraftRun])

	// обработка результата createProjectFromForm (optimistic create)
	useEffect(() => {
		if (state.ok) {
			hadOptimisticInsertRef.current = false

			const {projectId} = state.value

			startTransition(() => {
				router.push(`/p/${projectId}`)
				onCancel()
			})
			return
		}

		if (
			state.ok === false &&
			(state.error || state.fieldErrors.title || state.fieldErrors.structure)
		) {
			if (!hadOptimisticInsertRef.current) return

			hadOptimisticInsertRef.current = false

			startTransition(() => {
				// rollback optimistic create
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

					// optimistic create делаем только при валидном вводе
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
					<div className="flex items-center justify-between mb-1">
						<div className="wb-tree-meta">Название</div>
						<DraftStatusBadge status={draftStatus} updatedAt={draftUpdatedAt} />
					</div>

					<input
						name="title"
						value={title}
						onChange={(e) => {
							setTitle(e.target.value)
							// очищаем ошибку сразу при новом вводе, без эффектов
							if (draftError) setDraftError(null)
						}}
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

					{canDraftRun && draftError ? (
						<div className="mt-1 text-xs text-rose-300">
							Черновик: {draftError}
						</div>
					) : null}

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
						onChange={(e) => {
							setStructure(e.target.value as Project['structure'])
							if (draftError) setDraftError(null)
						}}
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
						onClick={() => {
							// отмена не должна оставлять “подвешенный” флаг optimistic
							hadOptimisticInsertRef.current = false
							onCancel()
						}}
						disabled={isPending}
					>
						Отмена
					</button>
				</div>
			</form>
		</div>
	)
}
