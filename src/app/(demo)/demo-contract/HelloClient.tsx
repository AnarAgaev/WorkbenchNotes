// src/app/(demo)/demo-contract/HelloClient.tsx
'use client'

import {useMemo, useState} from 'react'
import type {HelloPayload} from '@/demo/contracts'
import type {Loadable} from '@/demo/loadable'
import {assertNever} from '@/demo/loadable'

type Props = {
	payload: HelloPayload
}

// Имитирует загрузку данных: иногда возвращает ошибку.
// Здесь важна не сеть, а состояния UI и контракт данных.
function fakeLoadNotes(source: DemoNote[]): Promise<DemoNote[]> {
	return new Promise((resolve, reject) => {
		window.setTimeout(() => {
			if (Math.random() < 0.2) {
				reject(new Error('Не удалось загрузить заметки. Повторите попытку.'))
				return
			}
			resolve(source)
		}, 500)
	})
}

export default function HelloClient({payload}: Props) {
	const [clicks, setClicks] = useState(0)

	// notes доступны только когда state === "ready"
	const [notes, setNotes] = useState<Loadable<DemoNote[]>>({
		state: 'ready',
		data: payload.initialNotes,
	})

	const renderedLabel = useMemo(() => {
		return `${payload.appName} / ${payload.mode}`
	}, [payload.appName, payload.mode])

	async function reloadNotes() {
		setNotes({state: 'loading'})

		try {
			const loaded = await fakeLoadNotes(payload.initialNotes)
			setNotes({state: 'ready', data: loaded})
		} catch (e) {
			const message =
				e instanceof Error ? e.message : 'Неизвестная ошибка загрузки.'
			setNotes({state: 'error', message})
		}
	}

	// TypeScript "ведёт" код: нельзя обратиться к data, если state не ready.
	function renderNotes(state: Loadable<DemoNote[]>) {
		switch (state.state) {
			case 'idle':
				return (
					<p className="text-sm text-slate-400">Заметки ещё не загружались.</p>
				)

			case 'loading':
				return <p className="text-sm text-slate-400">Загрузка…</p>

			case 'error':
				return <p className="text-sm text-red-400">{state.message}</p>

			case 'ready':
				return (
					<ul className="space-y-1 text-sm">
						{state.data.map((n) => (
							<li key={n.id}>
								<span className="font-medium">{n.title}</span>{' '}
								<span className="text-slate-500">({n.id})</span>
							</li>
						))}
					</ul>
				)

			default:
				// Новое состояние без обработки → ошибка компиляции, а не молчаливый баг.
				return assertNever(state)
		}
	}

	return (
		<section className="rounded-xl border border-slate-700 p-5">
			<p className="text-sm text-slate-400">{renderedLabel}</p>

			<div className="mt-3 text-sm">
				renderedAt: <code className="font-mono">{payload.renderedAt}</code>
			</div>

			<div className="mt-4">{renderNotes(notes)}</div>

			<div className="mt-4 flex flex-wrap gap-2">
				<button
					type="button"
					className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white"
					onClick={() => setClicks((c) => c + 1)}
				>
					Clicks: {clicks}
				</button>

				<button
					type="button"
					className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-200"
					onClick={reloadNotes}
					// Ограничение в UI повторяет ограничение типа:
					// пока loading — повторный запрос невозможен.
					disabled={notes.state === 'loading'}
				>
					Reload notes
				</button>
			</div>
		</section>
	)
}
