// src/app/(demo)/demo/page.tsx
import Link from 'next/link'

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

			<div className="mt-8 grid gap-3 sm:grid-cols-2">
				<Link
					href="/demo-contract"
					className="rounded-xl border border-slate-200 p-5 hover:bg-white/5"
				>
					<div className="text-sm font-semibold">Server → Client контракт</div>
					<div className="mt-2 text-sm text-slate-400">
						Первый тип данных, который сервер передаёт в клиентский компонент.
					</div>
				</Link>
			</div>
		</div>
	)
}
