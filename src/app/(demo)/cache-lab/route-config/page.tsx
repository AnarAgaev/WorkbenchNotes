// src/app/(demo)/cache-lab/route-config/page.tsx
import Link from 'next/link'
import Container from '@/components/layout/Container'

export const metadata = {title: 'cache-lab/route-config'}

export default function RouteConfigIndexPage() {
	return (
		<Container className="py-10">
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-semibold">cache-lab/route-config</h1>
					<p className="mt-3 text-sm muted">Режимы на отдельных маршрутах.</p>
				</div>

				<div className="grid gap-3">
					<Link
						className="app-card app-card--soft block hover:bg-white/5"
						href="/cache-lab/route-config/isr"
					>
						<div className="text-sm font-semibold text-slate-100">
							ISR route
						</div>
						<div className="wb-tree-meta mt-1">export const revalidate = 60</div>
					</Link>

					<Link
						className="app-card app-card--soft block hover:bg-white/5"
						href="/cache-lab/route-config/dynamic"
					>
						<div className="text-sm font-semibold text-slate-100">
							force-dynamic route
						</div>
						<div className="wb-tree-meta mt-1">
							export const dynamic = &quot;force-dynamic&quot;
						</div>
					</Link>

					<Link
						className="app-card app-card--soft block hover:bg-white/5"
						href="/cache-lab/route-config/no-store"
					>
						<div className="text-sm font-semibold text-slate-100">
							fetch no-store
						</div>
						<div className="wb-tree-meta mt-1">
							fetch cache: force-cache vs no-store
						</div>
					</Link>
				</div>

				<div>
					<Link href="/demo" className="app-btn app-btn-ghost">
						Назад в демо
					</Link>
				</div>
			</div>
		</Container>
	)
}
