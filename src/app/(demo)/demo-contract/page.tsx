// src/app/(demo)/demo-contract/page.tsx
import Link from 'next/link'
import Container from '@/app/components/layout/Container'
import type {HelloPayload} from '@/demo/contracts'
import HelloClient from './HelloClient'

export default function DemoContractPage() {
	// Server Component: здесь готовятся данные.
	// В Client Component передаётся только сериализуемый объект строго по контракту.
	const payload: HelloPayload = {
		appName: 'Workbench Notes',
		renderedAt: new Date().toLocaleString(),
		mode: 'server-to-client',

		initialNotes: [
			{id: 'n1', title: 'Первая заметка', status: 'draft', tags: ['intro']},
			{
				id: 'n2',
				title: 'TypeScript = ограничения',
				status: 'published',
				tags: ['ts', 'contracts'],
			},
			{
				id: 'n3',
				title: 'Граница server/client',
				status: 'published',
				tags: ['next', 'app-router'],
			},
		],
	}

	return (
		<Container className="py-10">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-semibold">Server → Client контракт</h1>
			</div>

			<p className="mt-2 text-sm text-slate-400">
				Сервер формирует объект строго по типу и передаёт его в клиентский
				компонент.
			</p>

			<div className="mt-8">
				<HelloClient payload={payload} />
			</div>

			<div className="mt-8 flex flex-wrap gap-2">
				<Link href="/demo" className="app-btn app-btn-ghost">
					Назад в демо
				</Link>
			</div>
		</Container>
	)
}
