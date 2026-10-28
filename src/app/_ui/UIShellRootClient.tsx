// src/app/_ui/UIShellRootClient.tsx
'use client'

import {UIShellProvider} from '@/app/_ui/ui-shell-context'

export default function UIShellRootClient({
	children,
}: {
	children: React.ReactNode
}) {
	return <UIShellProvider>{children}</UIShellProvider>
}
