// src/components/layout/AppHeader.tsx
import Link from 'next/link'

// Общая шапка приложения.
// Нужна сразу: она фиксирует "продуктовую" рамку проекта,
// а демо-страницы позже будут отделены маршрутом /demo.
export default function AppHeader() {
	return (
		<header className="border-b border-slate-200">
			<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
				<Link href="/" className="text-sm font-semibold">
					Workbench Notes
				</Link>

				<nav className="flex items-center gap-3 text-sm">
					<Link className="underline underline-offset-4" href="/demo">
						Демо
					</Link>
				</nav>
			</div>
		</header>
	)
}
