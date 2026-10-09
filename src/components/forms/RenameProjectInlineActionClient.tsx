// src/components/forms/RenameProjectInlineActionClient.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { renameProjectFromForm } from "@/server/actions/workbenchFormActions";
import { renameProjectFormInitialState } from "@/lib/formStates";
import type { RenameProjectFormState } from "@/lib/formTypes";
import { useWorkbenchStore } from "@/lib/workbenchStore";

export default function RenameProjectInlineActionClient({
  projectId,
  initialValue,
  onCancel,
  onPendingChange,
  className = "",
  inputClassName = "",
}: {
  projectId: Id;
  initialValue: string;
  onCancel: () => void;
  onPendingChange?: (pending: boolean) => void;
  className?: string;
  inputClassName?: string;
}) {
  const router = useRouter();
  const store = useWorkbenchStore();

  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [state, formAction, isPending] = useActionState<RenameProjectFormState, FormData>(
    renameProjectFromForm,
    renameProjectFormInitialState
  );

  useEffect(() => {
    // наружу отдаём pending (на будущее/единый стиль)
    onPendingChange?.(isPending);
    return () => onPendingChange?.(false);
  }, [isPending, onPendingChange]);

  useEffect(() => {
    // UX: фокус на инпут
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const submitAndClose = () => {
    // тут мы берём значение прямо из ref: это помогает “submit on blur” без лишнего state
    const raw = inputRef.current?.value ?? "";
    const t = raw.trim();
    if (t.length < 2) return;

    // optimistic rename: UI меняется сразу
    store.renameProjectLocal(projectId, t);

    // затем отправляем форму на серверную action
    formRef.current?.requestSubmit();

    // обновляем server snapshot сразу после сабмита rename
    router.refresh();

    // и закрываем режим редактирования
    onCancel();
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className={`${className} space-y-1 ${isPending ? "opacity-60" : ""}`}
    >
      <input type="hidden" name="projectId" value={projectId} />

      <div className="relative">
        <input
          ref={inputRef}
          name="title"
          defaultValue={initialValue}
          disabled={isPending}
          className={`${inputClassName} pr-9`}
          onKeyDown={(e) => {
            // Enter сохраняет и закрывает
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              submitAndClose();
              return;
            }
            // Escape отменяет
            if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }
          }}
          onBlur={() => {
            // UX: blur = submit
            submitAndClose();
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
      {state.ok === false && state.error && <div className="text-xs text-rose-300">{state.error}</div>}
    </form>
  );
}