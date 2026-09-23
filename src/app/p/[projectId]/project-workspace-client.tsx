// src/app/p/[projectId]/project-workspace-client.tsx
'use client'

import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import WorkspaceShell from '@/app/_ui/WorkspaceShell'
import NoteEditorClient from '@/components/editor/NoteEditorClient'
import {getStringParam} from '@/demo/searchParams'
import {useWorkbenchStore} from '@/lib/workbenchStore'

function parseId(raw: string): Id | null {
	const v = raw.trim()
	if (!v) return null
	return v as Id
}

function htmlToPlain(html: string) {
	return html
		.replace(/<\/(p|div|li|h\d)>/g, '\n')
		.replace(/<br\s*\/?>/g, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim()
}

export default function ProjectWorkspaceClient({projectId}: {projectId: Id}) {
	const {db, updateNoteContent} = useWorkbenchStore()
	const sp = useSearchParams()

	const project = db.projects.find((p) => p.id === projectId)
	if (!project) {
		return (
			<div className="app-card">
				<div className="font-semibold">Проект не найден</div>
				<p className="muted mt-1 text-sm">
					Вернись на{' '}
					<Link className="app-link" href="/">
						главную
					</Link>
					.
				</p>
			</div>
		)
	}

	// 1) raw from URLSearchParams.get(): string | null
	// 2) нормализуем до string | undefined
	const noteParam = getStringParam(sp.get('note'))

	// 3) приводим к Id | null (барьер по форме)
	const noteId = noteParam ? parseId(noteParam) : null

	const notesInProject = db.notes.filter((n) => n.projectId === projectId)

	const selectedNote = noteId
		? (notesInProject.find((n) => n.id === noteId) ?? null)
		: null

	const sidebar = (
		<div className="flex h-full flex-col gap-3">
			<div>
				<div className="text-sm font-semibold">{project.title}</div>
				<div className="wb-tree-meta mt-1">
					уровень:{' '}
					<span className="text-slate-200">
						{project.structure === 'entries' ? '2' : '2/3'}
					</span>{' '}
					• id: <span className="text-slate-200">{project.id}</span>
				</div>
			</div>

			<div className="app-card app-card--soft">
				<div className="font-semibold">Заметки</div>

				<div className="wb-notes-scroll mt-3 flex flex-col gap-2">
					{notesInProject.map((n) => {
						const isActive = selectedNote?.id === n.id

						const href = `/p/${projectId}?note=${encodeURIComponent(n.id)}`

						return (
							<Link
								key={n.id}
								href={href}
								className={[
									'wb-tree-item',
									isActive ? 'wb-tree-item--active' : '',
								].join(' ')}
							>
								<div className="font-semibold">{n.title}</div>
								<div className="wb-tree-meta mt-1">
									id: <span className="text-slate-200">{n.id}</span>
								</div>
							</Link>
						)
					})}
				</div>

				<div className="mt-3">
					<Link
						href={`/p/${projectId}`}
						className="app-btn app-btn-ghost w-fit"
					>
						Сбросить выбор
					</Link>
				</div>
			</div>
		</div>
	)

	const main = (
		<div className="flex flex-col gap-3">
			{!noteParam ? (
				<div className="app-card app-card--soft">
					<div className="font-semibold">Выбери заметку</div>
					<p className="muted mt-1 text-sm">
						Выбери заметку слева или используй поиск.
					</p>
				</div>
			) : !noteId ? (
				<div className="app-card app-card--soft">
					<div className="font-semibold">Некорректный параметр</div>
					<p className="muted mt-1 text-sm">
						note: <span className="kbd">{noteParam}</span>
					</p>
				</div>
			) : selectedNote ? (
				<div className="flex flex-col gap-3 h-full min-h-0">
					<div className="flex flex-wrap items-baseline justify-between gap-2">
						<div>
							<div className="text-lg font-semibold text-slate-100">
								{selectedNote.title}
							</div>
							<div className="wb-tree-meta">
								обновлено:{' '}
								{new Date(selectedNote.updatedAt).toLocaleString('ru-RU')}
							</div>
						</div>
					</div>

					<div className="flex-1 min-h-0">
						<NoteEditorClient
							value={htmlToPlain(selectedNote.contentHtml ?? '')}
							onChange={(next) => updateNoteContent(selectedNote.id, next)}
						/>
					</div>
				</div>
			) : (
				<div className="app-card app-card--soft">
					<div className="font-semibold">Заметка не найдена</div>
					<p className="muted mt-1 text-sm">
						note: <span className="kbd">{noteId}</span>
					</p>
				</div>
			)}
		</div>
	)

	return (
		<section className="app-section pb-0 flex-1 min-h-0">
			<WorkspaceShell sidebar={sidebar} main={main} />
		</section>
	)
}
