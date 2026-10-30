// src/app/p/[projectId]/project-workspace-client.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import hljs from "highlight.js";
import Button from "@/components/ui/Button";
import WorkspaceShell from "@/app/_ui/WorkspaceShell";
import ProjectTreeClient from "@/app/_ui/ProjectTreeClient";
import NoteEditorClient from "@/components/editor/NoteEditorClient";
import { useWorkbenchStore } from "@/lib/workbenchStore";
import { useUIShell } from "@/app/_ui/ui-shell-context";
import { prepareHtmlForPreview } from "@/lib/quillPreview";

export default function ProjectWorkspaceClient({ projectId }: { projectId: Id }) {
  const sp = useSearchParams();
  const noteId = sp.get("note") ?? "";
  const [mode, setMode] = useState<"edit" | "view">("edit");

  const { getProject, getNote, updateNoteContent, getNoteSaveInfo } =
    useWorkbenchStore();

  // UI state оболочки workspace приходит из Context.
  const ui = useUIShell();
  const { focusMode } = ui.state;

  // note и previewHtml считаем до раннего return: useMemo — хук, его нельзя вызывать условно.
  const note = noteId ? getNote(projectId, noteId) : undefined;

  const previewHtml = useMemo(() => {
    if (!note) return "";
    return prepareHtmlForPreview(note.contentHtml || "");
  }, [note]);

  useEffect(() => {
    if (mode !== "view") return;

    // Подсветка запускается после рендера HTML.
    // Ищем все code.hljs, которые подготовлены функцией prepareHtmlForPreview.
    document.querySelectorAll("pre.hljs code.hljs").forEach((el) => {
      hljs.highlightElement(el as HTMLElement);
    });
  }, [mode, previewHtml]);

  // Проект читается из client-store. Сервер его не проверяет.
  const project = getProject(projectId);
  if (!project) {
    return (
      <div className="app-card">
        <div className="font-semibold">Проект не найден</div>
        <p className="muted mt-1 text-sm">
          Вернитесь на{" "}
          <Link className="app-link" href="/">
            главную
          </Link>
          .
        </p>
      </div>
    );
  }

  const saveInfo = note ? getNoteSaveInfo(note.id) : { status: "idle" as const };

  // value для WYSIWYG должен быть HTML, а не plain
  const html = note ? note.contentHtml || "" : "";

  return (
    <section className="app-section pb-0 flex-1 min-h-0">
      <WorkspaceShell
        sidebar={<ProjectTreeClient projectId={projectId} />}
        sidebarHidden={focusMode} // Экран: прячем sidebar
        main={
          note ? (
            <div className="flex flex-col gap-3 h-full min-h-0">
              <div className="wb-note-head">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-100">
                      {note.title}
                    </div>
                    <div className="wb-tree-meta">
                      обновлено: {new Date(note.updatedAt).toLocaleString("ru-RU")}
                      {saveInfo.status === "saving" && " • сохранение…"}
                      {saveInfo.status === "saved" && " • сохранено"}
                      {saveInfo.status === "error" && " • ошибка сохранения"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`app-btn ${
                        focusMode ? "app-btn--primary" : "app-btn--soft"
                      }`}
                      onClick={ui.toggleFocusMode} // меняем только UI state
                      title="Экран: скрыть панель слева и оставить рабочую область"
                    >
                      Экран
                    </button>

                    <Button
                      variant="ghost"
                      onClick={() => setMode((m) => (m === "edit" ? "view" : "edit"))}
                    >
                      {mode === "edit" ? "Просмотр" : "Редактор"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                {mode === "edit" ? (
                  <NoteEditorClient
                    key={note.id}
                    value={html}
                    onChange={(next) => updateNoteContent(note.id, next)} // запись только при редактировании
                  />
                ) : (
                  <div key={note.id} className="wb-viewer ql-snow">
                    <div className="ql-editor" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="app-card app-card--soft">
              <div className="font-semibold">Выберите заметку</div>
              <p className="muted mt-1 text-sm">
                Выберите заметку слева или используйте поиск.
              </p>
            </div>
          )
        }
      />
    </section>
  );
}
