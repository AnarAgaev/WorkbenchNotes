// src/lib/formStates.ts
import type {CreateProjectFormState, FormLabFormState} from '@/lib/formTypes'

export const formLabFormInitialState: FormLabFormState = {
	ok: false,
	error: null,
	fieldErrors: {},
}

export const createProjectFormInitialState: CreateProjectFormState = {
	ok: false,
	error: null,
	fieldErrors: {},
}
