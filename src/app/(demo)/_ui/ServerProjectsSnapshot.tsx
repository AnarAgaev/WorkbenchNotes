// src/app/(demo)/_ui/ServerProjectsSnapshot.tsx
import Link from 'next/link'

type Props = {projects: Project[]}

// Стабильная сортировка для демо:
// demo-проекты показываем выше, внутри группы сортируем по createdAt (новые сверху).
const sortDemoFirst = (a: Project, b: Project) => {
	const ad = a.isDemo ? 0 : 1
	const bd = b.isDemo ? 0 : 1
	if (ad !== bd) return ad - bd

	const ac = a.createdAt ?? ''
	const bc = b.createdAt ?? ''
	return bc.localeCompare(ac)
}

export default function ServerProjectsSnapshot({projects}: Props) {
	// Server snapshot получает готовые данные (projects) от Server Component страницы.
	// Здесь нет client-store и нет optimistic — это чистый server-rendered снимок.
	const colEntries = projects
		.filter((p) => p.structure === 'entries')
		.sort(sortDemoFirst)

	const colSections = projects
		.filter((p) => p.structure === 'sections')
		.sort(sortDemoFirst)

	const renderList = (items: Project[]) => (
		<div className="space-y-2">
			{items.map((p) => (
				<Link
					key={p.id}
					// Ссылка ведёт в реальный workspace, чтобы удобно сравнивать
					// server snapshot (демо) и client UI (рабочая область).
					href={`/p/${p.id}`}
					className={
						// карточки, hover и маркировка демо-проектов.
						'app-card app-card--soft block hover:border-slate-500/70 hover:bg-white/5 transition-colors ' +
						(p.isDemo ? 'app-card--demo' : '')
					}
				>
					<div className="truncate text-sm font-semibold text-slate-100">
						{p.title}
					</div>

					{/* Показ id: видно, что это именно серверный список сущностей */}
					<div className="wb-tree-meta mt-1">{p.id}</div>
				</Link>
			))}
		</div>
	)

	return (
		<section className="app-section">
			<div className="app-section__head">
				<div>
					<div className="text-sm font-semibold text-slate-100">
						Server snapshot
					</div>

					{/* Текст фиксирует главную идею демо: HTML может быть кэширован как server snapshot */}
					<div className="wb-tree-meta mt-1">
						Рендер на сервере. Результат может кэшироваться как snapshot.
					</div>
				</div>
			</div>

			{/* Две колонки по структуре проекта, чтобы список был нагляднее */}
			<div className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-3">
					<div className="flex items-baseline justify-between">
						<div className="text-sm font-semibold text-slate-100">Заметки</div>
						<div className="wb-tree-meta">{colEntries.length}</div>
					</div>
					{renderList(colEntries)}
				</div>

				<div className="space-y-3">
					<div className="flex items-baseline justify-between">
						<div className="text-sm font-semibold text-slate-100">
							Вложенные заметки
						</div>
						<div className="wb-tree-meta">{colSections.length}</div>
					</div>
					{renderList(colSections)}
				</div>
			</div>
		</section>
	)
}
