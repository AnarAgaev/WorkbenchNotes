// src/app/_ui/ui-shell-context.tsx
'use client'

import {createContext, useContext, useEffect, useMemo, useState} from 'react'

type UIShellState = {
	focusMode: boolean
}

type UIShellApi = {
	state: UIShellState
	setFocusMode: (v: boolean) => void
	toggleFocusMode: () => void
}

const LS_KEY = 'wb_ui_shell_v1'

const defaultState: UIShellState = {
	focusMode: false,
}

const UIShellContext = createContext<UIShellApi | null>(null)

function safeParseState(raw: string | null): UIShellState | null {
	if (!raw) return null
	try {
		const obj = JSON.parse(raw) as Partial<UIShellState>
		if (typeof obj !== 'object' || obj === null) return null

		const focusMode =
			typeof obj.focusMode === 'boolean' ? obj.focusMode : defaultState.focusMode

		return {focusMode}
	} catch {
		return null
	}
}

export function UIShellProvider({children}: {children: React.ReactNode}) {
	// гидратация из localStorage сразу в initializer (без setState в effect)
	const [state, setState] = useState<UIShellState>(() => {
		if (typeof window === 'undefined') return defaultState
		return safeParseState(window.localStorage.getItem(LS_KEY)) ?? defaultState
	})

	// persist
	useEffect(() => {
		window.localStorage.setItem(LS_KEY, JSON.stringify(state))
	}, [state])

	const api = useMemo<UIShellApi>(() => {
		return {
			state,
			setFocusMode: (v) => setState((s) => ({...s, focusMode: v})),
			toggleFocusMode: () =>
				setState((s) => ({...s, focusMode: !s.focusMode})),
		}
	}, [state])

	return (
		<UIShellContext.Provider value={api}>{children}</UIShellContext.Provider>
	)
}

export function useUIShell() {
	const ctx = useContext(UIShellContext)
	if (!ctx) throw new Error('useUIShell must be used within UIShellProvider')
	return ctx
}
