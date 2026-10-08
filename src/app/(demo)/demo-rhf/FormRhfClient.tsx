// src/app/(demo)/demo-rhf/FormRhfClient.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rhfMotivationSchema, type RhfMotivationInput } from "@/demo/rhfMotivationSchema";

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function FormRhfClient() {
  const [result, setResult] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RhfMotivationInput>({
    resolver: zodResolver(rhfMotivationSchema),
    defaultValues: { title: "", email: "", about: "" },
    mode: "onBlur",
  });

  async function onValid(data: RhfMotivationInput) {
    setResult(null);
    await sleep(350);
    setResult(`Успех: ${data.title}`);
  }

  function onReset() {
    reset();
    setResult(null);
  }

  return (
    <section className="app-card app-card--soft mt-6">
      <div className="text-sm font-semibold">Та же форма на RHF + zodResolver</div>
      <p className="muted mt-1 text-sm">
        Тип формы берётся из схемы через <span className="kbd">z.infer</span>.
      </p>

      <form onSubmit={handleSubmit(onValid)} className="mt-4 space-y-4">
        <label className="block">
          <div className="text-sm font-semibold">Заголовок</div>
          <input
            {...register("title")}
            disabled={isSubmitting}
            className={["app-input", errors.title ? "app-input--error" : ""].join(" ")}
            placeholder="Например: Моя первая заметка"
          />
          {errors.title ? (
            <div className="app-field-error text-rose-700">{errors.title.message}</div>
          ) : (
            <div className="mt-1 text-sm muted">Максимум 60 символов.</div>
          )}
        </label>

        <label className="block">
          <div className="text-sm font-semibold">Email</div>
          <input
            {...register("email")}
            disabled={isSubmitting}
            className={["app-input", errors.email ? "app-input--error" : ""].join(" ")}
            placeholder="name@example.com"
          />
          {errors.email ? (
            <div className="app-field-error text-rose-700">{errors.email.message}</div>
          ) : (
            <div className="mt-1 text-sm muted">Нужен для примера второго поля.</div>
          )}
        </label>

        <label className="block">
          <div className="text-sm font-semibold">Описание</div>
          <textarea
            {...register("about")}
            disabled={isSubmitting}
            rows={4}
            className={["app-input", errors.about ? "app-input--error" : ""].join(" ")}
            placeholder="Коротко: зачем RHF бывает нужен"
          />
          {errors.about ? (
            <div className="app-field-error text-rose-700">{errors.about.message}</div>
          ) : (
            <div className="mt-1 text-sm muted">Максимум 140 символов.</div>
          )}
        </label>

        {result ? (
          <div className="app-card">
            <div className="font-semibold text-emerald-300">Успешно</div>
            <p className="muted mt-1 text-sm">{result}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={isSubmitting} className="app-btn app-btn-primary">
            {isSubmitting ? "Отправка…" : "Отправить"}
          </button>

          <button type="button" onClick={onReset} disabled={isSubmitting} className="app-btn app-btn-ghost">
            Сбросить
          </button>
        </div>
      </form>
    </section>
  );
}
