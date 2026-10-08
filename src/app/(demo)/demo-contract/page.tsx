// src/app/(demo)/demo-contract/page.tsx
import Link from "next/link";
import Container from "@/components/layout/Container";
import type { HelloPayload } from "@/demo/contracts";
import { getNotes } from "@/demo/notesStore";
import HelloClient from "./HelloClient";

export default function DemoContractPage() {
  const payload: HelloPayload = {
    appName: "Workbench Notes",
    renderedAt: new Date().toISOString(),
    mode: "server-to-client",

    // Берём готовые демо-данные в полной форме DemoNote
    // (так контракт всегда совпадает с типовой моделью).
    initialNotes: getNotes(),
  };

  return (
    <Container className="py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-100">
          Contract: Server → Client
        </h1>
      </div>

      <p className="mt-2 muted">
        Сервер собирает JSON-совместимые данные по контракту HelloPayload и
        передаёт их в клиентский компонент. Дальше ограничения типов защищают UI
        от невозможных состояний.
      </p>

      <div className="mt-6">
        <HelloClient payload={payload} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/demo" className="app-btn app-btn-ghost">
          Назад в демо
        </Link>
      </div>
    </Container>
  );
}
