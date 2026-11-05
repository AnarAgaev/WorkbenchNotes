// src/features/workspace/useProjectWorkspace.ts
'use client'

import {useSearchParams} from 'next/navigation'
import {useCallback, useMemo, useState} from 'react'
import {useUIShell} from '@/features/uiShell'
import {prepareHtmlForPreview} from '@/lib/quillPreview'
import {useWorkbenchStore} from '@/lib/workbenchStore'

export type WorkspaceMode = 'edit' | 'view'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type SaveInfo = {
	status: SaveStatus
	lastSavedAt?: string
	error?: string | null
}

export function useProjectWorkspace(projectId: Id) {
	const sp = useSearchParams()
	const noteId = sp.get('note') ?? ''

	const [mode, setMode] = useState<WorkspaceMode>('edit')

	const {getProject, getNote, updateNoteContent, getNoteSaveInfo} =
		useWorkbenchStore()

	const ui = useUIShell()
	const {focusMode} = ui.state

	const project = getProject(projectId)

	const note = noteId ? getNote(projectId, noteId) : undefined
	const saveInfo: SaveInfo = note ? getNoteSaveInfo(note.id) : {status: 'idle'}
	const previewHtml = useMemo(() => {
		if (!note) return ''
		return prepareHtmlForPreview(note.contentHtml || '')
	}, [note])

	const toggleMode = () => {
		setMode((m) => (m === 'edit' ? 'view' : 'edit'))
	}

	const onChangeHtml = useCallback(
		(nextHtml: string) => {
			if (!note) return
			updateNoteContent(note.id, nextHtml)
		},
		[note, updateNoteContent],
	)

	return {
		projectId,
		project,
		noteId,
		note,

		mode,
		setMode,
		toggleMode,

		previewHtml,

		saveInfo,

		focusMode,
		toggleFocusMode: ui.toggleFocusMode,

		onChangeHtml,
	}
}
