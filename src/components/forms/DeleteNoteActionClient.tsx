// src/components/forms/DeleteNoteActionClient.tsx
"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { deleteNoteFromForm } from "@/server/actions/workbenchFormActions";
import { deleteNoteFormInitialState } from "@/lib/formStates";
import type { DeleteNoteFormState } from "@/lib/formTypes";
import { useWorkbenchStore } from "@/lib/workbenchStore";

export default function DeleteNoteActionClient({
  noteId,
  onDeleted,
  disabled = false,
  confirmText = "Удалить заметку?",
  className = "wb-icon-btn wb-icon-btn--danger",
  title = "Удалить заметку",
}: {
  noteId: Id;
  onDeleted: () => void;
  disabled?: boolean;
  confirmText?: string;
  className?: string;
  title?: string;
}) {
  const store = useWorkbenchStore();

  // confirm делаем через ref, чтобы submit не прошёл без подтверждения
  const didConfirmRef = useRef(false);

  const [state, formAction, isPending] = useActionState<DeleteNoteFormState, FormData>(
    deleteNoteFromForm,
    deleteNoteFormInitialState
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
        // важно: не всплывать в кликабельные строки дерева
        e.stopPropagation();

        // если не подтвердили — блокируем submit
        if (!didConfirmRef.current) {
          e.preventDefault();
          return;
        }

        didConfirmRef.current = false;

        // optimistic delete: сразу убираем из store
        startTransition(() => {
          store.removeNoteLocal(noteId);
          onDeleted();
        });
      }}
    >
      <input type="hidden" name="noteId" value={noteId} />

      <button
        type="submit"
        className={`${className} ${isPending ? "opacity-60" : ""}`}
        title={title}
        disabled={disabled || isPending}
        onClick={(e) => {
          // важно: не всплывать в кликабельные строки дерева
          e.stopPropagation();

          if (disabled || isPending) {
            e.preventDefault();
            return;
          }

          // confirm остаётся синхронным и простым (как в уроке)
          const ok = window.confirm(confirmText);
          if (!ok) {
            didConfirmRef.current = false;
            e.preventDefault();
            return;
          }

          // разрешаем следующему submit пройти
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