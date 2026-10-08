// src/components/forms/CreateProjectInlineActionClient.tsx
"use client";

import { useActionState, useEffect, useMemo, useRef, useTransition } from "react";
import { useWorkbenchStore } from "@/lib/workbenchStore";
import { createProjectFromForm } from "@/server/actions/workbenchFormActions";
import { createProjectFormInitialState } from "@/lib/formStates";
import type { CreateProjectFormState } from "@/lib/formTypes";

export default function CreateProjectInlineActionClient({
  structure,
  onCancel,
  inputClassName = "",
}: {
  structure: "entries" | "sections";
  onCancel: () => void;
  inputClassName?: string;
}) {
  const store = useWorkbenchStore();
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Защита от повторного submit через blur при переходе формы в pending.
  const submitLockRef = useRef(false);

  // clientId нужен, чтобы optimistic-id совпал с серверным id (p-${clientId})
  const clientId = useMemo(() => crypto.randomUUID(), []);
  const optimisticId = `p-${clientId}`;

  const [state, formAction, isPending] = useActionState<CreateProjectFormState, FormData>(
    createProjectFromForm,
    createProjectFormInitialState
  );

  const [, startTransition] = useTransition();

  useEffect(() => {
    // После завершения action снова разрешаем submit.
    if (!isPending) {
      submitLockRef.current = false;
    }
  }, [isPending]);

  useEffect(() => {
    // UX: сразу фокусируем инпут
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    // успех: просто закрываем инлайн (обновление списка уже optimistic)
    if (state.ok) {
      startTransition(() => onCancel());
      return;
    }

    // ошибка: откатываем optimistic-проект
    if (state.ok === false && (state.error || state.fieldErrors?.title)) {
      startTransition(() => store.removeProjectLocal(optimisticId));
    }
  }, [state, onCancel, startTransition, store, optimisticId]);

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

        // optimistic insert до подтверждения сервера
        const fd = new FormData(e.currentTarget);
        const title = String(fd.get("title") ?? "").trim();
        if (title.length < 2) return;

        startTransition(() => {
          store.insertProjectLocal({
            id: optimisticId,
            title,
            structure,
            createdAt: new Date().toISOString(),
            isDemo: false,
          });
        });
      }}
      className={`space-y-1 ${isPending ? "opacity-60" : ""}`}
    >
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="structure" value={structure} />

      <div className="relative">
        <input
          ref={inputRef}
          name="title"
          placeholder="Новый блокнот…"
          disabled={isPending}
          className={`${inputClassName} pr-9`}
          onKeyDown={(e) => {
            // Escape отменяет
            if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          onBlur={() => {
            // Enter уже мог запустить submit.
            if (submitLockRef.current || isPending) return;

            // UX: blur = submit
            formRef.current?.requestSubmit();
          }}
        />

        {isPending && (
          <span
            aria-label="Сохраняем…"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent"
          />
        )}
      </div>

      {state.ok === false && state.fieldErrors?.title && (
        <div className="text-xs text-rose-300">{state.fieldErrors.title}</div>
      )}
    </form>
  );
}