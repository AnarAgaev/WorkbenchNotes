// src/app/p/[projectId]/page.tsx
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import ProjectWorkspaceNoSSR from "./ProjectWorkspaceNoSSR";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

function parseId(raw: string): Id | null {
  const v = raw.trim();
  if (!v) return null;
  return v as Id;
}

export default async function ProjectPage({ params }: PageProps) {
  const { projectId } = await params;

  const pid = parseId(projectId);
  if (!pid) notFound();

  // На этапе client-store проект не проверяется на сервере.
  // Иначе новый p-... будет всегда попадать в notFound().
  return (
    <Container className="flex-1 min-h-0 flex flex-col">
      <ProjectWorkspaceNoSSR projectId={pid} />
    </Container>
  );
}
