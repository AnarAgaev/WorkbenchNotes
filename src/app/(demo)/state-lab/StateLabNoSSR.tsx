// src/app/(demo)/state-lab/StateLabNoSSR.tsx
'use client'

import dynamic from 'next/dynamic'

// ✅ Client-only обёртка для демо State Lab.
// - state-lab-client читает client-store
// - store инициализируется демо-данными с "плавающим" временем
// - SSR может дать гидрацию с mismatch (сервер/клиент видят разные значения)
// Поэтому рендерим этот блок только на клиенте через ssr:false.
const StateLabClient = dynamic(() => import('./state-lab-client'), {
	ssr: false,
	loading: () => null,
})

export default function StateLabNoSSR() {
	return <StateLabClient />
}
