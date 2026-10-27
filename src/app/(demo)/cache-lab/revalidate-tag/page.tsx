// src/app/(demo)/cache-lab/revalidate-tag/page.tsx
import {unstable_cache} from 'next/cache'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import RevalidateTagButtons from './RevalidateTagButtons'

type TaggedPayload = {
	generatedAt: string
	random: string
	pid: number
}

const getTaggedPayload = unstable_cache(
	async (): Promise<TaggedPayload> => {
		return {
			generatedAt: new Date().toISOString(),
			random: Math.random().toString(16).slice(2),
			pid: process.pid,
		}
	},
	['cache-lab-tagged-v1'],
	{tags: ['demo:tagged'], revalidate: 3600},
)

export const revalidate = 3600
export const metadata = {title: 'cache-lab/revalidate-tag'}

export default async function RevalidateTagDemoPage() {
	const payload = await getTaggedPayload()

	return (
		<Container className="py-10">
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-semibold">cache-lab/revalidate-tag</h1>
					<p className="mt-3 text-sm muted">
						Значение ниже берётся из <code>unstable_cache</code> с тегом{' '}
						<code>demo:tagged</code>. Обычный refresh не меняет значение,
						revalidateTag сбрасывает кэш.
					</p>
					<p className="mt-2 text-sm muted">
						Для максимально наглядного эффекта смотрите в{' '}
						<code>npm run build && npm start</code>.
					</p>
				</div>

				<RevalidateTagButtons />

				<section className="app-section">
					<div className="app-section__head">
						<div>
							<div className="text-sm font-semibold text-slate-100">
								Cached payload
							</div>
							<div className="wb-tree-meta mt-1">
								tag: <code>demo:tagged</code> • revalidate: 3600
							</div>
						</div>
					</div>

					<pre className="app-card app-card--soft overflow-auto p-4 text-xs text-slate-200">
						{JSON.stringify(payload, null, 2)}
					</pre>
				</section>

				<div>
					<Link href="/demo" className="app-btn app-btn-ghost">
						Назад в демо
					</Link>
				</div>
			</div>
		</Container>
	)
}
