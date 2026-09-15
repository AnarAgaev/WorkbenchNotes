// src/app/(demo)/demo-contract/page.tsx
import Link from 'next/link'
import type {HelloPayload} from '@/demo/contracts'
import HelloClient from './HelloClient'

export default function DemoContractPage() {
	// Server Component: здесь готовятся данные.
	// В Client Component передаётся только сериализуемый объект строго по контракту.
	const payload: HelloPayload = {
		appName: 'Workbench Notes',
		renderedAt: new Date().toISOString(),
		mode: 'server-to-client',
	}

	return (
		<div className="app-container py-10">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-semibold">Server → Client контракт</h1>

				<Link className="text-sm underline underline-offset-4" href="/demo">
					Назад в демо
				</Link>
			</div>

			<p className="mt-2 text-sm text-slate-400">
				Сервер формирует объект строго по типу и передаёт его в клиентский
				компонент.
			</p>

			<div className="mt-8">
				<HelloClient payload={payload} />
			</div>
		</div>
	)
}
