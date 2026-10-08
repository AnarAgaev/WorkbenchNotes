// src/app/(demo)/demo/page.tsx
import Link from "next/link";
import Container from "@/components/layout/Container";

type DemoItem = {
  href: string;
  title: string;
  desc: string;
};

type DemoGroup = {
  title: string;
  desc: string;
  items: DemoItem[];
};

const groups: DemoGroup[] = [
  {
    title: "Модуль 1 — TypeScript-вход для Next",
    desc: "params/searchParams как внешний ввод + базовые контракты типов.",
    items: [
      {
        href: "/demo-contract",
        title: "demo-contract",
        desc: "HelloPayload + Loadable: данные доступны только в состоянии ready.",
      },
      {
        href: "/demo-notes-lab",
        title: "Notes Lab",
        desc: "Сущность DemoNote: union-типы, дефолты и безопасные id.",
      },
      {
        href: "/demo-params/hello",
        title: "demo-params/[value]",
        desc: "params как внешний ввод, всегда string.",
      },
      {
        href: "/demo-search?q=hello",
        title: "demo-search",
        desc: "searchParams: string | string[] | undefined в живом виде.",
      },
    ],
  },
  {
    title: "Модуль 2 — Формы и валидация",
    desc: "Zod (schema/safeParse/flatten) + UI-состояния формы + RHF.",
    items: [
      {
        href: "/demo-form",
        title: "demo-form",
        desc: "Форма как контракт: errors, pending, disable, success state.",
      },
    ],
  },
  {
    title: "Модуль 3 — React Hook Form",
    desc: "Схема как единый контракт",
    items: [
      {
        href: "/demo-rhf",
        title: "demo-rhf",
        desc: "z.infer<typeof schema>",
      },
    ],
  },
  {
    title: "Модуль 4 — Server Actions",
    desc: "Асинхронные функции на сервере",
    items: [
      {
        href: "/form-lab",
        title: "form-lab",
        desc: "форма → Zod → Server Actions",
      },
      {
        href: "/optimistic-lab",
        title: "optimistic-lab",
        desc: "optimistic + rollback (clientId)",
      },
      {
        href: "/autosave-lab",
        title: "autosave-lab",
        desc: "debounce → action, статусы saving/saved/error",
      },
    ],
  },
];

export const metadata = { title: "Demo" };

export default function DemoIndexPage() {
  return (
    <Container className="py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Демо</h1>
          <p className="text-sm muted">
            Лаборатория модулей 1–2. Демки сгруппированы по модулям, чтобы было проще
            ориентироваться в курсе.
          </p>
        </div>

        <Link href="/" className="app-btn app-btn-ghost">
          На главную
        </Link>
      </header>

      <section className="mt-6 grid gap-4">
        {groups.map(g => (
          <div key={g.title} className="app-card">
            <div className="app-section__head">
              <div>
                <div className="text-sm font-semibold">{g.title}</div>
                <p className="mt-1 text-sm muted">{g.desc}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-3">
              {g.items.map(d => (
                <div key={d.href} className="app-card app-card--soft">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{d.title}</div>
                      <p className="mt-1 text-sm muted">{d.desc}</p>
                    </div>

                    <Link href={d.href} className="app-btn app-btn-ghost">
                      Открыть
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </Container>
  );
}
