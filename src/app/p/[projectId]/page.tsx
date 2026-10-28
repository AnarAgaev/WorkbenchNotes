// src/app/p/[projectId]/page.tsx
import Container from "@/components/layout/Container";
import ProjectWorkspaceNoSSR from "./ProjectWorkspaceNoSSR";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params; // Next: params async

  return (
    <Container className="flex-1 min-h-0 flex flex-col">
      <ProjectWorkspaceNoSSR projectId={projectId} />
    </Container>
  );
}
