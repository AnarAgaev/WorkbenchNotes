// src/components/forms/CreateNoteInlineActionClient.tsx
"use client";

import { useActionState, useEffect, useMemo, useRef, useTransition } from "react";
import { createNoteFromForm } from "@/server/actions/workbenchFormActions";
import { createNoteFormInitialState } from "@/lib/formStates";
import type { CreateNoteFormState } from "@/lib/formTypes";
import { useWorkbenchStore } from "@/lib/workbenchStore";

export default function CreateNoteInlineActionClient({
  projectId,
  parentType,
  parentId,
  onCreated,
  onCancel,
  onPendingChange,
  inputClassName = "",
}: {
  projectId: string;
  parentType: "project" | "section";
  parentId: string;
  onCreated: (noteId: string) => void;
  onCancel: () => void;
  onPendingChange?: (pending: boolean) => void;
  inputClassName?: string;
}) {
  const store = useWorkbenchStore();
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Защита от двойного submit:
  // Enter запускает action → input становится disabled → происходит blur.
  // Без блокировки blur успевает отправить форму второй раз.
  const submitLockRef = useRef(false);

  // clientId нужен, чтобы optimistic-id совпал с серверным id (n-${clientId})
  const clientId = useMemo(() => crypto.randomUUID(), []);
  const optimisticId = `n-${clientId}`;

  // useActionState даёт нам: state (ok/error/fieldErrors), formAction и isPending
  const [state, formAction, isPending] = useActionState<CreateNoteFormState, FormData>(
    createNoteFromForm,
    createNoteFormInitialState
  );

  // startTransition используем для “не срочных” UI-обновлений (optimistic insert/rollback/close)
  const [, startTransition] = useTransition();

  useEffect(() => {
    // После завершения action снова разрешаем submit.
    // Это важно, если сервер вернул настоящую ошибку и пользователь хочет повторить ввод.
    if (!isPending) {
      submitLockRef.current = false;
    }
  }, [isPending]);

  useEffect(() => {
    // UX: сразу фокусируем инпут при открытии
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    // наружу отдаём pending, чтобы можно было disabled соседние кнопки
    onPendingChange?.(isPending);
    return () => onPendingChange?.(false);
  }, [isPending, onPendingChange]);

  useEffect(() => {
    // успех: закрываем форму и отдаём id наружу (для выбора заметки через URL)
    if (state.ok) {
      startTransition(() => {
        onCreated(state.noteId);
        onCancel();
      });
      return;
    }

    // ошибка: если успели вставить optimistic-заметку — откатываем
    if (state.ok === false && (state.error || state.fieldErrors?.title)) {
      startTransition(() => store.removeNoteLocal(optimisticId));
    }
  }, [state, onCancel, onCreated, startTransition, store, optimisticId]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        // Не допускаем второй submit от blur, пока уже идёт отправка.
        if (submitLockRef.current) {
          e.preventDefault();
          return;
        }

        // Блокируем сразу любой начавшийся submit,
        // в том числе тот, который вернёт серверную validation error.
        submitLockRef.current = true;

        // optimistic insert делаем в onSubmit до того, как сервер подтвердит
        const fd = new FormData(e.currentTarget);
        const title = String(fd.get("title") ?? "").trim();
        if (title.length < 2) return;

        const now = new Date().toISOString();

        startTransition(() => {
          store.insertNoteLocal({
            id: optimisticId,
            projectId,
            parentType,
            parentId,
            title,
            contentHtml: "",
            // contentHtml: "<p><br></p>",
            updatedAt: now,
          });
        });
      }}
      className={`space-y-1 ${isPending ? "opacity-60" : ""}`}
    >
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="parentType" value={parentType} />
      <input type="hidden" name="parentId" value={parentId} />

      <div className="relative">
        <input
          ref={inputRef}
          name="title"
          placeholder="Новая заметка…"
          disabled={isPending}
          className={`${inputClassName} pr-9`}
          onKeyDown={(e) => {
            // Escape отменяет ввод
            if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          onBlur={() => {
            // Enter уже мог запустить submit.
            if (submitLockRef.current || isPending) return;

            // UX: blur = submit (как inline-редактирование)
            formRef.current?.requestSubmit();
          }}
        />

        {/* лёгкий pending UI: спиннер справа */}
        {isPending && (
          <span
            aria-label="Сохраняем…"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent"
          />
        )}
      </div>

      {/* полевая ошибка (title) */}
      {state.ok === false && state.fieldErrors?.title && (
        <div className="text-xs text-rose-300">{state.fieldErrors.title}</div>
      )}
    </form>
  );
}