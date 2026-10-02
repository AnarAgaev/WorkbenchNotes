// src/lib/formTypes.ts
export type FormLabFormState =
	| {
			ok: true
			value: {
				title: string
				savedAt: string
			}
	  }
	| {ok: false; error: string | null; fieldErrors: {title?: string}}

export type CreateProjectFormState =
	| {
			ok: true
			value: {
				projectId: string
				clientId: string
			}
	  }
	| {
			ok: false
			error: string | null
			fieldErrors: {title?: string; structure?: string}
	  }
