// src/app/(demo)/state-lab/state-lab-client.tsx
'use client'

import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useMemo, useState, useTransition} from 'react'
import {useWorkbenchStore} from '@/lib/workbenchStore'

type Tab = 'local' | 'url' | 'store'

function asTab(value: string | null): Tab {
	if (value === 'local' || value === 'url' || value === 'store') return value
	return 'local'
}

function setParam(sp: URLSearchParams, key: string, value: string | null) {
	const next = new URLSearchParams(sp.toString())
	if (value === null) next.delete(key)
	else next.set(key, value)
	return next
}

export default function StateLabClient() {
	// --- Local state (не шарится, живёт только в этом компоненте)
	const [localCount, setLocalCount] = useState(0)
	const [localShowHint, setLocalShowHint] = useState(true)

	// --- URL state (истина в адресной строке)
	const sp = useSearchParams()
	const pathname = usePathname()
	const router = useRouter()
	const [, startTransition] = useTransition()

	const tab = asTab(sp.get('tab'))
	const urlCount = Number(sp.get('n') ?? '0') || 0

	// --- Store state (доменные данные приложения)
	const {db} = useWorkbenchStore()

	const storeStats = useMemo(() => {
		const projects = db.projects.length
		const sections = db.sections.length
		const notes = db.notes.length

		// derived state: вычисляемое, не храним отдельно
		const lastNote = [...db.notes]
			.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
			.at(0)

		return {
			projects,
			sections,
			notes,
			lastNoteTitle: lastNote?.title ?? '—',
			lastNoteUpdatedAt: lastNote?.updatedAt ?? null,
		}
	}, [db.notes, db.projects, db.sections])

	const setUrlTab = (t: Tab) => {
		const next = setParam(sp, 'tab', t)
		startTransition(() =>
			router.replace(`${pathname}?${next.toString()}`, {scroll: false}),
		)
	}

	const setUrlCount = (n: number) => {
		const next = setParam(sp, 'n', String(n))
		startTransition(() =>
			router.replace(`${pathname}?${next.toString()}`, {scroll: false}),
		)
	}

	const resetUrl = () => {
		startTransition(() => router.replace(pathname, {scroll: false}))
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-lg font-semibold text-slate-100">
					Demo: State Lab
				</h1>
				<p className="wb-tree-meta mt-1">
					Сравнение трёх видов состояния: <code>local</code>, <code>URL</code>,{' '}
					<code>store</code>.
				</p>
			</div>

			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					className={`app-btn ${
						tab === 'local' ? 'app-btn--primary' : 'app-btn--soft'
					}`}
					onClick={() => setUrlTab('local')}
				>
					Local state
				</button>

				<button
					type="button"
					className={`app-btn ${
						tab === 'url' ? 'app-btn--primary' : 'app-btn--soft'
					}`}
					onClick={() => setUrlTab('url')}
				>
					URL state
				</button>

				<button
					type="button"
					className={`app-btn ${
						tab === 'store' ? 'app-btn--primary' : 'app-btn--soft'
					}`}
					onClick={() => setUrlTab('store')}
				>
					Store state
				</button>

				<button
					type="button"
					className="app-btn app-btn--soft"
					onClick={resetUrl}
				>
					Reset URL
				</button>
			</div>

			{tab === 'local' && (
				<section className="app-section">
					<div className="app-section__head">
						<div>
							<div className="text-sm font-semibold text-slate-100">
								Local state
							</div>
							<div className="wb-tree-meta mt-1">
								Живёт только внутри компонента. Не шарится. Сбрасывается при
								перезагрузке.
							</div>
						</div>
					</div>

					<div className="app-card app-card--soft p-4 space-y-3">
						<div className="text-sm text-slate-200">
							localCount: <span className="font-semibold">{localCount}</span>
						</div>

						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								className="app-btn app-btn--primary"
								onClick={() => setLocalCount((x) => x + 1)}
							>
								+1
							</button>
							<button
								type="button"
								className="app-btn app-btn--soft"
								onClick={() => setLocalCount(0)}
							>
								reset
							</button>
							<button
								type="button"
								className="app-btn app-btn--soft"
								onClick={() => setLocalShowHint((v) => !v)}
							>
								toggle hint
							</button>
						</div>

						{localShowHint && (
							<div className="wb-tree-meta">
								Подсказка: local state подходит для мелкого UI, который не
								должен жить в URL и не нужен всему приложению.
							</div>
						)}
					</div>
				</section>
			)}

			{tab === 'url' && (
				<section className="app-section">
					<div className="app-section__head">
						<div>
							<div className="text-sm font-semibold text-slate-100">
								URL state
							</div>
							<div className="wb-tree-meta mt-1">
								Истина в адресной строке: можно делиться ссылкой, сохранять,
								восстанавливать состояние.
							</div>
						</div>
					</div>

					<div className="app-card app-card--soft p-4 space-y-3">
						<div className="text-sm text-slate-200">
							tab: <span className="font-semibold">{tab}</span>
						</div>
						<div className="text-sm text-slate-200">
							n (from URL): <span className="font-semibold">{urlCount}</span>
						</div>

						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								className="app-btn app-btn--primary"
								onClick={() => setUrlCount(urlCount + 1)}
							>
								n + 1
							</button>
							<button
								type="button"
								className="app-btn app-btn--soft"
								onClick={() => setUrlCount(0)}
							>
								n = 0
							</button>
							<button
								type="button"
								className="app-btn app-btn--soft"
								onClick={() => setUrlTab('store')}
							>
								go store tab
							</button>
						</div>

						<div className="wb-tree-meta">
							Проверьте адрес: <code>?tab=url&amp;n=...</code> — это и есть
							состояние.
						</div>
					</div>
				</section>
			)}

			{tab === 'store' && (
				<section className="app-section">
					<div className="app-section__head">
						<div>
							<div className="text-sm font-semibold text-slate-100">
								Store state
							</div>
							<div className="wb-tree-meta mt-1">
								Доменные данные приложения. Optimistic обновления +
								синхронизация с сервером.
							</div>
						</div>
					</div>

					<div className="grid gap-4 lg:grid-cols-2">
						<div className="app-card app-card--soft p-4 space-y-2">
							<div className="text-sm font-semibold text-slate-100">Counts</div>
							<div className="text-sm text-slate-200">
								projects: {storeStats.projects}
							</div>
							<div className="text-sm text-slate-200">
								sections: {storeStats.sections}
							</div>
							<div className="text-sm text-slate-200">
								notes: {storeStats.notes}
							</div>
						</div>

						<div className="app-card app-card--soft p-4 space-y-2">
							<div className="text-sm font-semibold text-slate-100">
								Derived state
							</div>
							<div className="text-sm text-slate-200">
								last note: {storeStats.lastNoteTitle}
							</div>
							<div className="text-sm text-slate-200">
								updatedAt:{' '}
								{storeStats.lastNoteUpdatedAt
									? new Date(storeStats.lastNoteUpdatedAt).toLocaleString(
											'ru-RU',
										)
									: '—'}
							</div>
							<div className="wb-tree-meta mt-2">
								Derived state — вычисляемое. Не храним в store отдельно, чтобы
								не плодить источники правды.
							</div>
						</div>
					</div>
				</section>
			)}
		</div>
	)
}
