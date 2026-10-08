// src/components/forms/CreateSectionInlineActionClient.tsx
"use client";

import { useActionState, useEffect, useMemo, useRef, useTransition } from "react";
import { createSectionFromForm } from "@/server/actions/workbenchFormActions";
import { createSectionFormInitialState } from "@/lib/formStates";
import type { CreateSectionFormState } from "@/lib/formTypes";
import { useWorkbenchStore } from "@/lib/workbenchStore";

export default function CreateSectionInlineActionClient({
  projectId,
  onCreated,
  onCancel,
  onPendingChange,
  inputClassName = "",
}: {
  projectId: string;
  onCreated: (sectionId: string) => void;
  onCancel: () => void;
  onPendingChange?: (pending: boolean) => void;
  inputClassName?: string;
}) {
  const store = useWorkbenchStore();
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Защита от двойного submit:
  // pending делает input disabled → происходит blur → blur не должен отправлять форму повторно.
  const submitLockRef = useRef(false);

  // clientId нужен, чтобы optimistic-id совпал с серверным id (s-${clientId})
  const clientId = useMemo(() => crypto.randomUUID(), []);
  const optimisticId = `s-${clientId}`;

  const [state, formAction, isPending] = useActionState<CreateSectionFormState, FormData>(
    createSectionFromForm,
    createSectionFormInitialState
  );

  const [, startTransition] = useTransition();

  useEffect(() => {
    // После завершения action снова разрешаем submit.
    if (!isPending) {
      submitLockRef.current = false;
    }
  }, [isPending]);

  useEffect(() => {
    // UX: фокус инпута
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    // наружу отдаём pending, чтобы можно было disabled “+ заметка”
    onPendingChange?.(isPending);
    return () => onPendingChange?.(false);
  }, [isPending, onPendingChange]);

  useEffect(() => {
    // успех: выбираем раздел и закрываем форму
    if (state.ok) {
      startTransition(() => {
        onCreated(state.sectionId);
        onCancel();
      });
      return;
    }

    // ошибка: откатываем optimistic-секцию
    if (state.ok === false && (state.error || state.fieldErrors?.title)) {
      startTransition(() => store.removeSectionLocal(optimisticId));
    }
  }, [state, onCancel, onCreated, startTransition, store, optimisticId]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        if (submitLockRef.current) {
          e.preventDefault();
          return;
        }

        // Блокируем сразу любой начавшийся submit,
        // в том числе тот, который вернёт серверную validation error.
        submitLockRef.current = true;

        const fd = new FormData(e.currentTarget);
        const title = String(fd.get("title") ?? "").trim();
        if (title.length < 2) return;

        // order считаем из текущего store (для мгновенного UI)
        const nextOrder = store.getSections(projectId).length + 1;

        startTransition(() => {
          store.insertSectionLocal({
            id: optimisticId,
            projectId,
            title,
            order: nextOrder,
            createdAt: new Date().toISOString(),
          });
        });
      }}
      className={`space-y-1 ${isPending ? "opacity-60" : ""}`}
    >
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="projectId" value={projectId} />

      <div className="relative">
        <input
          ref={inputRef}
          name="title"
          placeholder="Новый раздел…"
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