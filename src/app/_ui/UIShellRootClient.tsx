// src/app/_ui/UIShellRootClient.tsx
'use client'

import {UIShellProvider} from '@/features/uiShell'

export default function UIShellRootClient({
	children,
}: {
	children: React.ReactNode
}) {
	return <UIShellProvider>{children}</UIShellProvider>
}
