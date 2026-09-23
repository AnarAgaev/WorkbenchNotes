// src/lib/Providers.tsx
'use client'

import type React from 'react'
import {WorkbenchStoreProvider} from '@/lib/workbenchStore'

export default function Providers({children}: {children: React.ReactNode}) {
	return <WorkbenchStoreProvider>{children}</WorkbenchStoreProvider>
}
