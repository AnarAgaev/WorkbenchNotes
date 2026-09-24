// src/app/(demo)/demo-form/FormContractClient.tsx
'use client'

import {useMemo, useState} from 'react'
import {type DemoFormState, validateTitle} from '@/demo/formContract'
import {submitTitleServer} from '@/demo/formSubmit'

// Учебная форма: показывает 4 состояния.
// Здесь нет внешней проверки — pending и success имитируются таймером.
export default function FormContractClient() {
	const [title, setTitle] = useState('')
	const [touched, setTouched] = useState(false)
	const [state, setState] = useState<DemoFormState>({kind: 'idle'})

	// derived state: ошибка вычисляется из текущего title,
	// а не хранится отдельным useState (меньше рассинхронизаций).
	const titleError = useMemo(() => {
		if (!touched) return null

		return validateTitle(title)
	}, [title, touched])

	const isPending = state.kind === 'pending'
	const isDisabled = isPending || Boolean(titleError)

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		setTouched(true)

		// 1) Client UX: быстрый фидбек, не запускаем отправку
		if (titleError) {
			setState({kind: 'error', errors: {fieldErrors: {title: titleError}}})
			return
		}

		// 2) pending
		setState({kind: 'pending'})

		// 3) Вторая проверка вне UI
		const res = await submitTitleServer(title)

		if (!res.ok) {
			setState({kind: 'error', errors: res.errors})
			return
		}

		setState({
			kind: 'success',
			message: `Заметка создана (demo): ${res.data.normalizedTitle}`,
		})
	}

	function reset() {
		setTitle('')
		setTouched(false)
		setState({kind: 'idle'})
	}

	const formError = state.kind === 'error' ? state.errors.formError : null
	const serverFieldError =
		state.kind === 'error' ? (state.errors.fieldErrors?.title ?? null) : null

	const fieldTitleError = titleError ?? serverFieldError

	return (
		<section className="mt-6 app-card">
			<h2 className="text-sm font-semibold">demo-form</h2>

			<p className="mt-2 text-sm muted">
				Цель: увидеть в UI состояния errors, pending, disable, success state.
			</p>

			{formError ? (
				<div className="mt-4 app-card app-card--soft">
					<div className="font-semibold text-rose-700">Ошибка формы</div>
					<p className="muted mt-1 text-sm">{formError}</p>
				</div>
			) : null}

			<form onSubmit={onSubmit} className="mt-4 space-y-3">
				<label className="block">
					<div className="text-sm">Заголовок</div>

					<input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						onBlur={() => setTouched(true)}
						disabled={isPending}
						className="app-input mt-1"
						placeholder="Например: Первая заметка"
					/>

					{titleError ? (
						<div className="app-field-error">{titleError}</div>
					) : (
						<div className="mt-1 text-sm muted">Максимум 60 символов.</div>
					)}
				</label>

				<div className="flex flex-wrap items-center gap-2">
					<button
						type="submit"
						disabled={isDisabled}
						className="app-btn app-btn-primary"
					>
						{isPending ? 'Отправка...' : 'Создать'}
					</button>

					<button
						type="button"
						onClick={reset}
						disabled={isPending}
						className="app-btn app-btn-ghost"
					>
						Сбросить
					</button>
				</div>

				{/* ===== Сообщения состояния ===== */}
				{state.kind === 'success' ? (
					<div className="app-card app-card--soft">
						<div className="font-semibold text-emerald-700">Успешно</div>
						<p className="muted mt-1 text-sm">{state.message}</p>
					</div>
				) : null}

				{state.kind === 'pending' ? (
					<div className="app-card app-card--soft">
						<div className="font-semibold">Отправка</div>
						<p className="muted mt-1 text-sm">
							Запрос выполняется. Кнопка заблокирована, повторный submit не
							нужен.
						</p>
					</div>
				) : null}
			</form>
		</section>
	)
}
