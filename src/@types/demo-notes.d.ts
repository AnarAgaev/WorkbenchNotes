// src/@types/demo-notes.d.ts
export {};

declare global {
  // Семантические строки.
  type IsoDateString = string;
  type DemoNoteId = string;

  // Union: ограниченный набор значений вместо произвольных строк.
  type DemoNoteStatus = "draft" | "published" | "archived";
  type DemoNotePriority = 1 | 2 | 3;

  // Сущность демо: внутри проекта поля всегда определены.
  // Это снижает количество защитного кода в UI.
  type DemoNote = {
    id: DemoNoteId;
    title: string;

    status: DemoNoteStatus;
    priority: DemoNotePriority;

    tags: string[];
    description: string;

    createdAt: IsoDateString;
    updatedAt: IsoDateString;
  };

  // Входной формат: на границе поля могут отсутствовать.
  // Этот тип удобен для сборки сущности через дефолты.
  type DemoNoteCreateInput = {
    title: string;
    status?: DemoNoteStatus;
    priority?: DemoNotePriority;
    tags?: string[];
    description?: string;
  };
}
