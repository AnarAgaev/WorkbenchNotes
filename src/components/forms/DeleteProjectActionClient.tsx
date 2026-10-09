// src/components/forms/DeleteProjectActionClient.tsx
"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProjectFromForm } from "@/server/actions/workbenchFormActions";
import { deleteProjectFormInitialState } from "@/lib/formStates";
import type { DeleteProjectFormState } from "@/lib/formTypes";
import { useWorkbenchStore } from "@/lib/workbenchStore";

export default function DeleteProjectActionClient({
  projectId,
  onDeleted,
  disabled = false,
  confirmText = "Удалить проект и все его разделы/заметки?",
  className = "wb-icon-btn wb-icon-btn--danger",
  title = "Удалить проект",
}: {
  projectId: Id;
  onDeleted: () => void;
  disabled?: boolean;
  confirmText?: string;
  className?: string;
  title?: string;
}) {
  const router = useRouter();
  const store = useWorkbenchStore();
  const didConfirmRef = useRef(false);

  const [state, formAction, isPending] = useActionState<DeleteProjectFormState, FormData>(
    deleteProjectFromForm,
    deleteProjectFormInitialState
  );

  const [, startTransition] = useTransition();

  useEffect(() => {
    // если сервер отказал — возвращаемся к “серверной истине”
    if (state.ok === false && state.error) {
      void store.refreshFromServer();
      didConfirmRef.current = false;
    }
  }, [state, store]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        e.stopPropagation();

        if (!didConfirmRef.current) {
          e.preventDefault();
          return;
        }

        didConfirmRef.current = false;

        // optimistic delete: сразу убираем проект (и каскадно связанные сущности) из store
        startTransition(() => {
          store.removeProjectLocal(projectId);
          onDeleted();
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="projectId" value={projectId} />

      <button
        type="submit"
        className={`${className} ${isPending ? "opacity-60" : ""}`}
        title={title}
        disabled={disabled || isPending}
        onClick={(e) => {
          e.stopPropagation();

          if (disabled || isPending) {
            e.preventDefault();
            return;
          }

          const ok = window.confirm(confirmText);
          if (!ok) {
            didConfirmRef.current = false;
            e.preventDefault();
            return;
          }

          didConfirmRef.current = true;
        }}
      >
        {isPending ? (
          <span
            aria-label="Удаляем…"
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent"
          />
        ) : (
          "✕"
        )}
      </button>
    </form>
  );
}