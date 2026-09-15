// src/app/(demo)/demo-contract/HelloClient.tsx
'use client'
import {useState} from 'react'
import type {HelloPayload} from '@/demo/contracts'

type Props = {
	payload: HelloPayload // строгий контракт: сервер передаёт ровно эту форму данных
}

export default function HelloClient({payload}: Props) {
	const [clicks, setClicks] = useState<number>(0)

	return (
		<section className="rounded-xl border border-slate-200 p-5">
			<div className="text-sm font-semibold">Client Component</div>

			<p className="mt-2 text-sm text-slate-400">
				Клики меняются в браузере. Время renderedAt приходит с сервера как
				данные.
			</p>

			<div className="mt-4 space-y-1 text-sm">
				<div>
					appName: <code className="font-mono">{payload.appName}</code>
				</div>
				<div>
					renderedAt: <code className="font-mono">{payload.renderedAt}</code>
				</div>
				<div>
					mode: <code className="font-mono">{payload.mode}</code>
				</div>
			</div>

			<button
				type="button"
				className="mt-5 rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
				onClick={() => setClicks((clicks) => clicks + 1)}
			>
				Clicks: {clicks}
			</button>
		</section>
	)
}
