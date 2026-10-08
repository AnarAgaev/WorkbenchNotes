// src/app/(demo)/demo-search/page.tsx
import Link from "next/link";
import Container from "@/components/layout/Container";
import { getStringParam } from "@/demo/searchParams";

type SearchParamValue = string | string[] | undefined;

type PageProps = {
  searchParams: Promise<Record<string, SearchParamValue>>;
};

function renderValue(v: SearchParamValue) {
  if (v === undefined) return { kind: "undefined", text: "undefined" };
  if (Array.isArray(v)) return { kind: "string[]", text: v.join(", ") };
  return { kind: "string", text: v };
}

export default async function DemoSearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const qNorm = getStringParam(sp.q);
  const noteNorm = getStringParam(sp.note);
  const tagNorm = getStringParam(sp.tag);

  const q = renderValue(sp.q);
  const note = renderValue(sp.note);
  const tag = renderValue(sp.tag);

  return (
    <Container className="py-10">
      <section className="app-card">
        <h1 className="text-2xl font-semibold">demo-search</h1>

        <p className="muted mt-2 text-sm">
          searchParams приходит из query-строки URL. Один ключ может отсутствовать, встречаться один
          раз или повторяться несколько раз.
        </p>

        <div className="mt-5 grid gap-3 app-card app-card--soft">
          <Row label="q" kind={q.kind} text={q.text} />
          <Row label="note" kind={note.kind} text={note.text} />
          <Row label="tag" kind={tag.kind} text={tag.text} />

          <p className="muted pt-2 text-xs">
            Эта страница ничего не валидирует. Она показывает, что именно пришло из URL.
          </p>
        </div>
        <div className="mt-6 app-card app-card--soft text-sm">
          <div className="font-semibold">normalised</div>

          <div className="mt-3 grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>q</div>
              <code className="font-mono">{JSON.stringify(qNorm)}</code>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>note</div>
              <code className="font-mono">{JSON.stringify(noteNorm)}</code>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>tag</div>
              <code className="font-mono">{JSON.stringify(tagNorm)}</code>
            </div>
          </div>

          <p className="muted mt-3 text-xs">
            normalised значения имеют тип string | undefined. Для массива берётся первый элемент.
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/demo" className="app-btn app-btn-ghost">
          Назад в демо
        </Link>
      </div>
    </Container>
  );
}

function Row(props: { label: string; kind: string; text: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="font-semibold">{props.label}</div>

      <div className="text-right text-sm">
        <div>
          kind: <span className="kbd">{props.kind}</span>
        </div>
        <div className="mt-1">
          value: <span className="kbd">{props.text}</span>
        </div>
      </div>
    </div>
  );
}
