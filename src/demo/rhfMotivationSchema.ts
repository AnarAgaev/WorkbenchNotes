// src/demo/rhfMotivationSchema.ts
import { z } from "zod";
import { noteTitleSchema } from "@/demo/noteSchemas";

// Схема отдельная: RHF-демо не смешивается с контрактом createNoteInputSchema.
export const rhfMotivationSchema = z.object({
  title: noteTitleSchema,

  // В Zod v4 у ZodString.email есть deprecated в типах.
  // Используем z.email() и pipe(), чтобы убрать предупреждение.
  email: z
    .string()
    .trim()
    .min(1, "Введите email.")
    .pipe(z.email({ error: "Некорректный email." })),

  about: z
    .string()
    .trim()
    .min(1, "Введите описание.")
    .max(140, "Описание слишком длинное (макс. 140)."),
});

// Тип формы берём из схемы, чтобы контракт не дублировался в TS.
export type RhfMotivationInput = z.infer<typeof rhfMotivationSchema>;
