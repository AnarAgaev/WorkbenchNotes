// src/app/(demo)/cache-lab/route-config/dynamic/page.tsx
import Link from 'next/link'
import Container from '@/components/layout/Container'

export const dynamic = 'force-dynamic'

type Payload = {
	mode: 'force-dynamic'
	generatedAt: string
	random: string
	pid: number
}

function getPayload(): Payload {
	return {
		mode: 'force-dynamic',
		generatedAt: new Date().toISOString(),
		random: Math.random().toString(16).slice(2),
		pid: process.pid,
	}
}

export default async function RouteForceDynamicPage() {
	// dynamic сегмент: рендер на каждый запрос
	const payload = getPayload()

	return (
		<Container>
			<div className="space-y-6">
				<div>
					<h1 className="text-lg font-semibold text-slate-100">
						Route: force-dynamic
					</h1>
					<p className="wb-tree-meta mt-1">
						export const <code>dynamic = &quot;force-dynamic&quot;</code>.
						Значение меняется на каждую перезагрузку.
					</p>
				</div>

				<pre className="app-card app-card--soft overflow-auto p-4 text-xs text-slate-200">
					{JSON.stringify(payload, null, 2)}
				</pre>
			</div>

			<div className="mt-8 flex flex-wrap gap-2">
				<Link href="/cache-lab/route-config" className="app-btn app-btn-ghost">
					Назад
				</Link>
			</div>
		</Container>
	)
}
