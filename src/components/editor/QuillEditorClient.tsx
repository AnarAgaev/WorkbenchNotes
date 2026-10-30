// src/components/editor/QuillEditorClient.tsx
'use client'

import hljs from 'highlight.js'
import dynamic from 'next/dynamic'
import {useCallback, useEffect, useState} from 'react'

type Props = {
	value: string
	onChange: (nextHtml: string) => void
}

type ToolbarCtx = {
	quill: {
		history: {
			undo: () => void
			redo: () => void
		}
	}
}

// Quill Syntax модуль ожидает глобальный window.hljs
if (typeof window !== 'undefined') {
	window.hljs = hljs
}

const ReactQuill = dynamic(
	async () => (await import('react-quill-new')).default,
	{
		ssr: false,
	},
)

const modules = {
	syntax: true,

	toolbar: {
		container: [
			['undo', 'redo'],

			[{header: [1, 2, 3, false]}, {font: []}],

			['bold', 'italic', 'underline', 'strike', 'code'],
			[{script: 'sub'}, {script: 'super'}],

			[{color: []}, {background: []}],

			['blockquote', 'code-block'],

			[{list: 'ordered'}, {list: 'bullet'}, {indent: '-1'}, {indent: '+1'}],

			[{align: []}],

			['link'],

			['clean'],
		],
		handlers: {
			undo: function (this: ToolbarCtx) {
				this.quill.history.undo()
			},
			redo: function (this: ToolbarCtx) {
				this.quill.history.redo()
			},
		},
	},

	history: {
		delay: 400,
		maxStack: 80,
		userOnly: true,
	},

	clipboard: {
		matchVisual: false,
	},
} as const

export default function QuillEditorClient({value, onChange}: Props) {
	const [, setLocalValue] = useState(value)

	// когда пришёл другой value (например, переключили note) — обновляем локал
	useEffect(() => {
		setLocalValue(value)
	}, [value])

	// зависимость onChange обязательно!
	const handleChange = useCallback(
		(content: string) => {
			setLocalValue(content)
			onChange(content)
		},
		[onChange],
	)

	return (
		<ReactQuill
			theme="snow"
			value={value}
			onChange={handleChange}
			modules={modules}
		/>
	)
}
