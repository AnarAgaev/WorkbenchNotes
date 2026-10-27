// src/app/(demo)/cache-lab/revalidate-tag/actions.ts
'use server'

import {revalidateTag} from 'next/cache'

export async function revalidateDemoTaggedTagAction() {
	// 2-й аргумент — cacheLife profile
	revalidateTag('demo:tagged', 'max')
	return {ok: true as const}
}
