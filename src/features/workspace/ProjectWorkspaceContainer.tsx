// src/features/workspace/ProjectWorkspaceContainer.tsx
'use client'

import hljs from 'highlight.js'
import {useEffect} from 'react'
import {useProjectWorkspace} from './index'
import ProjectWorkspaceView from './ProjectWorkspaceView'

export default function ProjectWorkspaceContainer({
	projectId,
}: {
	projectId: Id
}) {
	const ws = useProjectWorkspace(projectId)

	useEffect(() => {
		if (ws.mode !== 'view') return

		// Подсветка — побочный эффект после рендера HTML, поэтому живёт в контейнере,
		// а не в dumb view.
		document.querySelectorAll('pre.hljs code.hljs').forEach((el) => {
			hljs.highlightElement(el as HTMLElement)
		})
	}, [ws.mode, ws.previewHtml])

	return (
		<ProjectWorkspaceView
			projectId={projectId}
			projectExists={Boolean(ws.project)}
			note={ws.note}
			mode={ws.mode}
			focusMode={ws.focusMode}
			previewHtml={ws.previewHtml}
			saveInfo={ws.saveInfo}
			onToggleMode={ws.toggleMode}
			onToggleFocusMode={ws.toggleFocusMode}
			onChangeHtml={ws.onChangeHtml}
		/>
	)
}
