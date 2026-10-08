// src/app/(demo)/demo-form/FormLabClient.tsx
"use client";

import { useMemo, useState, type SyntheticEvent } from "react";
import { submitTitleOutsideUi, validateTitleClient } from "@/demo/formLab";

export default function FormLabClient() {
  const [title, setTitle] = useState("");
  const [touched, setTouched] = useState(false);

  // “вне UI” результат
  const [serverTitleError, setServerTitleError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isPending, setIsPending] = useState(false);

  // Client validation как derived state:
  // ошибка вычисляется из title и показывается только после touched.
  const clientTitleError = useMemo(() => validateTitleClient(title), [title]);

  const fieldTitleError =
    serverTitleError ?? (touched ? clientTitleError : null);

  const isDisabled = isPending || Boolean(clientTitleError);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    setTouched(true);
    setServerTitleError(null);
    setFormError(null);
    setSuccessMessage(null);

    // 1) Client UX: быстрые ошибки, запрос не делаем
    const err = validateTitleClient(title);
    if (err) return;

    // 2) Pending state
    setIsPending(true);

    try {
      // 3) Вторая проверка вне UI + результат
      const res = await submitTitleOutsideUi(title);

      if (!res.ok) {
        setServerTitleError(res.errors.fieldErrors?.title ?? null);
        setFormError(res.errors.formError ?? null);
        return;
      }

      setSuccessMessage(`Успех: ${res.data.normalizedTitle}`);
    } finally {
      setIsPending(false);
    }
  }

  function reset() {
    setTitle("");
    setTouched(false);
    setServerTitleError(null);
    setFormError(null);
    setSuccessMessage(null);
    setIsPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <label className="block">
        <div className="text-sm font-semibold">Заголовок</div>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={() => setTouched(true)}
          disabled={isPending}
          className="app-input mt-1"
          placeholder="Например: Моя первая заметка"
        />

        {fieldTitleError ? (
          <div className="app-field-error text-rose-700">{fieldTitleError}</div>
        ) : (
          <div className="mt-1 text-sm muted">Максимум 60 символов.</div>
        )}
      </label>

      {formError ? (
        <div className="app-card app-card--soft">
          <div className="font-semibold text-rose-700">Ошибка формы</div>
          <p className="muted mt-1 text-sm">{formError}</p>
        </div>
      ) : null}

      {successMessage ? (
        <div className="app-card app-card--soft">
          <div className="font-semibold text-emerald-300">Успешно</div>
          <p className="muted mt-1 text-sm">{successMessage}</p>
        </div>
      ) : null}

      {isPending ? (
        <div className="app-card app-card--soft">
          <div className="font-semibold">Отправка</div>
          <p className="muted mt-1 text-sm">
            Запрос выполняется. Поле и кнопки заблокированы.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" className="app-btn app-btn-primary" disabled={isDisabled}>
          {isPending ? "Отправка..." : "Отправить"}
        </button>

        <button type="button" className="app-btn app-btn-ghost" onClick={reset} disabled={isPending}>
          Сбросить
        </button>
      </div>
    </form>
  );
}
