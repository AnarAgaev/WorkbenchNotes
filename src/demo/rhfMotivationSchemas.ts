// src/demo/rhfMotivationSchemas.ts
import { z } from "zod";
import { noteTitleSchema } from "@/demo/noteSchemas";

export const rhfMotivationSchema = z.object({
  title: noteTitleSchema,
  email: z
    .string()
    .trim()
    .min(1, "Введите email.")
    // В Zod v4 у ZodString.email есть deprecated в типах.
    // Используем pipe(z.email(...)), чтобы избежать предупреждения.
    .pipe(z.email({ error: "Некорректный email." })),
  about: z
    .string()
    .trim()
    .min(1, "Введите описание.")
    .max(140, "Описание слишком длинное (макс. 140)."),
});

export type RhfMotivationInput = z.infer<typeof rhfMotivationSchema>;

export type RhfMotivationFieldErrors = Partial<
  Record<keyof RhfMotivationInput, string>
>;

export function validateRhfMotivation(
  values: RhfMotivationInput
): RhfMotivationFieldErrors {
  const res = rhfMotivationSchema.safeParse(values);
  if (res.success) return {};

  const flat = res.error.flatten().fieldErrors;

  // Для UI достаточно первого сообщения на поле.
  return {
    title: flat.title?.[0],
    email: flat.email?.[0],
    about: flat.about?.[0],
  };
}

export function hasAnyErrors(errs: RhfMotivationFieldErrors): boolean {
  return Object.values(errs).some(Boolean);
}
