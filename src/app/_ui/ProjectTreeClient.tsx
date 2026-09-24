// src/app/_ui/ProjectTreeClient.tsx
'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {useEffect, useMemo} from 'react'
import Collapsible from '@/components/ui/Collapsible'
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

	const {getProject, getSections, getNotesByParent} = useWorkbenchStore()

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
					<Collapsible title="Разделы" defaultOpen>
						{sections.map((s) => {
							const active = s.id === activeSectionId
							return (
								<button
									type="button"
									key={s.id}
									className={`wb-tree-item ${active ? 'wb-tree-item--active' : ''}`}
									onClick={() => {
										const next = new URLSearchParams(sp.toString())
										next.set('section', s.id)
										next.delete('note')
										go(next)
									}}
								>
									<div className="text-sm font-semibold">{s.title}</div>
								</button>
							)
						})}
					</Collapsible>
				</div>
			)}

			{/* NOTES */}
			<div className="app-card app-card--soft">
				<div className="flex items-baseline justify-between gap-2 mb-2">
					<div className="text-sm font-semibold">Заметки</div>
					<div className="wb-tree-meta">{notes.length}</div>
				</div>

				<Input
					placeholder="Поиск…"
					value={q}
					onChange={(e) => {
						const v = e.target.value
						const next = new URLSearchParams(sp.toString())
						if (v.trim()) next.set('q', v)
						else next.delete('q')
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
									const next = new URLSearchParams(sp.toString())
									next.set('note', n.id)
									go(next)
								}}
							>
								<div className="text-sm font-semibold">{n.title}</div>
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
