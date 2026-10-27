// src/app/(demo)/cache-lab/revalidate-tag/RevalidateTagButtons.tsx
'use client'

import {useRouter} from 'next/navigation'
import {useTransition} from 'react'
import {revalidateDemoTaggedTagAction} from './actions'

export default function RevalidateTagButtons() {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const refreshOnly = () => {
		startTransition(() => {
			router.refresh()
		})
	}

	const invalidateTag = () => {
		startTransition(() => {
			void revalidateDemoTaggedTagAction().then(() => {
				router.refresh()
				setTimeout(() => router.refresh(), 400) // показать результат после фоновой ревалидации
			})
		})
	}

	return (
		<div className="flex flex-wrap gap-2">
			<button
				type="button"
				className="app-btn app-btn--soft"
				disabled={isPending}
				onClick={refreshOnly}
				title="Перерисовать RSC-дерево (кэш не сбрасываем)"
			>
				Refresh (router.refresh)
			</button>

			<button
				type="button"
				className="app-btn app-btn--primary"
				disabled={isPending}
				onClick={invalidateTag}
				title='Сбросить кэш по тегу "demo:tagged" и обновить страницу'
			>
				revalidateTag + Refresh
			</button>

			{isPending && (
				<span className="wb-tree-meta inline-flex items-center gap-2">
					<span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
					обновляем…
				</span>
			)}
		</div>
	)
}
