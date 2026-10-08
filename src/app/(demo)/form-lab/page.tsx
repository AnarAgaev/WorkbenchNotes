// src/app/(demo)/form-lab/page.tsx
import Link from "next/link";
import Container from "@/components/layout/Container";
import FormLabClient from "./form-lab-client";
import { readFormLabItems } from "@/demo/server/formLabDb";
import RefreshHistoryButton from "./RefreshHistoryButton";

export const metadata = { title: "form-lab" };

export default async function FormLabPage() {
  const items = await readFormLabItems();

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold">form-lab</h1>

      <p className="mt-3 text-sm muted">
        Server Action принимает <code>FormData</code>, валидирует данные на сервере и возвращает
        результат в виде состояния формы (<code>ok/error/fieldErrors</code>).
      </p>

      <FormLabClient />

      <div className="mt-8 app-card app-card--soft p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-100">История сохранений</div>
          <RefreshHistoryButton />
        </div>

        <div className="mt-3 space-y-2">
          {items.slice(0, 5).map((it, idx) => (
            <div key={idx} className="wb-tree-meta">
              <span className="text-slate-200">{it.title}</span>{" "}
              <span className="text-slate-500">· {it.savedAt}</span>
            </div>
          ))}

          {items.length === 0 ? <div className="wb-tree-meta">Пока пусто.</div> : null}
        </div>
      </div>

      <div className="mt-6 app-card app-card--soft p-4">
        <div className="text-sm font-semibold text-slate-100">Серверная функция готова</div>
        <p className="mt-1 text-sm muted">
          Проверьте файл <code>src/demo/server/actions/formLabActions.ts</code>.
        </p>
      </div>

      <div className="mt-8">
        <Link href="/demo" className="app-btn app-btn-ghost">
          Назад в демо
        </Link>
      </div>
    </Container>
  );
}
