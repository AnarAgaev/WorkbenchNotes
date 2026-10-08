// src/components/forms/DeleteSectionActionClient.tsx
"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { deleteSectionFromForm } from "@/server/actions/workbenchFormActions";
import { deleteSectionFormInitialState } from "@/lib/formStates";
import type { DeleteSectionFormState } from "@/lib/formTypes";
import { useWorkbenchStore } from "@/lib/workbenchStore";

export default function DeleteSectionActionClient({
  sectionId,
  onDeleted,
  disabled = false,
  confirmText = "Удалить раздел и все его заметки?",
  className = "wb-icon-btn wb-icon-btn--danger",
  title = "Удалить раздел",
}: {
  sectionId: Id;
  onDeleted: () => void;
  disabled?: boolean;
  confirmText?: string;
  className?: string;
  title?: string;
}) {
  const store = useWorkbenchStore();

  // confirm-гейт: submit не проходит, пока пользователь не подтвердил
  const didConfirmRef = useRef(false);

  // оставляем ref на форму: пригодится для inline-паттернов (и на будущее расширение)
  const formRef = useRef<HTMLFormElement | null>(null);

  const [state, formAction, isPending] = useActionState<DeleteSectionFormState, FormData>(
    deleteSectionFromForm,
    deleteSectionFormInitialState
  );

  // удаление — “не срочное” UI-обновление
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
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        // важно: не всплывать в кликабельные строки дерева
        e.stopPropagation();

        // блокируем submit без подтверждения
        if (!didConfirmRef.current) {
          e.preventDefault();
          return;
        }

        didConfirmRef.current = false;

        // optimistic delete: сразу убираем раздел (и каскадно связанные заметки) из store
        startTransition(() => {
          store.removeSectionLocal(sectionId);
          onDeleted();
        });
      }}
    >
      <input type="hidden" name="sectionId" value={sectionId} />

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