// src/app/p/[projectId]/page.tsx
import {notFound} from 'next/navigation'
import Container from '@/app/components/layout/Container'
import {getDefaultDb} from '@/data/demo'
import ProjectWorkspaceNoSSR from './ProjectWorkspaceNoSSR'

type PageProps = {
	params: Promise<{projectId: string}>
}

function parseId(raw: string): Id | null {
	const v = raw.trim()
	if (!v) return null
	return v as Id
}

export default async function ProjectPage({params}: PageProps) {
	const {projectId} = await params

	const pid = parseId(projectId)
	if (!pid) notFound()

	const db = getDefaultDb()
	const project = db.projects.find((p) => p.id === pid)
	if (!project) notFound()

	return (
		<Container className="flex-1 min-h-0 flex flex-col">
			<ProjectWorkspaceNoSSR projectId={projectId} />
		</Container>
	)
}
