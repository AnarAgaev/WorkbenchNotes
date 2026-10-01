// src/app/_ui/ProjectTreeClient.tsx
'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {useEffect, useMemo, useState} from 'react'
import Collapsible from '@/components/ui/Collapsible'
import InlineEdit from '@/components/ui/InlineEdit'
import Input from '@/components/ui/Input'
import {useWorkbenchStore} from '@/lib/workbenchStore'

function stripHtml(html: string) {
	return html
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

function noteMatches(note: Note, q: string) {
	const qq = q.trim().toLowerCase()
	if (!qq) return true
	const hay = `${note.title} ${stripHtml(note.contentHtml)}`.toLowerCase()
	return hay.includes(qq)
}

export default function ProjectTreeClient({projectId}: {projectId: Id}) {
	const router = useRouter()
	const sp = useSearchParams()

	type Editing =
		| {kind: 'section'; id: string}
		| {kind: 'note'; id: string}
		| null

	const [editing, setEditing] = useState<Editing>(null)
	const [addingSection, setAddingSection] = useState(false)
	const [addingNote, setAddingNote] = useState(false)

	const {
		getProject,
		getSections,
		getNotesByParent,
		createNote,
		renameNote,
		deleteNote,
		createSection,
		renameSection,
		deleteSection,
	} = useWorkbenchStore()

	const project = getProject(projectId)

	const q = sp.get('q') ?? ''
	const noteId = sp.get('note') ?? ''
	const sectionId = sp.get('section') ?? ''

	const sections = useMemo(
		() => (project ? getSections(projectId) : []),
		[project, projectId, getSections],
	)

	const activeSectionId = useMemo(() => {
		if (!project) return ''
		if (project.structure === 'entries') return ''
		return sectionId || sections[0]?.id || ''
	}, [project, sectionId, sections])

	const notesParent = useMemo(() => {
		if (!project) return null

		if (project.structure === 'entries') {
			return {parentType: 'project' as const, parentId: projectId}
		}

		if (!activeSectionId) return null
		return {parentType: 'section' as const, parentId: activeSectionId}
	}, [project, projectId, activeSectionId])

	const notes = useMemo(() => {
		if (!project || !notesParent) return []
		return getNotesByParent(
			projectId,
			notesParent.parentType,
			notesParent.parentId,
		).filter((n) => noteMatches(n, q))
	}, [project, projectId, notesParent, q, getNotesByParent])

	// авто-инициализация URL: section + note (если нет поиска)
	useEffect(() => {
		if (!project) return

		const next = new URLSearchParams(sp.toString())
		let changed = false

		if (project.structure === 'sections') {
			if (!next.get('section') && sections[0]?.id) {
				next.set('section', sections[0].id)
				next.delete('note')
				changed = true
			}
		} else {
			// entries: section не нужен
			if (next.has('section')) {
				next.delete('section')
				changed = true
			}
		}

		// note автоселектим только если нет поиска
		if (!q && !next.get('note')) {
			const pid = projectId

			if (project.structure === 'entries') {
				const list = getNotesByParent(pid, 'project', pid)
				if (list[0]?.id) {
					next.set('note', list[0].id)
					changed = true
				}
			}

			if (project.structure === 'sections') {
				const sid = next.get('section') || activeSectionId
				if (sid) {
					const list = getNotesByParent(pid, 'section', sid)
					if (list[0]?.id) {
						next.set('note', list[0].id)
						changed = true
					}
				}
			}
		}

		if (changed) {
			router.replace(`/p/${projectId}?${next.toString()}`, {scroll: false})
		}
	}, [
		project,
		projectId,
		sp,
		router,
		q,
		sections,
		activeSectionId,
		getNotesByParent,
	])

	if (!project) return null

	const go = (next: URLSearchParams) =>
		router.replace(`/p/${projectId}?${next.toString()}`, {scroll: false})

	return (
		<div className="flex h-full flex-col gap-3">
			<div>
				<div className="text-sm font-semibold">Рабочее пространство</div>
				<div className="wb-tree-meta">{project.title}</div>
			</div>

			{/* STRUCTURE */}
			{project.structure === 'sections' && (
				<div className="app-card app-card--soft">
					<Collapsible
						title="Разделы"
						defaultOpen
						headerRight={
							<button
								type="button"
								className="wb-icon-btn"
								title="Новый раздел"
								onClick={(e) => {
									e.stopPropagation()
									if (editing) return

									// Режимы взаимоисключающие.
									setEditing(null)
									setAddingNote(false)
									setAddingSection((v) => !v)
								}}
							>
								+
							</button>
						}
					>
						{addingSection && (
							<InlineEdit
								initialValue=""
								placeholder="Новый раздел…"
								onSave={(t) => {
									const title = t.trim()
									if (title.length < 2) return

									const created = createSection(projectId, title)

									const next = new URLSearchParams(sp.toString())
									next.set('section', created.id)
									next.delete('note')
									next.delete('q')

									setAddingSection(false)
									router.replace(`/p/${projectId}?${next.toString()}`, {
										scroll: false,
									})
								}}
								onCancel={() => setAddingSection(false)}
								className="mb-2"
								inputClassName="w-full bg-slate-950/20 text-sm font-semibold text-slate-100 outline-none ring-1 ring-slate-500/60 rounded px-2 py-2"
							/>
						)}

						{sections.map((s) => {
							const active = s.id === activeSectionId

							return (
								<div
									key={s.id}
									className={`wb-tree-item ${active ? 'wb-tree-item--active' : ''}`}
									role="button"
									tabIndex={0}
									onClick={() => {
										if (editing) return

										// Клик по строке закрывает редактирование и режимы создания.
										setEditing(null)
										setAddingSection(false)
										setAddingNote(false)

										const next = new URLSearchParams(sp.toString())
										next.set('section', s.id)
										next.delete('note')
										go(next)
									}}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											if (editing) return

											e.preventDefault()

											setEditing(null)
											setAddingSection(false)
											setAddingNote(false)

											const next = new URLSearchParams(sp.toString())
											next.set('section', s.id)
											next.delete('note')
											go(next)
										}
									}}
								>
									<div className="flex items-center justify-between gap-2 w-full">
										{editing?.kind === 'section' && editing.id === s.id ? (
											<InlineEdit
												initialValue={s.title}
												onSave={(t) => {
													const title = t.trim()
													if (title.length < 2) return
													renameSection(s.id, title)
													setEditing(null)
												}}
												onCancel={() => setEditing(null)}
												className="flex-1"
												inputClassName="w-full bg-transparent text-sm font-semibold text-slate-100 outline-none ring-1 ring-slate-500/60 rounded px-2 py-1"
											/>
										) : (
											<div className="text-sm font-semibold truncate">
												{s.title}
											</div>
										)}

										<div className="flex items-center gap-1 shrink-0">
											<button
												type="button"
												className="wb-icon-btn"
												title="Переименовать"
												onClick={(e) => {
													e.stopPropagation()
													setEditing({kind: 'section', id: s.id})
												}}
											>
												✎
											</button>

											<button
												type="button"
												className="wb-icon-btn wb-icon-btn--danger"
												title="Удалить раздел"
												onClick={(e) => {
													e.stopPropagation()

													if (!window.confirm('Удалить раздел и все его заметки?'))
														return

													deleteSection(s.id)

													// Если удалили активный раздел — чистим URL, чтобы не ссылаться на несуществующий section.
													if (activeSectionId === s.id) {
														const next = new URLSearchParams(sp.toString())
														next.delete('section')
														next.delete('note')
														router.replace(
															`/p/${projectId}?${next.toString()}`,
															{scroll: false},
														)
													}
												}}
											>
												✕
											</button>
										</div>
									</div>
								</div>
							)
						})}
					</Collapsible>
				</div>
			)}

			{/* NOTES */}
			<div className="app-card app-card--soft">
				<div className="flex items-center justify-between gap-2 mb-2">
					<div className="text-sm font-semibold">Заметки</div>

					<div className="flex items-center gap-2">
						<div className="wb-tree-meta">{notes.length}</div>

						<button
							type="button"
							className="wb-icon-btn"
							title="Новая заметка"
							disabled={!notesParent}
							onClick={() => {
								// Когда редактируется инпут, строка списка и кнопки не должны перехватывать события.
								if (editing) return

								// Дисциплина UI: режимы создания/редактирования взаимоисключающие.
								setEditing(null)
								setAddingSection(false)
								setAddingNote((v) => !v)
							}}
						>
							+
						</button>
					</div>
				</div>

				{addingNote && (
					<InlineEdit
						initialValue=""
						placeholder="Новая заметка…"
						onSave={(t) => {
							// URL и UI зависят от контекста родителя:
							// entries -> parentType="project", sections -> parentType="section".
							if (!notesParent) return

							// Инлайн-поле допускает blur/Enter, поэтому фильтруем мусор на границе мутации.
							const title = t.trim()
							if (title.length < 2) return

							// Store-мутация возвращает созданный объект: id нужен для ?note=
							const created = createNote(
								projectId,
								notesParent.parentType,
								notesParent.parentId,
								title,
							)

							// Дисциплина URL: выбранная заметка живёт в ссылке.
							const next = new URLSearchParams(sp.toString())
							next.set('note', created.id)

							// Если заметка внутри секции, фиксируем и section, чтобы ссылка однозначно описывала экран.
							if (notesParent.parentType === 'section') {
								next.set('section', notesParent.parentId)
							} else {
								next.delete('section')
							}

							// После создания сбрасываем поиск, иначе новая заметка может не попасть в отфильтрованный список.
							next.delete('q')

							setAddingNote(false)
							router.replace(`/p/${projectId}?${next.toString()}`, {
								scroll: false,
							})
						}}
						onCancel={() => setAddingNote(false)}
						className="mb-2"
						inputClassName="w-full bg-slate-950/20 text-sm font-semibold text-slate-100 outline-none ring-1 ring-slate-500/60 rounded px-2 py-2"
					/>
				)}

				<Input
					placeholder="Поиск…"
					value={q}
					onChange={(e) => {
						const v = e.target.value

						// Поиск тоже живёт в URL: это внешний ввод, который можно шарить ссылкой.
						const next = new URLSearchParams(sp.toString())
						if (v.trim()) next.set('q', v)
						else next.delete('q')

						// При смене фильтра убираем выбранную заметку, чтобы не показывать "старое" состояние.
						next.delete('note')
						go(next)
					}}
				/>

				<div className="mt-3 wb-notes-scroll flex flex-col gap-1">
					{notes.map((n) => {
						const active = n.id === noteId

						return (
							<button
								type="button"
								key={n.id}
								className={`wb-tree-item ${active ? 'wb-tree-item--active' : ''}`}
								onClick={() => {
									// Клик по строке не должен ломать редактирование инлайн-инпута.
									if (editing) return

									setEditing(null)

									const next = new URLSearchParams(sp.toString())
									next.set('note', n.id)

									// replace + scroll:false -> "переключение состояния" без лишней истории и скролла.
									router.replace(`/p/${projectId}?${next.toString()}`, {
										scroll: false,
									})
								}}
							>
								<div className="flex items-center justify-between w-full gap-2">
									{editing?.kind === 'note' && editing.id === n.id ? (
										<InlineEdit
											initialValue={n.title}
											onSave={(t) => {
												const title = t.trim()
												if (title.length < 2) return

												// Переименование — это мутация данных, UI только вызывает store.
												renameNote(n.id, title)
												setEditing(null)
											}}
											onCancel={() => setEditing(null)}
											className="flex-1"
											inputClassName="w-full bg-transparent text-sm font-semibold text-slate-100 outline-none ring-1 ring-slate-500/60 rounded px-2 py-1"
										/>
									) : (
										<div className="text-sm font-semibold truncate">
											{n.title}
										</div>
									)}

									<div className="flex items-center gap-2 shrink-0">
										<span
											role="button"
											tabIndex={0}
											className="text-slate-400 hover:text-slate-200"
											title="Переименовать"
											onClick={(e) => {
												// Внутренние кнопки не должны триггерить выбор строки.
												e.stopPropagation()
												setEditing({kind: 'note', id: n.id})
											}}
											onKeyDown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault()
													e.stopPropagation()
													setEditing({kind: 'note', id: n.id})
												}
											}}
										>
											✎
										</span>

										<span
											role="button"
											tabIndex={0}
											className="text-slate-400 hover:text-rose-300"
											title="Удалить заметку"
											onClick={(e) => {
												e.stopPropagation()

												// Confirm защищает от случайного удаления.
												if (!window.confirm('Удалить заметку?')) return

												deleteNote(n.id)

												// Если удалили активную — чистим URL, чтобы не ссылаться на несуществующую note.
												if (noteId === n.id) {
													const next = new URLSearchParams(sp.toString())
													next.delete('note')
													router.replace(
														`/p/${projectId}?${next.toString()}`,
														{scroll: false},
													)
												}
											}}
											onKeyDown={(e) => {
												if (e.key === 'Enter' || e.key === ' ') {
													e.preventDefault()
													e.stopPropagation()

													if (!window.confirm('Удалить заметку?')) return

													deleteNote(n.id)

													if (noteId === n.id) {
														const next = new URLSearchParams(sp.toString())
														next.delete('note')
														router.replace(
															`/p/${projectId}?${next.toString()}`,
															{scroll: false},
														)
													}
												}
											}}
										>
											✕
										</span>
									</div>
								</div>
							</button>
						)
					})}

					{notes.length === 0 && (
						<div className="wb-tree-meta mt-2">Ничего не найдено.</div>
					)}
				</div>
			</div>

			<div className="mt-auto app-card app-card--soft">
				<div className="text-sm font-semibold mb-2">Примечание</div>
				<div className="wb-tree-meta">
					Сейчас — простой редактор (plain text). В модуле 6 заменим его на
					Quill (rich-text), не меняя архитектуру данных и страниц.
				</div>
			</div>
		</div>
	)
}
