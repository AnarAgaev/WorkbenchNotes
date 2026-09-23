// src/components/editor/NoteEditorClient.tsx
'use client'

import {useCallback, useEffect, useState} from 'react'

export default function NoteEditorClient({
	value,
	onChange,
}: {
	value: string
	onChange: (nextText: string) => void
}) {
	const [localValue, setLocalValue] = useState(value)

	useEffect(() => {
		setLocalValue(value)
	}, [value])

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const next = e.target.value
			setLocalValue(next)
			onChange(next)
		},
		[onChange],
	)

	return (
		<div className="wb-editor">
			<textarea
				value={localValue}
				onChange={handleChange}
				className="wb-editor__textarea"
				placeholder="Введите текст…"
				spellCheck={false}
			/>
		</div>
	)
}
