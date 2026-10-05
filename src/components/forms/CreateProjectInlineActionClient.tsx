// src/components/forms/CreateProjectInlineActionClient.tsx
'use client'

import {useRouter} from 'next/navigation'
import {useActionState, useEffect, useMemo, useRef, useState} from 'react'

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
	const {insertProjectLocal} = useWorkbenchStore()

	const [title, setTitle] = useState('')
	const [structure, setStructure] = useState<Project['structure']>('entries')

	// clientId отправляется на сервер как часть FormData.
	// Позже пригодится для связки optimistic и серверного id.
	const clientId = useMemo(() => crypto.randomUUID(), [])

	// Запоминаем, что именно отправили, чтобы после ok-состояния собрать Project для local insert.
	const lastSubmittedRef = useRef<{
		title: string
		structure: Project['structure']
	} | null>(null)

	// Защита от повторной обработки одного и того же ok-состояния.
	const handledClientIdRef = useRef<string | null>(null)

	// Защита от повторного submit, пока предыдущая отправка ещё обрабатывается.
	// Это особенно важно для inline-форм, где один пользовательский жест
	// может косвенно вызвать повторную отправку.
	const submitLockRef = useRef(false)

	// useActionState даёт state (контракт результата), formAction (вызов action),
	// isPending (индикатор блокировки UI).
	const [state, formAction, isPending] = useActionState<
		CreateProjectFormState,
		FormData
	>(createProjectFromForm, createProjectFormInitialState)

	// После завершения action снова разрешаем submit.
	// Это нужно и после успеха, и после серверной ошибки валидации.
	useEffect(() => {
		if (!isPending) {
			submitLockRef.current = false
		}
	}, [isPending])

	useEffect(() => {
		// Успех обрабатывается один раз: добавляем проект в store и переходим в workspace.
		if (!state.ok) return

		const {projectId, clientId: returnedClientId} = state.value

		if (handledClientIdRef.current === returnedClientId) return
		handledClientIdRef.current = returnedClientId

		const submitted = lastSubmittedRef.current
		if (!submitted) return

		// Связываем server id и клиентские данные формы.
		insertProjectLocal({
			id: projectId,
			title: submitted.title,
			structure: submitted.structure,
			createdAt: new Date().toISOString(),
			isDemo: false,
		})

		router.push(`/p/${projectId}`)
		onCancel()
	}, [state, insertProjectLocal, router, onCancel])

	return (
		<div className="app-card">
			<form
				action={formAction}
				className="flex flex-col gap-3 sm:flex-row sm:items-end"
				onSubmit={(e) => {
					// Если submit уже запущен — второй вызов формы не отправляем.
					if (submitLockRef.current) {
						e.preventDefault()
						return
					}

					// Блокируем повторный submit до завершения Server Action.
					submitLockRef.current = true

					// UI-очистка при submit без setState-эффектов по результату.
					const t = title.trim()
					lastSubmittedRef.current = {title: t, structure}
					setTitle('')
				}}
			>
				{/* action читает эти поля из FormData */}
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
							// Escape отменяет inline-режим без сабмита.
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
