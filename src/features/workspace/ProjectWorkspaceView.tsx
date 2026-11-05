// src/features/workspace/ProjectWorkspaceView.tsx
'use client'

import Link from 'next/link'
import ProjectTreeClient from '@/app/_ui/ProjectTreeClient'
import WorkspaceShell from '@/app/_ui/WorkspaceShell'
import {Button} from '@/ui'
import NoteEditorClient from '@/ui/NoteEditorClient'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type SaveInfo = {
	status: SaveStatus
}

type Props = {
	projectId: Id

	projectExists: boolean

	note?: {
		id: Id
		title: string
		updatedAt: string
		contentHtml: string
	}

	mode: 'edit' | 'view'
	focusMode: boolean

	previewHtml: string

	saveInfo: SaveInfo

	onToggleMode: () => void
	onToggleFocusMode: () => void
	onChangeHtml: (nextHtml: string) => void
}

export default function ProjectWorkspaceView({
	projectId,
	projectExists,
	note,
	mode,
	focusMode,
	previewHtml,
	saveInfo,
	onToggleMode,
	onToggleFocusMode,
	onChangeHtml,
}: Props) {
	if (!projectExists) {
		return (
			<div className="app-card">
				<div className="font-semibold">Проект не найден</div>
				<p className="muted mt-1 text-sm">
					Вернитесь на{' '}
					<Link className="app-link" href="/">
						главную
					</Link>
					.
				</p>
			</div>
		)
	}

	return (
		<section className="app-section pb-0 flex-1 min-h-0">
			<WorkspaceShell
				sidebar={<ProjectTreeClient projectId={projectId} />}
				sidebarHidden={focusMode}
				main={
					note ? (
						<div className="flex flex-col gap-3 h-full min-h-0">
							<div className="wb-note-head">
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div>
										<div className="text-lg font-semibold text-slate-100">
											{note.title}
										</div>
										<div className="wb-tree-meta">
											обновлено:{' '}
											{new Date(note.updatedAt).toLocaleString('ru-RU')}
											{saveInfo.status === 'saving' && ' • сохранение…'}
											{saveInfo.status === 'saved' && ' • сохранено'}
											{saveInfo.status === 'error' && ' • ошибка сохранения'}
										</div>
									</div>

									<div className="flex gap-2">
										<button
											type="button"
											className={`app-btn ${
												focusMode ? 'app-btn--primary' : 'app-btn--soft'
											}`}
											onClick={onToggleFocusMode}
											title="Экран: скрыть панель слева и оставить редактор"
										>
											Экран
										</button>

										<Button variant="ghost" onClick={onToggleMode}>
											{mode === 'edit' ? 'Просмотр' : 'Редактор'}
										</Button>
									</div>
								</div>
							</div>

							<div className="flex-1 min-h-0">
								{mode === 'edit' ? (
									<NoteEditorClient
										key={note.id}
										value={note.contentHtml}
										onChange={onChangeHtml}
									/>
								) : (
									<div key={note.id} className="wb-viewer ql-snow">
										<div
											className="ql-editor"
											dangerouslySetInnerHTML={{__html: previewHtml}}
										/>
									</div>
								)}
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
