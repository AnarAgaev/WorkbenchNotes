// src/app/p/[projectId]/ProjectWorkspaceNoSSR.tsx
'use client'

import dynamic from 'next/dynamic'

function WorkspaceFallback() {
	return (
		<div className="app-card">
			<div className="font-semibold">Loading workspace…</div>
			<p className="muted mt-1 text-sm">Hydrating client state / URL params…</p>
		</div>
	)
}

const ProjectWorkspaceClient = dynamic(
	() => import('./project-workspace-client'),
	{
		ssr: false,
		loading: () => <WorkspaceFallback />,
	},
)

export default function ProjectWorkspaceNoSSR({projectId}: {projectId: Id}) {
	return <ProjectWorkspaceClient projectId={projectId} />
}
