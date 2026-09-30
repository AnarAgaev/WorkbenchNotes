// src/components/ui/InlineEdit.tsx
'use client'

import {useEffect, useRef, useState} from 'react'

export default function InlineEdit({
	initialValue,
	onSave,
	onCancel,
	autoFocus = true,
	placeholder,
	className = '',
	inputClassName = '',
}: {
	initialValue: string
	onSave: (nextValue: string) => void
	onCancel?: () => void
	autoFocus?: boolean
	placeholder?: string
	className?: string
	inputClassName?: string
}) {
	const [value, setValue] = useState(initialValue)
	const ref = useRef<HTMLInputElement | null>(null)
	// Защита от двойного завершения: после Enter/Escape input теряет фокус,
	// и onBlur не должен повторно вызвать onSave (или сохранить после отмены).
	const doneRef = useRef(false)

	useEffect(() => {
		if (autoFocus) {
			ref.current?.focus()
			ref.current?.select()
		}
	}, [autoFocus])

	const finishCancel = () => {
		if (doneRef.current) return
		doneRef.current = true
		onCancel?.()
	}

	const finishSave = () => {
		if (doneRef.current) return
		const t = value.trim()
		if (!t) {
			finishCancel()
			return
		}
		doneRef.current = true
		onSave(t)
	}

	return (
		<div className={className}>
			<input
				ref={ref}
				value={value}
				placeholder={placeholder}
				onChange={(e) => setValue(e.target.value)}
				onClick={(e) => e.stopPropagation()}
				onBlur={finishSave}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault()
						finishSave()
					}
					if (e.key === 'Escape') {
						e.preventDefault()
						finishCancel()
					}
				}}
				className={inputClassName}
			/>
		</div>
	)
}
