// src/app/p/[projectId]/project-workspace-client.tsx
'use client'

import {ProjectWorkspaceContainer} from '@/features/workspace'

export default function ProjectWorkspaceClient({projectId}: {projectId: Id}) {
	return <ProjectWorkspaceContainer projectId={projectId} />
}
