// src/app/page.tsx
import Link from 'next/link'

export default function HomePage() {
	return (
		<div className="mx-auto max-w-5xl px-6 py-10">
			<h1 className="text-2xl font-semibold">Workbench Notes</h1>

			<p className="mt-2 text-sm text-slate-400">
				Это учебный проект курса Next.js + TypeScript. Проект будет постепенно
				развиваться: появятся проекты, разделы, заметки и рабочее пространство.
			</p>

			<div className="mt-8 grid gap-4 sm:grid-cols-2">
				<section className="rounded-xl border border-slate-200 p-5">
					<div className="text-sm font-semibold">Workbench</div>
					<p className="mt-2 text-sm text-slate-400">
						На следующих шагах главная страница станет витриной проектов.
					</p>

					<div className="mt-4 text-sm text-slate-400">
						Первый демо-проект появится чуть позже.
					</div>
				</section>

				<section className="rounded-xl border border-slate-200 p-5">
					<div className="text-sm font-semibold">Демо-страницы</div>
					<p className="mt-2 text-sm text-slate-400">
						Учебные упражнения будут жить отдельно. Они не заменяют продукт, а
						тренируют паттерны.
					</p>

					<div className="mt-4">
						<Link className="underline underline-offset-4" href="/demo">
							Открыть /demo
						</Link>
					</div>
				</section>
			</div>
		</div>
	)
}
