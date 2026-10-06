// src/app/(demo)/demo/page.tsx
import Link from 'next/link'

type DemoItem = {
	href: string
	title: string
	desc: string
}

type DemoModule = {
	title: string
	desc: string
	items: DemoItem[]
}

const modules: DemoModule[] = [
	{
		title: 'Модуль 1 — TypeScript и данные',
		desc: 'Типы на границах: сервер → клиент, params, searchParams.',
		items: [
			{
				href: '/demo-contract',
				title: 'Server → Client контракт',
				desc: 'Первый тип данных, который сервер передаёт в клиентский компонент.',
			},
			{
				href: '/demo-params/hello',
				title: 'demo-params/[value]',
				desc: 'params как внешний ввод, всегда string.',
			},
			{
				href: '/demo-search?q=hello',
				title: 'demo-search',
				desc: 'searchParams: string | string[] | undefined в живом виде.',
			},
		],
	},
	{
		title: 'Модуль 2 — Формы и валидация',
		desc: 'Форма как контракт: errors, pending, disable, success state.',
		items: [
			{
				href: '/demo-form',
				title: 'demo-form',
				desc: 'Form Lab: validation → submit → результат.',
			},
		],
	},
	{
		title: 'Модуль 3 — React Hook Form',
		desc: 'Схема как единый контракт',
		items: [
			{
				href: '/demo-rhf',
				title: 'demo-rhf',
				desc: 'z.infer<typeof schema>',
			},
		],
	},
	{
		title: 'Модуль 4 — Server Actions',
		desc: 'Асинхронные функции на сервере',
		items: [
			{
				href: '/form-lab',
				title: 'form-lab',
				desc: 'форма → Zod → Server Action',
			},
			{
				href: '/optimistic-lab',
				title: 'optimistic-lab',
				desc: 'optimistic + rollback (clientId)',
			},
		],
	},
]

export default function DemoIndexPage() {
	return (
		<div className="app-container py-10">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-semibold">Демо</h1>

				<Link className="text-sm underline underline-offset-4" href="/">
					На главную
				</Link>
			</div>

			<p className="mt-2 text-sm text-slate-400">
				Здесь живут учебные упражнения. Они тренируют паттерны.
			</p>

			<div className="mt-8 space-y-8">
				{modules.map((module) => (
					<section key={module.title}>
						<h2 className="text-lg font-semibold">{module.title}</h2>
						<p className="mt-1 text-sm text-slate-400">{module.desc}</p>

						<div className="mt-4 grid gap-3 sm:grid-cols-2">
							{module.items.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className="rounded-xl border border-slate-200 p-5 hover:bg-white/5"
								>
									<div className="text-sm font-semibold">{item.title}</div>
									<div className="mt-2 text-sm text-slate-400">{item.desc}</div>
								</Link>
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	)
}
