// src/components/editor/NoteEditorClient.tsx
'use client'

import dynamic from 'next/dynamic'

const QuillEditorClient = dynamic(() => import('./QuillEditorClient'), {
	ssr: false,
})

export default function NoteEditorClient({
	value,
	onChange,
}: {
	value: string
	onChange: (nextHtml: string) => void
}) {
	return (
		<div className="wb-editor">
			<QuillEditorClient value={value} onChange={onChange} />
		</div>
	)
}
