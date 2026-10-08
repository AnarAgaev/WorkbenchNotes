// src/app/(demo)/demo-rhf/ManualBigFormClient.tsx
"use client";

import { useMemo, useState } from "react";
import type { SyntheticEvent } from "react";
import {
  hasAnyErrors,
  validateRhfMotivation,
  type RhfMotivationInput,
} from "@/demo/rhfMotivationSchemas";

type Touched = Partial<Record<keyof RhfMotivationInput, boolean>>;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function ManualBigFormClient() {
  const [values, setValues] = useState<RhfMotivationInput>({
    title: "",
    email: "",
    about: "",
  });

  const [touched, setTouched] = useState<Touched>({});
  const [didSubmit, setDidSubmit] = useState(false);

  // Pending и результат тоже приходится вести вручную
  const [isPending, setIsPending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Client validation как derived state: вычисляется из values
  const errs = useMemo(() => validateRhfMotivation(values), [values]);

  function markTouched(name: keyof RhfMotivationInput) {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function visibleError(name: keyof RhfMotivationInput): string | undefined {
    // Ошибку показываем после касания поля или после попытки submit
    if (!didSubmit && !touched[name]) return undefined;
    return errs[name];
  }

  const canSubmit = !isPending;

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    setDidSubmit(true);
    setSuccessMessage(null);

    // На submit пересчитываем ошибки, чтобы не зависеть от timing рендера
    const now = validateRhfMotivation(values);
    if (hasAnyErrors(now)) return;

    setIsPending(true);
    await sleep(500); // имитация отправки
    setIsPending(false);

    setSuccessMessage(`Успех: ${values.title.trim()}`);
  }

  function reset() {
    setValues({ title: "", email: "", about: "" });
    setTouched({});
    setDidSubmit(false);
    setIsPending(false);
    setSuccessMessage(null);
  }

  return (
    <section className="app-card app-card--soft mt-6">
      <div className="text-sm font-semibold">Форма без RHF (ручная логика)</div>
      <p className="muted mt-1 text-sm">
        Здесь вручную поддерживаются значения, touched-логика, показ ошибок после blur/submit,
        pending и success.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <label className="block">
          <div className="text-sm font-semibold">Заголовок</div>
          <input
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            onBlur={() => markTouched("title")}
            disabled={isPending}
            className={["app-input", visibleError("title") ? "app-input--error" : ""].join(" ")}
            placeholder="Например: Моя заметка"
          />
          {visibleError("title") ? (
            <div className="app-field-error text-rose-700">{visibleError("title")}</div>
          ) : (
            <div className="mt-1 text-sm muted">Максимум 60 символов.</div>
          )}
        </label>

        <label className="block">
          <div className="text-sm font-semibold">Email</div>
          <input
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            onBlur={() => markTouched("email")}
            disabled={isPending}
            className={["app-input", visibleError("email") ? "app-input--error" : ""].join(" ")}
            placeholder="name@example.com"
          />
          {visibleError("email") ? (
            <div className="app-field-error text-rose-700">{visibleError("email")}</div>
          ) : (
            <div className="mt-1 text-sm muted">Нужно для примера второго поля.</div>
          )}
        </label>

        <label className="block">
          <div className="text-sm font-semibold">Описание</div>
          <textarea
            value={values.about}
            onChange={(e) => setValues((v) => ({ ...v, about: e.target.value }))}
            onBlur={() => markTouched("about")}
            disabled={isPending}
            rows={4}
            className={["app-input", visibleError("about") ? "app-input--error" : ""].join(" ")}
            placeholder="Короткое описание (до 140 символов)"
          />
          {visibleError("about") ? (
            <div className="app-field-error text-rose-700">{visibleError("about")}</div>
          ) : (
            <div className="mt-1 text-sm muted">Максимум 140 символов.</div>
          )}
        </label>

        {successMessage ? (
          <div className="app-card">
            <div className="font-semibold text-emerald-300">Успешно</div>
            <p className="muted mt-1 text-sm">{successMessage}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={!canSubmit} className="app-btn app-btn-primary">
            {isPending ? "Отправка…" : "Отправить"}
          </button>

          <button
            type="button"
            onClick={reset}
            disabled={isPending}
            className="app-btn app-btn-ghost"
          >
            Сбросить
          </button>
        </div>
      </form>
    </section>
  );
}
