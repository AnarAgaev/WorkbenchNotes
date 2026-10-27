// src/app/(demo)/state-lab/page.tsx
import Container from '@/components/layout/Container'
import StateLabNoSSR from './StateLabNoSSR'

export const revalidate = 3600

export default function StateLabPage() {
	return (
		<Container>
			<StateLabNoSSR />
		</Container>
	)
}
