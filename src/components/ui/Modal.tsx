// src/components/ui/Modal.tsx
'use client'

import {useEffect} from 'react'
import {createPortal} from 'react-dom'
import Button from './Button'

export default function Modal({
	open,
	title,
	onClose,
	children,
}: {
	open: boolean
	title: string
	onClose: () => void
	children: React.ReactNode
}) {
	useEffect(() => {
		if (!open) return

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}

		window.addEventListener('keydown', onKeyDown)

		return () => window.removeEventListener('keydown', onKeyDown)
	}, [open, onClose])

	if (!open) return null

	return createPortal(
		<div className="app-modal-overlay" onMouseDown={onClose}>
			<div className="app-modal" onMouseDown={(e) => e.stopPropagation()}>
				<div className="app-modal__head">
					<div className="app-modal__title">{title}</div>
					<Button variant="ghost" onClick={onClose}>
						Закрыть
					</Button>
				</div>
				<div className="app-modal__body">{children}</div>
			</div>
		</div>,
		document.body,
	)
}
