// src/app/p/[projectId]/project-workspace-client.tsx
'use client'

import {useSearchParams} from 'next/navigation'
import ProjectTreeClient from '@/app/_ui/ProjectTreeClient'
import WorkspaceShell from '@/app/_ui/WorkspaceShell'
import NoteEditorClient from '@/components/editor/NoteEditorClient'
import {useWorkbenchStore} from '@/lib/workbenchStore'

export default function ProjectWorkspaceClient({projectId}: {projectId: Id}) {
	const sp = useSearchParams()
	const noteId = sp.get('note') ?? ''

	const {getNote, updateNoteContent} = useWorkbenchStore()

	const note = noteId ? getNote(projectId, noteId) : undefined
	function htmlToPlain(html: string) {
		return html
			.replace(/<\/(p|div|li|h\d)>/g, '\n')
			.replace(/<br\s*\/?>/g, '\n')
			.replace(/<[^>]+>/g, '')
			.replace(/\n{3,}/g, '\n\n')
			.trim()
	}

	return (
		<section className="app-section pb-0 flex-1 min-h-0">
			<WorkspaceShell
				sidebar={<ProjectTreeClient projectId={projectId} />}
				main={
					note ? (
						<div className="flex flex-col gap-3 h-full min-h-0">
							<div className="flex flex-wrap items-baseline justify-between gap-2">
								<div>
									<div className="text-lg font-semibold text-slate-100">
										{note.title}
									</div>
									<div className="wb-tree-meta">
										обновлено:{' '}
										{new Date(note.updatedAt).toLocaleString('ru-RU')}
									</div>
								</div>
							</div>

							<div className="flex-1 min-h-0">
								<NoteEditorClient
									value={htmlToPlain(note.contentHtml ?? '')}
									onChange={(next) => updateNoteContent(note.id, next)}
								/>
							</div>
						</div>
					) : (
						<div className="app-card app-card--soft">
							<div className="font-semibold">Выберите заметку</div>
							<p className="muted mt-1 text-sm">
								Выберите заметку слева или используйте поиск.
							</p>
						</div>
					)
				}
			/>
		</section>
	)
}
