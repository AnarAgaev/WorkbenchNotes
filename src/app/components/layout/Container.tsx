// src/components/layout/Container.tsx
import type {ReactNode} from 'react'

export default function Container({
	children,
	className = '',
}: {
	children: ReactNode
	className?: string
}) {
	return <div className={`app-container ${className}`.trim()}>{children}</div>
}
