// src/app/(demo)/demo-notes-lab/[id]/page.tsx
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DemoNotesLabLegacyPage({ params }: PageProps) {
  const { id } = await params;

  // Старые ссылки вида /demo-notes-lab/n1 продолжают работать,
  // но дальше всё обрабатывается на /demo-notes-lab через searchParams.note.
  redirect(`/demo-notes-lab?note=${encodeURIComponent(id)}`);
}
