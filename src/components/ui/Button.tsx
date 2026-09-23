// src/components/ui/Button.tsx
import type {ButtonHTMLAttributes} from 'react'

type Variant = 'primary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: Variant
}

export default function Button({
	variant = 'ghost',
	className = '',
	...props
}: Props) {
	const v = variant === 'primary' ? 'app-btn-primary' : 'app-btn-ghost'
	return <button className={`app-btn ${v} ${className}`} {...props} />
}
