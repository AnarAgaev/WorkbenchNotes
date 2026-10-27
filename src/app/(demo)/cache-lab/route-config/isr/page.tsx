// src/app/(demo)/cache-lab/route-config/isr/page.tsx
import {unstable_cache} from 'next/cache'
import Link from 'next/link'
import Container from '@/components/layout/Container'

export const revalidate = 60

type Payload = {
	mode: 'ISR'
	generatedAt: string
	random: string
	pid: number
}

const getIsrPayload = unstable_cache(
	async (): Promise<Payload> => {
		return {
			mode: 'ISR',
			generatedAt: new Date().toISOString(),
			random: Math.random().toString(16).slice(2),
			pid: process.pid,
		}
	},
	['cache-lab-route-config-isr-v1'],
	{revalidate: 60}, // tags не нужны
)

export default async function RouteIsrPage() {
	const payload = await getIsrPayload()

	return (
		<Container>
			<div className="space-y-6">
				<div>
					<h1 className="text-lg font-semibold text-slate-100">Route: ISR</h1>
					<p className="wb-tree-meta mt-1">
						export const <code>revalidate = 60</code>. Значение залипает до
						минуты.
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
