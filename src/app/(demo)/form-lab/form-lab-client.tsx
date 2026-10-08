// src/app/(demo)/form-lab/form-lab-client.tsx
"use client";

import { useActionState, useState } from "react";
import { submitFormLabFromForm } from "@/demo/server/actions/formLabActions";
import { formLabFormInitialState } from "@/lib/formStates";
import type { FormLabFormState } from "@/lib/formTypes";

function Spinner() {
  // Лёгкий индикатор pending: показываем, что запрос ушёл на сервер.
  return (
    <span className="inline-block h-3 w-3 animate-spin rounded-full border border-slate-400 border-t-transparent align-[-2px]" />
  );
}

export default function FormLabClient() {
  // UI-состояние ввода. Это не серверная истина, а просто текст в инпуте.
  const [title, setTitle] = useState("");

  // Главный паттерн формы на Server Actions:
  // 1) state — состояние формы, которое возвращает серверная функция
  // 2) formAction — функция, которую нужно передать в <form action={...}>
  // 3) isPending — признак, что запрос сейчас выполняется
  const [state, formAction, isPending] = useActionState<FormLabFormState, FormData>(
    submitFormLabFromForm,
    formLabFormInitialState
  );

  return (
    <div className="mt-6 space-y-8">
      <div className="app-card app-card--soft p-4 space-y-4">
        <form
          // Связка формы и Server Action: браузер отправит FormData,
          // Next вызовет submitFormLabFromForm на сервере и вернёт state.
          action={formAction}
          className="space-y-3"
          onSubmit={() => {
            // Сбрасываем UI-ввод при отправке формы.
            // Важно: делаем это в onSubmit, а не через useEffect(state.ok),
            // чтобы не ловить warning про каскадные рендеры.
            setTitle("");
          }}
        >
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Название</label>

            <input
              // name обязателен: именно так значение попадёт в FormData.
              name="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Например: Моя заметка"
              className={`app-input w-full ${
                // Подсветка ошибки управляется серверным состоянием формы.
                state.ok === false && (state.fieldErrors.title || state.error)
                  ? "ring-1 ring-rose-500/60"
                  : ""
              }`}
              autoComplete="off"
              // На pending блокируем ввод, чтобы не было гонок и дублей.
              disabled={isPending}
            />

            {/* Правило показа ошибок:
                1) fieldErrors.title — ошибка конкретного поля (самое точное сообщение)
                2) error — общая ошибка формы (не привязана к конкретному полю)
                3) иначе показываем подсказку */}
            {state.ok === false && state.fieldErrors.title ? (
              <div className="text-xs text-rose-300">{state.fieldErrors.title}</div>
            ) : state.ok === false && state.error ? (
              <div className="text-xs text-rose-300">{state.error}</div>
            ) : (
              <div className="text-xs text-slate-500">Подсказка: минимум 2 символа.</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className={`app-btn app-btn-primary ${isPending ? "opacity-70" : ""}`}
              // Простой UX-guard: не отправляем пустое значение.
              // Сервер всё равно провалидирует, но UX лучше, если кнопку выключить.
              disabled={title.trim().length === 0 || isPending}
            >
              {isPending ? (
                <>
                  <Spinner /> <span className="ml-2">Отправка…</span>
                </>
              ) : (
                "Отправить"
              )}
            </button>

            <button
              type="button"
              className="app-btn app-btn-ghost"
              onClick={() => setTitle("")}
              disabled={isPending}
            >
              Очистить
            </button>
          </div>
        </form>
      </div>

      <div className="app-card app-card--soft p-4">
        <div className="text-sm font-semibold text-slate-100">Состояние формы</div>

        {/* Отладочный вывод: полезен в демо, чтобы видеть форму как контракт:
            state = то, что вернул сервер (ok/error/fieldErrors/value). */}
        <pre className="mt-3 overflow-auto text-xs text-slate-200">
          {JSON.stringify(state, null, 2)}
        </pre>

        {state.ok ? (
          <div className="wb-tree-meta mt-3">
            Сохранено: <code>{state.value.savedAt}</code>
          </div>
        ) : null}
      </div>
    </div>
  );
}
