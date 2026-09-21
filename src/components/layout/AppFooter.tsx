// src/components/layout/AppFooter.tsx
import Container from '../../app/components/layout/Container'

export default function AppFooter() {
	return (
		<footer className="border-t border-slate-800/70 bg-slate-950/60">
			<Container>
				<div className="py-3 text-center text-sm text-slate-400">
					<span>Workbench Notes</span>
					<span>•</span>
					<span>Next.js App Router + TypeScript</span>
				</div>
			</Container>
		</footer>
	)
}
