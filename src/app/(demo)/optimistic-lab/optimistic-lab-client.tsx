// src/app/(demo)/optimistic-lab/optimistic-lab-client.tsx
"use client";

import Link from "next/link";
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  createOptimisticItemFromForm,
  getOptimisticLabSnapshot,
  type OptimisticLabFormState,
} from "@/demo/server/actions/optimisticLabActions";

const initialState: OptimisticLabFormState = { ok: false, error: null, fieldErrors: {} };

type Item = { id: string; title: string; createdAt: string };

export default function OptimisticLabClient() {
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState(() => crypto.randomUUID());

  // optimistic id совпадает с тем id, который вернёт сервер (через clientId)
  const optimisticId = useMemo(() => `i-${clientId}`, [clientId]);

  const [items, setItems] = useState<Item[]>([]);

  const [state, formAction, isPending] = useActionState<OptimisticLabFormState, FormData>(
    createOptimisticItemFromForm,
    initialState
  );

  const [, startTransition] = useTransition();

  // ref используется как "флаг": была ли optimistic-вставка в этом submit
  // ref читается только в эффектах/хендлерах, не в render
  const hadOptimisticInsertRef = useRef(false);

  // refreshFromServer: заменяет локальный список серверным снапшотом
  const refreshFromServer = useCallback(async () => {
    const snapshot = await getOptimisticLabSnapshot();
    startTransition(() => setItems(snapshot.items));
  }, [startTransition]);

  // При старте демо подхватывает серверную истину
  useEffect(() => {
    void refreshFromServer();
  }, [refreshFromServer]);

  useEffect(() => {
    if (state.ok) {
      // success: optimistic элемент уже в списке, дополнительно пересинк не нужен
      hadOptimisticInsertRef.current = false;

      startTransition(() => {
        setTitle("");
        setClientId(crypto.randomUUID());
      });
      return;
    }

    // fail: пересинк нужен только если UI успел сделать optimistic-вставку
    if (!state.ok && (state.error || state.fieldErrors?.title)) {
      if (hadOptimisticInsertRef.current) {
        hadOptimisticInsertRef.current = false;

        // Пересинк вместо rollback:
        // сервер мог не записать вовсе (ошибка) или записать частично (частично)
        void refreshFromServer();

        startTransition(() => {
          // новый clientId нужен, чтобы следующий optimisticId был новым
          setClientId(crypto.randomUUID());
        });
      }
    }
  }, [state, refreshFromServer, startTransition]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Демо: optimistic + пересинк</h1>
        <p className="wb-tree-meta mt-1">
          Слова для проверки: <code>ошибка</code> (сервер откажет) и <code>частично</code> (сервер
          запишет, но вернёт ошибку).
        </p>
      </div>

      <div className="app-card app-card--soft p-4 space-y-3">
        <form
          action={formAction}
          className={`space-y-2 ${isPending ? "opacity-60" : ""}`}
          onSubmit={(e) => {
            // Optimistic вставка делается сразу, до результата сервера
            const fd = new FormData(e.currentTarget);
            const t = String(fd.get("title") ?? "").trim();

            // Если optimistic-вставку не делаем, ref остаётся false.
            // Сервер всё равно провалидирует и может вернуть fieldErrors.
            if (t.length < 2) {
              hadOptimisticInsertRef.current = false;
              return;
            }

            hadOptimisticInsertRef.current = true;

            startTransition(() => {
              setItems((prev) => [
                { id: optimisticId, title: t, createdAt: new Date().toISOString() },
                ...prev,
              ]);
            });
          }}
        >
          {/* clientId уходит на сервер как часть FormData */}
          <input type="hidden" name="clientId" value={clientId} />

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Название</label>
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Мой элемент"
              className={`app-input w-full ${
                !state.ok && state.fieldErrors?.title ? "ring-1 ring-rose-500/60" : ""
              }`}
              autoComplete="off"
              disabled={isPending}
            />

            {!state.ok && state.fieldErrors?.title ? (
              <div className="text-xs text-rose-300">{state.fieldErrors.title}</div>
            ) : null}

            {!state.ok && state.error ? (
              <div className="text-xs text-rose-300">Ошибка: {state.error}</div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" className="app-btn app-btn--primary" disabled={isPending}>
              {isPending ? "Сохраняем…" : "Добавить"}
            </button>

            <button
              type="button"
              className="app-btn app-btn--soft"
              disabled={isPending}
              onClick={() => {
                setTitle("");
                setClientId(crypto.randomUUID());
                hadOptimisticInsertRef.current = false;
              }}
            >
              Очистить
            </button>
          </div>
        </form>
      </div>

      <div className="app-card app-card--soft p-4">
        <div className="text-sm font-semibold text-slate-100">Список (UI)</div>
        {items.length === 0 ? (
          <div className="wb-tree-meta mt-2">Пока пусто.</div>
        ) : (
          <div className="mt-3 space-y-2">
            {items.map((x) => (
              <div key={x.id} className="app-card app-card--soft">
                <div className="text-sm font-semibold text-slate-100 truncate">{x.title}</div>
                <div className="wb-tree-meta mt-1">
                  id: <code>{x.id}</code>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="app-card app-card--soft p-4">
        <div className="text-sm font-semibold text-slate-100">Результат Server Action</div>
        <pre className="mt-3 overflow-auto text-xs text-slate-200">
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/demo" className="app-btn app-btn-ghost">
          Назад в демо
        </Link>
      </div>
    </div>
  );
}
