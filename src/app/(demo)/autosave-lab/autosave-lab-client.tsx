// src/app/(demo)/autosave-lab/autosave-lab-client.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { saveAutosaveLabAction } from "@/demo/server/actions/autosaveLabActions";

type Status = "idle" | "saving" | "saved" | "error";

function SaveStatusBadge({ status, updatedAt }: { status: Status; updatedAt: string | null }) {
  if (status === "idle") return <span className="text-xs text-slate-500">idle</span>;
  if (status === "saving") return <span className="text-xs text-slate-300">saving…</span>;
  if (status === "error") return <span className="text-xs text-rose-300">error</span>;
  return <span className="text-xs text-slate-300">saved{updatedAt ? ` • ${updatedAt}` : ""}</span>;
}

export default function AutosaveLabClient() {
  const [draft, setDraft] = useState("");
  const [confirmed, setConfirmed] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const timerRef = useRef<number | null>(null);

  // requestId последнего запущенного сохранения
  const activeRequestIdRef = useRef<string | null>(null);

  const canRun = useMemo(() => draft.trim().length > 0, [draft]);

  const status: Status = useMemo(() => {
    if (!canRun) return "idle";
    if (isSaving) return "saving";
    if (serverError) return "error";
    if (updatedAt) return "saved";
    return "idle";
  }, [canRun, isSaving, serverError, updatedAt]);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (!canRun) return;

    timerRef.current = window.setTimeout(() => {
      const requestId = crypto.randomUUID();

      // фиксируем, что это последний запрос на сохранение
      activeRequestIdRef.current = requestId;

      setIsSaving(true);
      setServerError(null);

      void saveAutosaveLabAction({ text: draft, requestId })
        .then(r => {
          // requestId лежит в разных местах:
          // - ok: true  → r.value.requestId
          // - ok: false → r.requestId
          const rRequestId = r.ok ? r.value.requestId : r.requestId;

          // игнорируем ответы старых запросов
          if (activeRequestIdRef.current !== rRequestId) return;

          if (!r.ok) {
            setServerError(r.error);
            return;
          }

          // confirmed и updatedAt обновляются только по последнему ok: true
          setConfirmed(draft);
          setUpdatedAt(r.value.updatedAt);
        })
        .catch(() => {
          // ошибка сети тоже должна уважать порядок
          if (activeRequestIdRef.current !== requestId) return;
          setServerError("Network error");
        })
        .finally(() => {
          if (activeRequestIdRef.current !== requestId) return;
          setIsSaving(false);
        });
    }, 650);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [draft, canRun]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Демо: autosave (race-safe)</h1>
        <p className="wb-tree-meta mt-1">
          Ввод не блокируется. Результаты старых запросов игнорируются через <code>requestId</code>.
        </p>
      </div>

      <div className="app-card app-card--soft p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="wb-tree-meta">Autosave</div>
          <SaveStatusBadge status={status} updatedAt={updatedAt} />
        </div>

        <div className="space-y-1">
          <div className="text-xs text-slate-400">Draft</div>

          <textarea
            className="app-input w-full min-h-40"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Начните печатать…"
          />
        </div>

        {serverError ? <div className="text-xs text-rose-300">Ошибка: {serverError}</div> : null}

        <div className="app-card app-card--soft p-3">
          <div className="text-xs text-slate-400">Confirmed (последнее сохранённое)</div>
          <div className="mt-2 whitespace-pre-wrap text-sm text-slate-100">
            {confirmed.length === 0 ? "—" : confirmed}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="app-btn app-btn--soft"
            onClick={() => {
              setDraft("");
              setConfirmed("");
              setUpdatedAt(null);
              setServerError(null);
              activeRequestIdRef.current = null;
            }}
            disabled={isSaving}
          >
            Очистить
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/demo" className="app-btn app-btn-ghost">
          Назад в демо
        </Link>
      </div>
    </div>
  );
}
