// src/lib/formTypes.ts
export type CreateProjectFormState =
  | { ok: true; projectId: string; clientId: string }
  | { ok: false; error: string | null; fieldErrors: { title?: string } };

export type CreateSectionFormState =
  | { ok: true; sectionId: string; clientId: string }
  | { ok: false; error: string | null; fieldErrors: { title?: string } };

export type CreateNoteFormState =
  | { ok: true; noteId: string; clientId: string }
  | { ok: false; error: string | null; fieldErrors: { title?: string } };

  export type RenameNoteFormState =
  | { ok: true; noteId: string; clientId: string }
  | { ok: false; error: string | null; fieldErrors: { title?: string } };

  export type RenameSectionFormState =
  | { ok: true; sectionId: string; clientId: string }
  | { ok: false; error: string | null; fieldErrors: { title?: string } };

  export type DeleteSectionFormState =
  | { ok: true; sectionId: string }
  | { ok: false; error: string | null };

  export type DeleteNoteFormState =
  | { ok: true; noteId: string }
  | { ok: false; error: string | null };

  export type RenameProjectFormState =
  | { ok: true; projectId: string; clientId: string }
  | { ok: false; error: string | null; fieldErrors: { title?: string } };

  export type DeleteProjectFormState =
  | { ok: true; projectId: string }
  | { ok: false; error: string | null };

export type FormLabFormState =
  | {
      ok: true;
      value: {
        title: string;
        savedAt: string;
      };
    }
  | { ok: false; error: string | null; fieldErrors: { title?: string } };

