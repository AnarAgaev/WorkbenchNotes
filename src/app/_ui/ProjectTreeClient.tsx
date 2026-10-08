// src/app/_ui/ProjectTreeClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import { useWorkbenchStore } from "@/lib/workbenchStore";
import Collapsible from "@/components/ui/Collapsible";
import CreateSectionInlineActionClient from "@/components/forms/CreateSectionInlineActionClient";
import CreateNoteInlineActionClient from "@/components/forms/CreateNoteInlineActionClient";
import RenameNoteInlineActionClient from "@/components/forms/RenameNoteInlineActionClient";
import RenameSectionInlineActionClient from "@/components/forms/RenameSectionInlineActionClient";
import DeleteSectionActionClient from "@/components/forms/DeleteSectionActionClient";
import DeleteNoteActionClient from "@/components/forms/DeleteNoteActionClient";

type Editing = { kind: "section"; id: string } | { kind: "note"; id: string } | null;

// Поиск по контенту: приводим HTML к обычному тексту, чтобы искать по нему.
function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Поиск по заметке: title + plain-text contentHtml (все в lower-case).
function noteMatches(note: Note, q: string) {
  const qq = q.trim().toLowerCase();
  if (!qq) return true;
  const hay = `${note.title} ${stripHtml(note.contentHtml)}`.toLowerCase();
  return hay.includes(qq);
}

export default function ProjectTreeClient({ projectId }: { projectId: Id }) {
  const router = useRouter();
  const sp = useSearchParams();

  const { getProject, getSections, getNotesByParent } = useWorkbenchStore();

  const project = getProject(projectId);

  // URL = состояние: фильтр, выбранная заметка и выбранный раздел живут в searchParams.
  const q = sp.get("q") ?? "";
  const noteId = sp.get("note") ?? "";
  const sectionId = sp.get("section") ?? "";

  const sections = useMemo(() => (project ? getSections(projectId) : []), [project, projectId, getSections]);

  // Активный раздел:
  // - entries: разделов нет
  // - sections: берем section из URL или первый раздел как дефолт
  const activeSectionId = useMemo(() => {
    if (!project) return "";
    if (project.structure === "entries") return "";
    return sectionId || sections[0]?.id || "";
  }, [project, sectionId, sections]);

  // Родитель заметок:
  // - entries: заметки привязаны к проекту (parentType="project", parentId=projectId)
  // - sections: заметки привязаны к активному разделу (parentType="section")
  const notesParent = useMemo(() => {
    if (!project) return null;

    if (project.structure === "entries") {
      return { parentType: "project" as const, parentId: projectId };
    }

    if (!activeSectionId) return null;
    return { parentType: "section" as const, parentId: activeSectionId };
  }, [project, projectId, activeSectionId]);

  // Список заметок текущего родителя + фильтр по q.
  const notes = useMemo(() => {
    if (!project || !notesParent) return [];
    return getNotesByParent(projectId, notesParent.parentType, notesParent.parentId).filter((n) =>
      noteMatches(n, q)
    );
  }, [project, projectId, notesParent, q, getNotesByParent]);

  // UI-state дерева: кто редактируется и какие inline-формы открыты.
  const [editing, setEditing] = useState<Editing>(null);
  const [addingSection, setAddingSection] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  // Пока идет server action создания (pending), блокируем конкурирующие действия.
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // Авто-инициализация URL:
  // - для sections: если section не задан, выбираем первый
  // - для entries: section удаляем
  // - note автоселектим только если нет поиска (q), чтобы не ломать UX фильтра
  useEffect(() => {
    if (!project) return;

    const next = new URLSearchParams(sp.toString());
    let changed = false;

    if (project.structure === "sections") {
      if (!next.get("section") && sections[0]?.id) {
        next.set("section", sections[0].id);
        next.delete("note");
        changed = true;
      }
    } else {
      if (next.has("section")) {
        next.delete("section");
        changed = true;
      }
    }

    // note выбираем только если нет q и note отсутствует
    if (!q && !next.get("note")) {
      const pid = projectId;

      if (project.structure === "entries") {
        const list = getNotesByParent(pid, "project", pid);
        if (list[0]?.id) {
          next.set("note", list[0].id);
          changed = true;
        }
      }

      if (project.structure === "sections") {
        const sid = next.get("section") || activeSectionId;
        if (sid) {
          const list = getNotesByParent(pid, "section", sid);
          if (list[0]?.id) {
            next.set("note", list[0].id);
            changed = true;
          }
        }
      }
    }

    if (changed) {
      router.replace(`/p/${projectId}?${next.toString()}`, { scroll: false });
    }
  }, [project, projectId, sp, router, q, sections, activeSectionId, getNotesByParent]);

  if (!project) return null;

  // Переход внутри workspace без скролла и с сохранением текущего набора параметров.
  const go = (next: URLSearchParams) => router.replace(`/p/${projectId}?${next.toString()}`, { scroll: false });

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-col gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-300">Рабочее пространство</div>
          <div className="text-lg font-semibold text-slate-100 leading-tight mt-1">{project.title}</div>
          <div className="wb-tree-meta mt-1">уровень: {project.structure === "entries" ? "2" : "2/3"}</div>
        </div>

        {/* STRUCTURE: список разделов только для проектов типа sections */}
        {project.structure === "sections" && (
          <div className="app-card app-card--soft">
            <Collapsible
              title="Разделы"
              defaultOpen
              headerRight={
                <button
                  type="button"
                  className="wb-icon-btn"
                  title="Новый раздел"
                  onClick={(e) => {
                    // не раскрываем/сворачиваем Collapsible кликом по кнопке
                    e.stopPropagation();
                    // при открытии формы создания — закрываем конкурирующие режимы
                    setEditing(null);
                    setAddingNote(false);
                    setAddingSection((v) => !v);
                  }}
                >
                  +
                </button>
              }
            >
              {/* inline create section */}
              {addingSection && (
                <CreateSectionInlineActionClient
                  projectId={projectId}
                  onPendingChange={setIsCreatingSection}
                  onCreated={(sectionId) => {
                    // при успешном создании выбираем новый section и очищаем note/q
                    const next = new URLSearchParams(sp.toString());
                    next.set("section", sectionId);
                    next.delete("note");
                    next.delete("q");
                    router.replace(`/p/${projectId}?${next.toString()}`, { scroll: false });
                  }}
                  onCancel={() => setAddingSection(false)}
                  inputClassName="w-full bg-slate-950/20 text-sm font-semibold text-slate-100 outline-none ring-1 ring-slate-500/60 rounded px-2 py-2"
                />
              )}

              {sections.map((s) => {
                const active = s.id === activeSectionId;

                return (
                  <div
                    key={s.id}
                    className={`wb-tree-item ${active ? "wb-tree-item--active" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      // когда редактируем — не переключаем секцию
                      if (editing) return;

                      // смена секции сбрасывает другие режимы + note
                      setEditing(null);
                      setAddingSection(false);
                      setAddingNote(false);

                      const next = new URLSearchParams(sp.toString());
                      next.set("section", s.id);
                      next.delete("note");
                      go(next);
                    }}
                    onKeyDown={(e) => {
                      // клавиатурная навигация для строки раздела
                      if (e.key === "Enter" || e.key === " ") {
                        // когда редактируем инпут — не перехватываем Enter на строке секции
                        if (editing) return;

                        e.preventDefault();

                        setEditing(null);
                        setAddingSection(false);
                        setAddingNote(false);

                        const next = new URLSearchParams(sp.toString());
                        next.set("section", s.id);
                        next.delete("note");
                        go(next);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      {editing?.kind === "section" && editing.id === s.id ? (
                        <RenameSectionInlineActionClient
                          key={`section-rename-${s.id}`}
                          sectionId={s.id}
                          initialValue={s.title}
                          onCancel={() => setEditing(null)}
                          className="flex-1"
                          inputClassName="w-full bg-transparent text-sm font-semibold text-slate-100 outline-none ring-1 ring-slate-500/60 rounded px-2 py-1"
                        />
                      ) : (
                        <div className="text-sm font-semibold truncate">{s.title}</div>
                      )}

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          className="wb-icon-btn"
                          title="Переименовать"
                          onClick={(e) => {
                            // чтобы не сработал onClick строки секции
                            e.stopPropagation();
                            setEditing({ kind: "section", id: s.id });
                          }}
                        >
                          ✎
                        </button>

                        <DeleteSectionActionClient
                          sectionId={s.id}
                          onDeleted={() => {
                            // удаление сбрасывает режимы; если удалили активный section — чистим URL
                            setEditing(null);
                            setAddingSection(false);
                            setAddingNote(false);

                            if (activeSectionId === s.id) {
                              const next = new URLSearchParams(sp.toString());
                              next.delete("section");
                              next.delete("note");
                              router.replace(`/p/${projectId}?${next.toString()}`, { scroll: false });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </Collapsible>
          </div>
        )}

        {/* NOTES: список заметок родителя + поиск + inline create */}
        <div className="app-card app-card--soft">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-sm font-semibold">Заметки</div>

            <div className="flex items-center gap-2">
              <div className="wb-tree-meta">{notes.length}</div>

              <button
                type="button"
                className="wb-icon-btn"
                title="Новая заметка"
                // пока создается раздел/заметка — блокируем кнопку добавления заметки
                disabled={!notesParent || isCreatingSection || isCreatingNote}
                onClick={() => {
                  // открытие формы создания заметки выключает другие режимы
                  setEditing(null);
                  setAddingSection(false);
                  setAddingNote((v) => !v);
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* inline create note */}
          {addingNote && notesParent && (
            <div className="mb-2">
              <CreateNoteInlineActionClient
                projectId={projectId}
                parentType={notesParent.parentType}
                parentId={notesParent.parentId}
                onPendingChange={setIsCreatingNote}
                onCreated={(noteId) => {
                  // выбираем новую note в URL и очищаем поиск
                  const next = new URLSearchParams(sp.toString());
                  next.set("note", noteId);

                  // section держим консистентно с родителем заметок
                  if (notesParent.parentType === "section") {
                    next.set("section", notesParent.parentId);
                  } else {
                    next.delete("section");
                  }

                  next.delete("q");
                  router.replace(`/p/${projectId}?${next.toString()}`, { scroll: false });
                }}
                onCancel={() => setAddingNote(false)}
                inputClassName="w-full bg-slate-950/20 text-sm font-semibold text-slate-100 outline-none ring-1 ring-slate-500/60 rounded px-2 py-2"
              />
            </div>
          )}

          {/* поиск: хранится в URL (?q=), при изменении сбрасываем выбранную note */}
          <Input
            placeholder="Поиск…"
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              const next = new URLSearchParams(sp.toString());
              if (v.trim()) next.set("q", v);
              else next.delete("q");
              next.delete("note");
              go(next);
            }}
          />

          <div className="mt-3 wb-notes-scroll flex flex-col gap-1">
            {notes.map((n) => {
              const active = n.id === noteId;

              return (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  className={`wb-tree-item ${active ? "wb-tree-item--active" : ""}`}
                  onClick={() => {
                    // когда редактируем — не переключаем активную заметку кликом по строке
                    if (editing) return;

                    setEditing(null);

                    const next = new URLSearchParams(sp.toString());
                    next.set("note", n.id);
                    router.replace(`/p/${projectId}?${next.toString()}`, { scroll: false });
                  }}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    {editing?.kind === "note" && editing.id === n.id ? (
                      <RenameNoteInlineActionClient
                        key={`note-rename-${n.id}`}
                        noteId={n.id}
                        initialValue={n.title}
                        onCancel={() => setEditing(null)}
                        className="flex-1"
                        inputClassName="w-full bg-transparent text-sm font-semibold text-slate-100 outline-none ring-1 ring-slate-500/60 rounded px-2 py-1"
                      />
                    ) : (
                      <div className="text-sm font-semibold truncate">{n.title}</div>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        className="wb-icon-btn"
                        title="Переименовать"
                        onClick={(e) => {
                          // чтобы не сработал onClick строки заметки
                          e.stopPropagation();
                          setEditing({ kind: "note", id: n.id });
                        }}
                      >
                        ✎
                      </button>

                      <DeleteNoteActionClient
                        noteId={n.id}
                        onDeleted={() => {
                          // если удалили активную заметку — убираем note из URL
                          if (noteId === n.id) {
                            const next = new URLSearchParams(sp.toString());
                            next.delete("note");
                            router.replace(`/p/${projectId}?${next.toString()}`, { scroll: false });
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {notes.length === 0 && <div className="wb-tree-meta mt-2">Ничего не найдено.</div>}
          </div>
        </div>
      </div>

      <div className="mt-auto app-card app-card--soft">
        <div className="text-sm font-semibold mb-2">Примечание</div>
        <div className="wb-tree-meta">
          Сейчас — простой редактор - plain text. Позже заменим на Quill - rich-text
        </div>
      </div>
    </div>
  );
}