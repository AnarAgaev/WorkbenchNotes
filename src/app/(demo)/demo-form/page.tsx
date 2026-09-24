// src/app/(demo)/demo-form/page.tsx
import Link from 'next/link'
import Container from '@/app/components/layout/Container'
import FormContractClient from './FormContractClient'

export const metadata = {title: 'demo-form'}

export default function DemoFormPage() {
	return (
		<Container className="py-10">
			<h1 className="text-2xl font-semibold">demo-form</h1>

			<p className="mt-3 text-sm muted">
				Учебная лаборатория форм: состояния, ошибки и предсказуемое поведение
				UI.
			</p>

			<FormContractClient />

			<div className="mt-8 flex flex-wrap gap-2">
				<Link href="/demo" className="app-btn app-btn-ghost">
					Назад в демо
				</Link>
			</div>
		</Container>
	)
}
