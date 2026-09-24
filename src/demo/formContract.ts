// src/demo/formContract.ts
// Контракт ошибок формы: fieldErrors + formError
// и UI-состояния формы: idle/pending/error/success.

export type FieldErrors<Fields extends string> = Partial<Record<Fields, string>>

export type FormErrors<Fields extends string> = {
	fieldErrors?: FieldErrors<Fields>
	formError?: string
}

export type FormUiState<Fields extends string> =
	| {kind: 'idle'}
	| {kind: 'pending'}
	| {kind: 'error'; errors: FormErrors<Fields>}
	| {kind: 'success'; message: string}

// Поля учебной формы demo-form
export type DemoFormFields = 'title'
export type DemoFormState = FormUiState<DemoFormFields>

export function validateTitle(title: string): string | null {
	const v = title.trim()

	if (!v) return 'Введите заголовок.'
	if (v.length > 60) return 'Заголовок слишком длинный (макс. 60).'

	return null
}
