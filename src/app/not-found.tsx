// src/app/not-found.tsx
import Link from 'next/link'
import Container from '../app/components/layout/Container'

export default function NotFound() {
	return (
		<Container className="py-10">
			<h1 className="text-2xl font-bold">Страница не найдена</h1>

			<p className="mt-2 text-sm text-slate-600">
				Похоже, вы перешли по неправильной ссылке.
			</p>

			<div className="mt-8 flex flex-wrap gap-2">
				<Link href="/" className="app-btn app-btn-ghost">
					На главную
				</Link>
			</div>
		</Container>
	)
}
