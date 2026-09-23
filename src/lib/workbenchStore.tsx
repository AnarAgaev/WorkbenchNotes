// src/lib/workbenchStore.tsx
'use client'

import type React from 'react'
import {createContext, useCallback, useContext, useMemo, useState} from 'react'
import {getDefaultDb} from '@/data/demo'

type Store = {
	db: WorkbenchDb

	// selectors
	getProject: (projectId: Id) => Project | undefined
	getNote: (projectId: Id, noteId: Id) => Note | undefined

	getSections: (projectId: Id) => Section[]
	getNotesByParent: (
		projectId: Id,
		parentType: NoteParentType,
		parentId: Id,
	) => Note[]

	// mutations (in-memory)
	updateNoteContent: (noteId: Id, nextHtml: string) => void
}

const WorkbenchStoreContext = createContext<Store | null>(null)

export function WorkbenchStoreProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [db, setDb] = useState<WorkbenchDb>(() => getDefaultDb())

	const getProject = useCallback(
		(projectId: Id) => db.projects.find((p) => p.id === projectId),
		[db.projects],
	)

	const getNote = useCallback(
		(projectId: Id, noteId: Id) =>
			db.notes.find((n) => n.projectId === projectId && n.id === noteId),
		[db.notes],
	)

	const getSections = useCallback(
		(projectId: Id) =>
			db.sections
				.filter((s) => s.projectId === projectId)
				.sort((a, b) => a.order - b.order),
		[db.sections],
	)

	const getNotesByParent = useCallback(
		(projectId: Id, parentType: NoteParentType, parentId: Id) =>
			db.notes
				.filter(
					(n) =>
						n.projectId === projectId &&
						n.parentType === parentType &&
						n.parentId === parentId,
				)
				.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
		[db.notes],
	)

	const updateNoteContent = useCallback((noteId: Id, nextHtml: string) => {
		setDb((prev) => ({
			...prev,
			notes: prev.notes.map((n) =>
				n.id === noteId
					? {...n, contentHtml: nextHtml, updatedAt: new Date().toISOString()}
					: n,
			),
		}))
	}, [])

	const value = useMemo<Store>(
		() => ({
			db,
			getProject,
			getNote,
			getSections,
			getNotesByParent,
			updateNoteContent,
		}),
		[db, getProject, getNote, getSections, getNotesByParent, updateNoteContent],
	)

	return (
		<WorkbenchStoreContext.Provider value={value}>
			{children}
		</WorkbenchStoreContext.Provider>
	)
}

export function useWorkbenchStore() {
	const ctx = useContext(WorkbenchStoreContext)
	if (!ctx)
		throw new Error(
			'useWorkbenchStore must be used within WorkbenchStoreProvider',
		)
	return ctx
}
