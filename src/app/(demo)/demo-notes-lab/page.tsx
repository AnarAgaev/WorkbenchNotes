// src/app/(demo)/demo-notes-lab/page.tsx
import Link from "next/link";
import Container from "@/components/layout/Container";
import { getNotes, getNoteById } from "@/demo/notesStore";
import { parseNoteId } from "@/demo/noteId";
import { getStringParam } from "@/demo/searchParams";

export const metadata = { title: "Demo Notes Lab" };

type PageProps = {
  searchParams: Promise<{
    note?: string | string[];
  }>;
};

export default async function DemoNotesLabPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const noteParam = getStringParam(sp.note);
  const noteId = noteParam ? parseNoteId(noteParam) : null;
  const selectedNote = noteId ? getNoteById(noteId) : null;

  const notes = getNotes();

  const hasNoteParam = Boolean(noteParam);
  const isInvalidNoteParam = hasNoteParam && !noteId;
  const isMissingNote = Boolean(noteId) && !selectedNote;

  return (
    <Container className="py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Notes Lab</h1>
          <p className="text-sm muted">
            Выбор заметки задаётся через <code className="font-mono">searchParams.note</code>.
            Невалидный ввод не приводит к 404.
          </p>
        </div>

        <Link href="/demo" className="app-btn app-btn-ghost">
          Назад в демо
        </Link>
      </header>

      {(isInvalidNoteParam || isMissingNote) && (
        <div className="mt-6 app-card">
          <div className="text-sm font-semibold">Некорректный выбор заметки</div>

          {isInvalidNoteParam && (
            <p className="mt-1 text-sm muted">
              Значение <code className="font-mono">note</code> не проходит{" "}
              <code className="font-mono">parseNoteId</code>:{" "}
              <code className="font-mono">{noteParam}</code>
            </p>
          )}

          {isMissingNote && (
            <p className="mt-1 text-sm muted">
              Заметка с id <code className="font-mono">{noteId}</code> не найдена в хранилище.
            </p>
          )}
        </div>
      )}

      <section className="mt-6 grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="app-card">
          <div className="text-sm font-semibold">Список заметок</div>

          <div className="mt-3 grid gap-2">
            {notes.map(n => {
              const active = selectedNote?.id === n.id;

              return (
                <Link
                  key={n.id}
                  href={`/demo-notes-lab?note=${n.id}`}
                  className={`app-card app-card--soft ${active ? "ring-1 ring-blue-500/60" : ""}`}
                >
                  <div className="text-sm font-semibold">{n.title}</div>
                  <div className="mt-1 text-xs muted">
                    id: <span className="text-slate-200">{n.id}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="app-card">
          {selectedNote ? (
            <>
              <div className="text-sm font-semibold">{selectedNote.title}</div>

              <div className="mt-2 text-sm text-slate-300">
                <div>status: {selectedNote.status}</div>

                <div className="mt-1">
                  priority: <code className="font-mono">{selectedNote.priority}</code>
                </div>

                <div className="mt-1">
                  id: <code className="font-mono">{selectedNote.id}</code>
                </div>

                <div className="mt-1">
                  createdAt: <code className="font-mono">{selectedNote.createdAt}</code>
                </div>

                <div className="mt-1">
                  updatedAt: <code className="font-mono">{selectedNote.updatedAt}</code>
                </div>

                <div className="mt-3">
                  description:{" "}
                  {selectedNote.description ? (
                    <span>{selectedNote.description}</span>
                  ) : (
                    <span className="muted">пусто</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {selectedNote.tags.map(t => (
                  <span
                    key={t}
                    className="rounded-lg border border-slate-700 bg-slate-900/40 px-2 py-0.5 text-xs text-slate-200"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold">Выбери заметку</div>
              <p className="mt-1 text-sm muted">
                Выбери заметку слева или укажи параметр note в URL.
              </p>
              <div className="mt-3 text-sm muted">
                Пример: <code className="font-mono">/demo-notes-lab?note=n1</code>
              </div>
            </>
          )}
        </div>
      </section>
    </Container>
  );
}
