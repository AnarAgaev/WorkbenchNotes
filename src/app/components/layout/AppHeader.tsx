// src/components/layout/AppHeader.tsx
import Link from 'next/link'
import Container from './Container'

export default function AppHeader() {
	return (
		<header className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/80 text-slate-100 backdrop-blur shadow-sm shadow-black/30">
			<Container>
				<div className="flex flex-wrap items-center justify-between gap-3 py-3">
					<Link
						href="/"
						className="text-base font-semibold tracking-tight text-slate-100 hover:text-white"
					>
						Workbench Notes
					</Link>

					<div className="text-xs text-slate-400">Course II • TypeScript</div>
				</div>
			</Container>
		</header>
	)
}
