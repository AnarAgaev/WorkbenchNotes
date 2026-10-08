// src/lib/formStates.ts
import type {
  CreateProjectFormState,
  RenameProjectFormState,
  DeleteProjectFormState,
  CreateSectionFormState,
  RenameSectionFormState,
  DeleteSectionFormState,
  CreateNoteFormState,
  RenameNoteFormState,
  DeleteNoteFormState,
  FormLabFormState,
} from "@/lib/formTypes";

export const createProjectFormInitialState: CreateProjectFormState = {
  ok: false,
  error: null,
  fieldErrors: {},
};

export const createSectionFormInitialState: CreateSectionFormState = {
  ok: false,
  error: null,
  fieldErrors: {},
};

export const createNoteFormInitialState: CreateNoteFormState = {
  ok: false,
  error: null,
  fieldErrors: {},
};

export const renameNoteFormInitialState: RenameNoteFormState = {
  ok: false,
  error: null,
  fieldErrors: {},
};

export const renameSectionFormInitialState: RenameSectionFormState = {
  ok: false,
  error: null,
  fieldErrors: {},
};

export const deleteSectionFormInitialState: DeleteSectionFormState = {
  ok: false,
  error: null,
};

export const deleteNoteFormInitialState: DeleteNoteFormState = {
  ok: false,
  error: null,
};

export const renameProjectFormInitialState: RenameProjectFormState = {
  ok: false,
  error: null,
  fieldErrors: {},
};

export const deleteProjectFormInitialState: DeleteProjectFormState = {
  ok: false,
  error: null,
};

export const formLabFormInitialState: FormLabFormState = {
  ok: false,
  error: null,
  fieldErrors: {},
};