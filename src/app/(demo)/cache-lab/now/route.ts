// src/app/(demo)/cache-lab/now/route.ts
export const dynamic = 'force-dynamic'

export async function GET() {
	return Response.json({
		generatedAt: new Date().toISOString(),
		random: Math.random().toString(16).slice(2),
		pid: process.pid,
	})
}
