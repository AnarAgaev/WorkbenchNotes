// src/app/page.tsx
import Link from 'next/link'
// import {getWorkbenchDb} from '@/data/demo'
import {getDefaultDb} from '@/data/demo'
import Container from './components/layout/Container'

export default function HomePage() {
	// const db = getWorkbenchDb()
	const db = getDefaultDb()

	const projects = [...db.projects].sort((a, b) => {
		const ad = a.isDemo ? 0 : 1
		const bd = b.isDemo ? 0 : 1
		if (ad !== bd) return ad - bd
		return a.title.localeCompare(b.title, 'ru')
	})

	return (
		<Container>
			<section className="app-section">
				<div className="app-section__head">
					<div>
						<h1 className="text-2xl font-semibold">Проекты</h1>
						<p className="muted mt-1">
							Проекты берутся из WorkbenchDb и отображаются на главной.
						</p>
					</div>
				</div>

				<div className="app-card">
					<div className="text-sm font-semibold mb-3">Список проектов</div>

					<div className="flex flex-col gap-2">
						{projects.map((p) => (
							<div key={p.id} className="app-row app-card app-card--soft">
								<div>
									<div className="font-semibold">{p.title}</div>
									<div className="muted text-xs mt-1">
										уровень:{' '}
										<span className="text-slate-200">
											{p.structure === 'entries' ? '2' : '2/3'}
										</span>{' '}
										• id: <span className="text-slate-200">{p.id}</span>
									</div>
								</div>

								<button
									type="button"
									className="app-btn app-btn-ghost"
									disabled
								>
									Открыть
								</button>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="mt-8">
				<div className="app-card app-card--soft">
					<div className="text-sm font-semibold text-slate-100">Демо</div>
					<p className="muted mt-1 text-sm">Лаборатория демо паттернов</p>

					<div className="mt-3">
						<Link href="/demo" className="app-btn app-btn-ghost w-fit">
							Открыть демо
						</Link>
					</div>
				</div>
			</section>
		</Container>
	)
}
