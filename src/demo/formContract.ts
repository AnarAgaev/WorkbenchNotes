// src/demo/formContract.ts
// Контракт ошибок формы: fieldErrors + formError
// и UI-состояния формы: idle/pending/error/success.
// import { ZodError } from "zod";
import { createNoteInputSchema } from "@/demo/noteSchemas";

export type FieldErrors<Fields extends string> = Partial<Record<Fields, string>>;

export type FormErrors<Fields extends string> = {
  fieldErrors?: FieldErrors<Fields>;
  formError?: string;
};

export type FormUiState<Fields extends string> =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "error"; errors: FormErrors<Fields> }
  | { kind: "success"; message: string };

// Поля учебной формы demo-form
export type DemoFormFields = "title";
export type DemoFormState = FormUiState<DemoFormFields>;

export function validateTitle(title: string): string | null {
  const res = createNoteInputSchema.safeParse({ title });

  if (res.success) return null;

  // flatten() группирует ошибки по полям:
  // { fieldErrors: { title?: string[] }, formErrors: string[] }
  const flat = res.error.flatten();

  const titleErrors = flat.fieldErrors.title;
  return titleErrors?.[0] ?? "Некорректный заголовок.";
}

