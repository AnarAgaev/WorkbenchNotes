// src/app/(demo)/demo-rhf/page.tsx
import Link from 'next/link'
import Container from '@/app/components/layout/Container'
import FormRhfClient from './FormRhfClient'
import ManualBigFormClient from './ManualBigFormClient'

export default function DemoRhfPage() {
	return (
		<Container className="py-10">
			<h1 className="text-2xl font-semibold">demo-rhf</h1>
			<p className="muted mt-2 text-sm">
				Сравнение: ручная форма на 3 поля и та же форма на RHF + Zod.
			</p>

			<ManualBigFormClient />
			<FormRhfClient />

			<div className="mt-8 flex flex-wrap gap-2">
				<Link href="/demo" className="app-btn app-btn-ghost">
					Назад в демо
				</Link>
			</div>
		</Container>
	)
}
