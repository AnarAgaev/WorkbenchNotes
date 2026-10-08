// src/app/(demo)/demo-params/[value]/page.tsx
import Container from "@/components/layout/Container";
import Link from "next/link";
// src/app/(demo)/demo-params/[value]/page.tsx
// Учебная страница: показывает, что params приходят из URL и всегда являются внешним вводом.
type PageProps = {
  params: Promise<{
    value: string;
  }>;
};

export default async function DemoParamsPage({ params }: PageProps) {
  const { value } = await params;

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold">demo-params</h1>

      <p className="mt-3 text-sm muted">
        params.value приходит из URL как строка. Его нельзя считать корректным типом без проверки.
      </p>

      <div className="mt-4 app-card app-card--soft text-sm">
        <div>
          raw value: <code className="font-mono">{value}</code>
        </div>
        <div className="mt-2">
          length: <code className="font-mono">{value.length}</code>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/demo" className="app-btn app-btn-ghost">
          Назад в демо
        </Link>
      </div>
    </Container>
  );
}
