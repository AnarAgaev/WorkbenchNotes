// src/components/ui/Input.tsx
import type {InputHTMLAttributes} from 'react'

type Props = InputHTMLAttributes<HTMLInputElement>

export default function Input({className = '', ...props}: Props) {
	return <input className={`app-input ${className}`} {...props} />
}
