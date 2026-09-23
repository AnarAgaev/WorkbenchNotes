// src/components/ui/Collapsible.tsx
'use client'

import {useState} from 'react'

export default function Collapsible({
	title,
	defaultOpen = true,
	children,
}: {
	title: string
	defaultOpen?: boolean
	children: React.ReactNode
}) {
	const [open, setOpen] = useState(defaultOpen)

	return (
		<div className="flex flex-col gap-2">
			<button
				className="wb-collapsible-btn"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				<span className="text-sm font-semibold">{title}</span>
				<span className="wb-collapsible-icon">{open ? '▾' : '▸'}</span>
			</button>

			{open ? <div className="flex flex-col gap-1">{children}</div> : null}
		</div>
	)
}
