// src/app/(demo)/server-projects/page.tsx
import Link from 'next/link'
import ServerProjectsSnapshot from '@/app/(demo)/_ui/ServerProjectsSnapshot'
import Container from '@/components/layout/Container'
import {readWorkbenchDb} from '@/server/workbenchDb'

export const revalidate = 30
export const metadata = {title: 'server-projects'}

export default async function ServerProjectsDemoPage() {
	// Server Component: чтение происходит на сервере
	const db = await readWorkbenchDb()

	return (
		<Container className="py-10">
			<div className="space-y-4">
				<div>
					<h1 className="text-2xl font-semibold">server-projects</h1>

					<p className="mt-3 text-sm muted">
						Этот список читается на сервере (RSC) и обновляется через
						<code className="mx-1">revalidatePath(&quot;/&quot;)</code>
						при create/rename/delete проекта.
					</p>
				</div>

				<ServerProjectsSnapshot projects={db.projects ?? []} />

				<div className="pt-4">
					<Link href="/demo" className="app-btn app-btn-ghost">
						Назад в демо
					</Link>
				</div>
			</div>
		</Container>
	)
}
