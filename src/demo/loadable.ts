// src/demo/loadable.ts
// Учебный паттерн: описывает данные, которые могут быть в процессе загрузки.
// Важно: данные доступны только в состоянии "ready".

export type Loadable<T> =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ready"; data: T }
  | { state: "error"; message: string };

// Помогает делать switch по состояниям исчерпывающим.
// Если позже добавится новое состояние, TypeScript подсветит место, где оно не обработано.
export function assertNever(x: never): never {
  throw new Error("Unexpected object: " + JSON.stringify(x));
}
