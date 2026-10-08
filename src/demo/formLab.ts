// src/demo/formLab.ts
import { z } from "zod";

// 1) Zod-схема — единое место для правил и сообщений
const titleSchema = z
  .string()
  .trim()
  .min(1, "Введите заголовок.")
  .max(60, "Заголовок слишком длинный (макс. 60).")
  .refine(v => !/\s{2,}/.test(v), "Заголовок не должен содержать двойные пробелы.");

const createNoteInputSchema = z.object({ title: titleSchema });

export type DemoFormFields = "title";
export type FieldErrors<Fields extends string> = Partial<Record<Fields, string>>;

export type FormErrors<Fields extends string> = {
  fieldErrors?: FieldErrors<Fields>;
  formError?: string;
};

export type SubmitOk = { ok: true; data: { normalizedTitle: string } };
export type SubmitFail = { ok: false; errors: FormErrors<DemoFormFields> };
export type SubmitResult = SubmitOk | SubmitFail;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 2) Client validation — быстрый UX, один результат для поля
export function validateTitleClient(title: string): string | null {
  const res = createNoteInputSchema.safeParse({ title });
  if (res.success) return null;

  const flat = res.error.flatten();
  const msg = flat.fieldErrors.title?.[0];
  return msg ?? "Некорректный заголовок.";
}

// 3) Вторая валидация вне UI — источник правил + бизнес-ограничения
export async function submitTitleOutsideUi(title: string): Promise<SubmitResult> {
  await delay(600);

  // Повторяем те же правила: UI не считается защитой
  const parsed = createNoteInputSchema.safeParse({ title });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const msg = flat.fieldErrors.title?.[0];

    return {
      ok: false,
      errors: {
        fieldErrors: msg ? { title: msg } : undefined,
        formError: flat.formErrors[0],
      },
    };
  }

  const normalizedTitle = parsed.data.title;

  // Пример бизнес-ошибки операции (не ошибка поля)
  // Это показывает, что “вне UI” могут быть правила, которых нет в подсказках.
  if (normalizedTitle.toLowerCase() === "crash") {
    return {
      ok: false,
      errors: { formError: "Операция отклонена правилом системы." },
    };
  }

  return { ok: true, data: { normalizedTitle } };
}
