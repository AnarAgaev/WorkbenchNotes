// src/lib/workbenchStore.tsx
'use client'

import type React from 'react'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'
import {getDbSnapshot} from '@/app/_actions/db'
import {getDefaultDb} from '@/data/demo'
import {v4 as uuid} from 'uuid'

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
	createNote: (
		projectId: Id,
		parentType: NoteParentType,
		parentId: Id,
		title: string,
	) => Note
	renameNote: (noteId: Id, nextTitle: string) => void
	deleteNote: (noteId: Id) => void
	createSection: (projectId: Id, title: string) => Section
	renameSection: (sectionId: Id, nextTitle: string) => void
	deleteSection: (sectionId: Id) => void

	createProject: (title: string, structure: Project['structure']) => Project
	renameProject: (projectId: Id, nextTitle: string) => void
	deleteProject: (projectId: Id) => void

	isDemoProject: (projectId: Id) => boolean

	insertProjectLocal: (project: Project) => void
	refreshFromServer: () => Promise<void>
}

const WorkbenchStoreContext = createContext<Store | null>(null)

export function WorkbenchStoreProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [db, setDb] = useState<WorkbenchDb>(() => getDefaultDb())

	const refreshFromServer = useCallback(async () => {
		const snapshot = await getDbSnapshot()
		setDb(snapshot)
	}, [])

	useEffect(() => {
		// При старте store сначала живёт на demo-db (getDefaultDb),
		// затем один раз заменяется серверным снапшотом.
		let alive = true

		void (async () => {
			try {
				const snapshot = await getDbSnapshot()
				if (!alive) return
				setDb(snapshot)
			} catch {
				// На этом этапе остаёмся на demo-db, без падения UI.
			}
		})()

		return () => {
			alive = false
		}
	}, [])

	const insertProjectLocal = useCallback((project: Project) => {
		setDb((prev) => {
			// Защита от дублей: один id — один проект.
			if (prev.projects.some((p) => p.id === project.id)) return prev

			return {
				...prev,
				// Новые проекты кладём наверх, чтобы результат был виден сразу.
				projects: [project, ...prev.projects],
			}
		})
	}, [])

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

	const createNote = useCallback(
		(projectId: Id, parentType: NoteParentType, parentId: Id, title: string) => {
			const id = `n-${uuid()}`
			const now = new Date().toISOString()

			const note: Note = {
				id,
				projectId,
				parentType,
				parentId,
				title,
				contentHtml: '<p><br></p>',
				updatedAt: now,
			}

			setDb((prev) => ({
				...prev,
				notes: [...prev.notes, note],
			}))

			return note
		},
		[],
	)

	const renameNote = useCallback((noteId: Id, nextTitle: string) => {
		setDb((prev) => ({
			...prev,
			notes: prev.notes.map((n) =>
				n.id === noteId
					? {...n, title: nextTitle, updatedAt: new Date().toISOString()}
					: n,
			),
		}))
	}, [])

	const deleteNote = useCallback((noteId: Id) => {
		setDb((prev) => ({
			...prev,
			notes: prev.notes.filter((n) => n.id !== noteId),
		}))
	}, [])

	const createSection = useCallback(
		(projectId: Id, title: string) => {
			const id = `s-${uuid()}`

			// Максимальный order внутри проекта, чтобы новый раздел всегда добавлялся в конец.
			const maxOrder = db.sections
				.filter((s) => s.projectId === projectId)
				.reduce((m, s) => Math.max(m, s.order), 0)

			const section: Section = {
				id,
				projectId,
				title: title.trim(),
				order: maxOrder + 1,
			}

			setDb((prev) => ({
				...prev,
				sections: [...prev.sections, section],
			}))

			return section
		},
		[db.sections],
	)

	const renameSection = useCallback((sectionId: Id, nextTitle: string) => {
		setDb((prev) => ({
			...prev,
			sections: prev.sections.map((s) =>
				s.id === sectionId ? {...s, title: nextTitle} : s,
			),
		}))
	}, [])

	const deleteSection = useCallback((sectionId: Id) => {
		// Удаление раздела каскадно удаляет его заметки.
		setDb((prev) => ({
			...prev,
			sections: prev.sections.filter((s) => s.id !== sectionId),
			notes: prev.notes.filter(
				(n) => !(n.parentType === 'section' && n.parentId === sectionId),
			),
		}))
	}, [])

	const isDemoProject = useCallback((projectId: Id) => {
		return projectId === 'demo-notes' || projectId === 'demo-nested'
	}, [])

	const createProject = useCallback(
		(title: string, structure: Project['structure']) => {
			const t = title.trim()
			const now = new Date().toISOString()

			const project: Project = {
				id: `p-${uuid()}`,
				title: t,
				structure,
				createdAt: now,
			}

			setDb((prev) => ({
				...prev,
				projects: [project, ...prev.projects],
			}))

			return project
		},
		[],
	)

	const renameProject = useCallback(
		(projectId: Id, nextTitle: string) => {
			if (isDemoProject(projectId)) return

			const t = nextTitle.trim()
			if (t.length < 2) return

			setDb((prev) => ({
				...prev,
				projects: prev.projects.map((p) =>
					p.id === projectId ? {...p, title: t} : p,
				),
			}))
		},
		[isDemoProject],
	)

	const deleteProject = useCallback(
		(projectId: Id) => {
			if (isDemoProject(projectId)) return

			setDb((prev) => ({
				...prev,
				projects: prev.projects.filter((p) => p.id !== projectId),
				sections: prev.sections.filter((s) => s.projectId !== projectId),
				notes: prev.notes.filter((n) => n.projectId !== projectId),
			}))
		},
		[isDemoProject],
	)

	const value = useMemo<Store>(
		() => ({
			db,
			getProject,
			getNote,
			getSections,
			getNotesByParent,
			updateNoteContent,
			createNote,
			renameNote,
			deleteNote,
			createSection,
			renameSection,
			deleteSection,
			createProject,
			renameProject,
			deleteProject,
			isDemoProject,
			insertProjectLocal,
			refreshFromServer,
		}),
		[
			db,
			getProject,
			getNote,
			getSections,
			getNotesByParent,
			updateNoteContent,
			createNote,
			renameNote,
			deleteNote,
			createSection,
			renameSection,
			deleteSection,
			createProject,
			renameProject,
			deleteProject,
			isDemoProject,
			insertProjectLocal,
			refreshFromServer,
		],
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
