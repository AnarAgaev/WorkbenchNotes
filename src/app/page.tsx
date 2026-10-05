// src/app/page.tsx
'use client'

import {useRouter} from 'next/navigation'
import {useMemo, useState} from 'react'

import Container from '@/app/components/layout/Container'
import CreateProjectInlineActionClient from '@/components/forms/CreateProjectInlineActionClient'
import InlineEdit from '@/components/ui/InlineEdit'
import {useWorkbenchStore} from '@/lib/workbenchStore'

export default function HomePage() {
	const router = useRouter()

	const {db, renameProject, deleteProject, isDemoProject} = useWorkbenchStore()

	const [adding, setAdding] = useState(false)
	const [editingProjectId, setEditingProjectId] = useState<Id | null>(null)

	const {colEntries, colSections} = useMemo(() => {
		const all: Project[] = db.projects ?? []

		const sortDemoFirst = (a: Project, b: Project) => {
			const ad = isDemoProject(a.id) ? 0 : 1
			const bd = isDemoProject(b.id) ? 0 : 1
			if (ad !== bd) return ad - bd

			const ac = a.createdAt ?? ''
			const bc = b.createdAt ?? ''
			return bc.localeCompare(ac)
		}

		const entries = all
			.filter((p) => p.structure === 'entries')
			.sort(sortDemoFirst)
		const sections = all
			.filter((p) => p.structure === 'sections')
			.sort(sortDemoFirst)

		return {colEntries: entries, colSections: sections}
	}, [db.projects, isDemoProject])

	const ProjectRow = ({p}: {p: Project}) => {
		const demo = isDemoProject(p.id)
		const isEditing = editingProjectId === p.id

		const rowClass =
			'app-card app-card--soft cursor-pointer hover:border-slate-500/70 hover:bg-white/5 transition-colors ' +
			(demo ? 'app-card--demo' : '')

		return (
			<div
				className={rowClass}
				role="button"
				tabIndex={0}
				onClick={() => {
					if (isEditing) return
					router.push(`/p/${p.id}`)
				}}
				onKeyDown={(e) => {
					if (isEditing) return
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						router.push(`/p/${p.id}`)
					}
				}}
			>
				<div className="flex items-center justify-between gap-2">
					<div className="min-w-0 flex-1">
						{isEditing ? (
							<InlineEdit
								key={`project-rename-${p.id}`}
								initialValue={p.title}
								onSave={(t) => {
									renameProject(p.id, t)
									setEditingProjectId(null)
								}}
								onCancel={() => setEditingProjectId(null)}
								className="w-full"
								inputClassName="w-full bg-transparent text-sm font-semibold text-slate-100 outline-none ring-1 ring-slate-500/60 rounded px-2 py-1"
							/>
						) : (
							<div className="truncate text-sm font-semibold text-slate-100">
								{p.title}
							</div>
						)}
					</div>

					{!demo && (
						<div className="flex items-center gap-1 shrink-0">
							<button
								type="button"
								className="wb-icon-btn"
								title="Переименовать"
								onClick={(e) => {
									e.stopPropagation()
									setEditingProjectId(p.id)
								}}
							>
								✎
							</button>

							<button
								type="button"
								className="wb-icon-btn wb-icon-btn--danger"
								title="Удалить проект"
								onClick={(e) => {
									e.stopPropagation()
									if (!window.confirm('Удалить проект и все его данные?')) return
									deleteProject(p.id)
									setEditingProjectId(null)
								}}
							>
								✕
							</button>
						</div>
					)}
				</div>
			</div>
		)
	}

	return (
		<Container>
			<section className="app-section">
				<div className="app-section__head">
					<div>
						<p className="muted mt-1">RHF + Zod + CRUD</p>
					</div>

					<button
						type="button"
						className="app-btn"
						onClick={() => {
							setEditingProjectId(null)
							setAdding((v) => !v)
						}}
					>
						+ Новый блокнот
					</button>
				</div>

				{adding && (
					<CreateProjectInlineActionClient
						onCancel={() => {
							setAdding(false)
							setEditingProjectId(null)
						}}
					/>
				)}

				<div className="grid gap-6 lg:grid-cols-2">
					<div className="space-y-3">
						<div className="flex items-baseline justify-between">
							<div className="text-sm font-semibold text-slate-100">Заметки</div>
							<div className="wb-tree-meta">{colEntries.length}</div>
						</div>

						<div className="space-y-2">
							{colEntries.map((p) => (
								<ProjectRow key={p.id} p={p} />
							))}
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-baseline justify-between">
							<div className="text-sm font-semibold text-slate-100">
								Вложенные заметки
							</div>
							<div className="wb-tree-meta">{colSections.length}</div>
						</div>

						<div className="space-y-2">
							{colSections.map((p) => (
								<ProjectRow key={p.id} p={p} />
							))}
						</div>
					</div>
				</div>

				<section className="mt-8">
					<div
						className="app-card app-card--soft cursor-pointer hover:border-slate-500/70 hover:bg-white/5 transition-colors"
						role="button"
						tabIndex={0}
						onClick={() => router.push('/demo')}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault()
								router.push('/demo')
							}
						}}
					>
						<div className="text-sm font-semibold text-slate-100">
							Лаборатория учебных паттернов
						</div>
					</div>
				</section>
			</section>
		</Container>
	)
}
