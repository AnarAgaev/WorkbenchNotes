// src/components/forms/CreateNoteFormClient.tsx
'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {type CreateNoteInput, createNoteSchema} from '@/lib/schemas'

export default function CreateNoteFormClient({
	onCreate,
	disabled,
}: {
	onCreate: (data: CreateNoteInput) => void
	disabled?: boolean
}) {
	const {
		register,
		handleSubmit,
		reset,
		formState: {errors, isSubmitting},
	} = useForm<CreateNoteInput>({
		resolver: zodResolver(createNoteSchema),
		defaultValues: {title: ''},
		shouldFocusError: true,
	})

	const submit = handleSubmit((data) => {
		onCreate(data)
		reset({title: ''})
	})

	return (
		<form onSubmit={submit} className="flex items-start gap-2 mt-2">
			<div className="flex-1">
				<Input
					placeholder="Новая заметка…"
					{...register('title')}
					aria-invalid={Boolean(errors.title)}
					disabled={disabled}
				/>
				{errors.title?.message ? (
					<div className="mt-1 text-xs text-rose-300">
						{errors.title.message}
					</div>
				) : null}
			</div>

			<Button type="submit" disabled={disabled || isSubmitting}>
				+
			</Button>
		</form>
	)
}
