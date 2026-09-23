// src/app/_ui/WorkspaceShell.tsx
export default function WorkspaceShell({
	sidebar,
	main,
}: {
	sidebar: React.ReactNode
	main: React.ReactNode
}) {
	return (
		<div className="wb-shell flex-1 min-h-0">
			<aside className="app-card wb-sidebar min-w-0 h-full min-h-0">
				{sidebar}
			</aside>
			<section className="app-card wb-main min-w-0 h-full min-h-0 flex flex-col">
				{main}
			</section>
		</div>
	)
}
