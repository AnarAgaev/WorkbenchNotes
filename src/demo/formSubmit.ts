// src/demo/formSubmit.ts
// Вторая проверка вне UI: имитация submit.
// Теперь ошибки возвращаются в универсальном формате FormErrors.

import { validateTitle, type FormErrors } from "@/demo/formContract";

export type SubmitOk = { ok: true; data: { normalizedTitle: string } };

export type SubmitFail = {
  ok: false;
  errors: FormErrors<"title">;
};

export type SubmitResult = SubmitOk | SubmitFail;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function submitTitleServer(rawTitle: string): Promise<SubmitResult> {
  await delay(500);

  const title = rawTitle.trim();

  // 1) Базовые правила повторяются вне UI
  const baseError = validateTitle(title);
  if (baseError) {
    return { ok: false, errors: { fieldErrors: { title: baseError } } };
  }

  // 2) Пример правила вне UI: ошибка поля
  if (title.toLowerCase() === "admin") {
    return {
      ok: false,
      errors: { fieldErrors: { title: "Это слово зарезервировано." } },
    };
  }

  // 3) Пример ошибки операции: не про поле, а про форму целиком
  if (title.toLowerCase() === "crash") {
    return { ok: false, errors: { formError: "Сервер временно недоступен. Повторите позже." } };
  }

  return { ok: true, data: { normalizedTitle: title } };
}
