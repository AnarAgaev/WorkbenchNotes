// src/app/(demo)/demo-contract/HelloClient.tsx
"use client";

import { useMemo, useState } from "react";
import type { HelloPayload } from "@/demo/contracts";
import type { Loadable } from "@/demo/loadable";
import { assertNever } from "@/demo/loadable";

type Props = {
  payload: HelloPayload;
};

// Имитируем загрузку: важны состояния UI, а не правильная сеть.
function fakeLoadNotes(source: DemoNote[]): Promise<DemoNote[]> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (Math.random() < 0.2) {
        reject(new Error("Не удалось загрузить заметки. Повторите попытку."));
        return;
      }
      resolve(source);
    }, 500);
  });
}

export default function HelloClient({ payload }: Props) {
  const [clicks, setClicks] = useState(0);

  // Loadable: данные доступны только в состоянии ready
  const [notes, setNotes] = useState<Loadable<DemoNote[]>>({
    state: "ready",
    data: payload.initialNotes,
  });

  // Фильтр на union-типе, без произвольных строк
  const [statusFilter, setStatusFilter] = useState<DemoNoteStatus | "all">(
    "all"
  );

  const renderedLabel = useMemo(() => {
    return `${payload.appName} / ${payload.mode}`;
  }, [payload.appName, payload.mode]);

  async function reloadNotes() {
    setNotes({ state: "loading" });

    try {
      const loaded = await fakeLoadNotes(payload.initialNotes);
      setNotes({ state: "ready", data: loaded });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Неизвестная ошибка загрузки.";
      setNotes({ state: "error", message });
    }
  }

  function renderNotes(state: Loadable<DemoNote[]>) {
    switch (state.state) {
      case "idle":
        return <p className="muted">Заметки ещё не загружались.</p>;

      case "loading":
        return <p className="muted">Загрузка…</p>;

      case "error":
        return <p className="text-sm text-red-400">{state.message}</p>;

      case "ready": {
        const filtered =
          statusFilter === "all"
            ? state.data
            : state.data.filter(n => n.status === statusFilter);

        return (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-300">Фильтр:</span>

              <button
                type="button"
                className={
                  statusFilter === "all"
                    ? "app-btn"
                    : "app-btn app-btn-ghost"
                }
                onClick={() => setStatusFilter("all")}
              >
                all
              </button>

              {(["draft", "published", "archived"] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  className={
                    statusFilter === s ? "app-btn" : "app-btn app-btn-ghost"
                  }
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <ul className="grid gap-3">
              {filtered.map(n => (
                <li key={n.id} className="app-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium text-slate-100">{n.title}</div>

                    <span className="rounded-lg border border-slate-700 bg-slate-900/40 px-2 py-0.5 text-xs text-slate-200">
                      {n.status}
                    </span>

                    <span className="text-xs text-slate-400">id: {n.id}</span>

                    <span className="rounded-lg border border-slate-700 bg-slate-900/40 px-2 py-0.5 text-xs text-slate-200">
                      priority: {n.priority}
                    </span>
                  </div>

                  {n.description ? (
                    <p className="mt-2 text-sm text-slate-300">{n.description}</p>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">
                      description: пусто
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {n.tags.map(t => (
                      <span
                        key={t}
                        className="rounded-lg border border-slate-700 bg-slate-900/40 px-2 py-0.5 text-xs text-slate-200"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    <div>
                      createdAt: <code className="font-mono">{n.createdAt}</code>
                    </div>
                    <div>
                      updatedAt: <code className="font-mono">{n.updatedAt}</code>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      }

      default:
        return assertNever(state);
    }
  }

  return (
    <section className="space-y-4">
      <div className="app-card">
        <div className="text-sm text-slate-300">{renderedLabel}</div>

        <div className="mt-3 text-sm">
          <div className="text-slate-300">
            renderedAt (server):{" "}
            <code className="font-mono text-slate-200">{payload.renderedAt}</code>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="app-btn"
            onClick={() => setClicks(c => c + 1)}
          >
            Clicks: {clicks}
          </button>

          <button
            type="button"
            className="app-btn app-btn-ghost"
            onClick={reloadNotes}
            disabled={notes.state === "loading"}
          >
            Reload notes
          </button>
        </div>
      </div>

      <div className="app-card">{renderNotes(notes)}</div>
    </section>
  );
}
