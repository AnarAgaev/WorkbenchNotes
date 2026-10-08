// src/demo/server/actions/formLabActions.ts
"use server";

import { formLabSchema } from "@/lib/schemas";
import type { FormLabFormState } from "@/lib/formTypes";
import { appendFormLabItem } from "@/demo/server/formLabDb";


export async function submitFormLabFromForm(
  _prev: FormLabFormState,
  formData: FormData
): Promise<FormLabFormState> {
  const rawTitle = formData.get("title");
  if (typeof rawTitle !== "string") {
    return { ok: false, error: "Некорректные данные формы", fieldErrors: {} };
  }

  const parsed = formLabSchema.safeParse({ title: rawTitle });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      error: null,
      fieldErrors: { title: flat.fieldErrors.title?.[0] },
    };
  }

  const savedAt = new Date().toISOString();

  await appendFormLabItem({
    title: parsed.data.title,
    savedAt,
  });
  
  return {
    ok: true,
    value: {
      title: parsed.data.title,
      savedAt,
    },
  };  
}

