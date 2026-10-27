// src/app/(demo)/cache-lab/route-config/no-store/page.tsx
import Link from 'next/link'
import {getRequestBaseUrl} from '@/app/(demo)/cache-lab/_lib/requestBaseUrl'
import Container from '@/components/layout/Container'

type NowPayload = {
	generatedAt: string
	random: string
	pid: number
}

async function getNowForceCache(baseUrl: string): Promise<NowPayload> {
	const url = new URL('/cache-lab/now', baseUrl).toString()

	const res = await fetch(url, {cache: 'force-cache'})
	if (!res.ok) {
		const text = await res.text()
		throw new Error(
			`Failed to fetch /cache-lab/now: ${res.status} ${res.statusText} :: ${text.slice(0, 200)}`,
		)
	}

	return res.json()
}

async function getNowNoStore(baseUrl: string): Promise<NowPayload> {
	const url = new URL('/cache-lab/now', baseUrl).toString()

	const res = await fetch(url, {cache: 'no-store'})
	if (!res.ok) {
		const text = await res.text()
		throw new Error(
			`Failed to fetch /cache-lab/now: ${res.status} ${res.statusText} :: ${text.slice(0, 200)}`,
		)
	}

	return res.json()
}

export default async function RouteNoStorePage() {
	const info = await getRequestBaseUrl()

	const forceCached = await getNowForceCache(info.baseUrl)
	const noStored = await getNowNoStore(info.baseUrl)

	return (
		<Container>
			<div className="space-y-6">
				<div>
					<h1 className="text-lg font-semibold text-slate-100">
						Route: fetch no-store
					</h1>
					<p className="wb-tree-meta mt-1">
						Два запроса в один endpoint. Один с <code>force-cache</code>, второй
						с <code>no-store</code>.
					</p>
				</div>

				<section className="app-section">
					<div className="app-section__head">
						<div>
							<div className="text-sm font-semibold text-slate-100">
								force-cache
							</div>
							<div className="wb-tree-meta mt-1">
								fetch cache: <code>force-cache</code>
							</div>
						</div>
					</div>

					<pre className="app-card app-card--soft overflow-auto p-4 text-xs text-slate-200">
						{JSON.stringify({baseUrlUsed: info.baseUrl, ...forceCached}, null, 2)}
					</pre>
				</section>

				<section className="app-section">
					<div className="app-section__head">
						<div>
							<div className="text-sm font-semibold text-slate-100">
								no-store
							</div>
							<div className="wb-tree-meta mt-1">
								fetch cache: <code>no-store</code>
							</div>
						</div>
					</div>

					<pre className="app-card app-card--soft overflow-auto p-4 text-xs text-slate-200">
						{JSON.stringify({baseUrlUsed: info.baseUrl, ...noStored}, null, 2)}
					</pre>
				</section>

				<pre className="app-card app-card--soft overflow-auto p-4 text-xs text-slate-200">
					{`baseUrl resolution:
env NEXT_PUBLIC_SITE_URL: ${info.envSiteUrl ?? '—'}
x-forwarded-proto: ${info.xfProto}
x-forwarded-host: ${info.xfHost ?? '—'}
host: ${info.host ?? '—'}
fromHeaders: ${info.fromHeaders ?? '—'}
baseUrlUsed: ${info.baseUrl}`}
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
