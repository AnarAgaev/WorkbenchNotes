// src/app/(demo)/cache-lab/_lib/requestBaseUrl.ts
import 'server-only'
import {headers} from 'next/headers'

export async function getRequestBaseUrl() {
	const envSiteUrl =
		process.env.NEXT_PUBLIC_SITE_URL ??
		process.env.SITE_URL ??
		process.env.RENDER_EXTERNAL_URL ??
		null

	const h = await headers() // ключевое: берём host/proto из текущего запроса
	const xfProto = h.get('x-forwarded-proto') ?? 'http'
	const xfHost = h.get('x-forwarded-host')
	const host = h.get('host')

	const hostLike = xfHost ?? host
	const fromHeaders = hostLike ? `${xfProto}://${hostLike}` : null

	const baseUrl = envSiteUrl ?? fromHeaders ?? 'http://localhost:3000'

	return {
		baseUrl,
		envSiteUrl,
		xfProto,
		xfHost: xfHost ?? null,
		host: host ?? null,
		fromHeaders,
	}
}
