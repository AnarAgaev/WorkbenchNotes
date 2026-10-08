// src/app/_ui/HomePageClient.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/layout/Container";
import Input from "@/components/ui/Input";
import { useWorkbenchStore } from "@/lib/workbenchStore";
import CreateProjectInlineActionClient from "@/components/forms/CreateProjectInlineActionClient";
import RenameProjectInlineActionClient from "@/components/forms/RenameProjectInlineActionClient";
import DeleteProjectActionClient from "@/components/forms/DeleteProjectActionClient";

type Structure = "entries" | "sections";

export default function HomePage() {
  const router = useRouter();

  const { db, createProject } = useWorkbenchStore();

  // UI-state главной (не доменные данные)
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStructure, setNewStructure] = useState<Structure>("entries");

  // какой проект сейчас в режиме rename
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // отдельные инлайны “создать проект” по колонкам (быстрый ввод нужного типа)
  const [addingEntries, setAddingEntries] = useState(false);
  const [addingSections, setAddingSections] = useState(false);

  // делим проекты на 2 колонки + сортируем: демо сверху, затем новые сверху
  const { colEntries, colSections } = useMemo(() => {
    const all = db.projects ?? [];

    // демо всегда сверху
    const sortDemoFirst = (a: Project, b: Project) => {
      const ad = a.isDemo ? 0 : 1;
      const bd = b.isDemo ? 0 : 1;
      if (ad !== bd) return ad - bd;

      // дальше — новые сверху (если createdAt есть)
      const ac = a.createdAt ?? "";
      const bc = b.createdAt ?? "";
      return bc.localeCompare(ac);
    };

    const entries = all.filter(p => p.structure === "entries").sort(sortDemoFirst);
    const sections = all.filter(p => p.structure === "sections").sort(sortDemoFirst);

    return { colEntries: entries, colSections: sections };
  }, [db.projects]);

  // “старый” способ создания (через store) — оставлен как рабочий вариант на главной
  const submitCreate = () => {
    const t = newTitle.trim();
    if (t.length < 2) return;

    const created = createProject(t, newStructure);
    setNewTitle("");
    setNewStructure("entries");
    setAdding(false);

    // сразу в проект
    router.push(`/p/${created.id}`);
  };

  // строка проекта: переход в проект + rename/delete (для не-демо)
  const ProjectRow = ({ p }: { p: Project }) => {
    const isEditing = editingProjectId === p.id;

    const rowClass =
      "app-card app-card--soft cursor-pointer hover:border-slate-500/70 hover:bg-white/5 transition-colors " +
      (p.isDemo ? "app-card--demo" : "");

    return (
      <div
        className={rowClass}
        role="button"
        tabIndex={0}
        onClick={() => {
          if (isEditing) return;
          router.push(`/p/${p.id}`);
        }}
        onKeyDown={e => {
          if (isEditing) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            router.push(`/p/${p.id}`);
          }
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <RenameProjectInlineActionClient
                key={`project-rename-${p.id}`}
                projectId={p.id}
                initialValue={p.title}
                onCancel={() => setEditingProjectId(null)}
                className="w-full"
                inputClassName="w-full bg-transparent text-sm font-semibold text-slate-100 outline-none ring-1 ring-slate-500/60 rounded px-2 py-1"
              />
            ) : (
              <div className="truncate text-sm font-semibold text-slate-100">{p.title}</div>
            )}
          </div>

          {/* actions */}
          {!p.isDemo && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                className="wb-icon-btn"
                title="Переименовать"
                onClick={e => {
                  e.stopPropagation();
                  setEditingProjectId(p.id);
                }}
              >
                ✎
              </button>

              <DeleteProjectActionClient
                projectId={p.id}
                onDeleted={() => {
                  // после удаления — просто уходим в корень списка проектов
                  // (мы и так на /, но пусть будет явно)
                  router.replace("/", { scroll: false });
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Container>
      <section className="app-section">
        <div className="app-section__head">
          <div>
            {/* <h1 className="text-2xl font-semibold">Workbench Notes</h1> */}
            <p className="muted mt-1">Server Actions и мутации</p>
          </div>

          <button
            type="button"
            className="app-btn"
            onClick={() => {
              // чтобы не конфликтовать: сначала выключаем rename, потом показываем форму
              setEditingProjectId(null);
              setAdding(v => !v);
            }}
          >
            + Новый блокнот
          </button>
        </div>

        {/* “полная” форма создания проекта (название + тип) */}
        {adding && (
          <div className="app-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <div className="wb-tree-meta mb-1">Название</div>
                <Input
                  placeholder="Например: Мои заметки…"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") submitCreate();
                    if (e.key === "Escape") {
                      setAdding(false);
                      setNewTitle("");
                    }
                  }}
                />
              </div>

              <div className="sm:w-64">
                <div className="wb-tree-meta mb-1">Тип проекта</div>
                <select
                  className="app-input w-full"
                  value={newStructure}
                  onChange={e => setNewStructure(e.target.value as Structure)}
                >
                  <option value="entries">Заметки</option>
                  <option value="sections">Вложенные заметки</option>
                </select>
              </div>

              <div className="flex gap-2 sm:w-56">
                <button type="button" className="app-btn flex-1" onClick={submitCreate}>
                  Создать
                </button>

                <button
                  type="button"
                  className="app-btn app-btn-ghost flex-1"
                  onClick={() => {
                    setAdding(false);
                    setNewTitle("");
                    setNewStructure("entries");
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2 колонки: entries / sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-semibold text-slate-100">Заметки</div>
              <div className="wb-tree-meta">{colEntries.length}</div>
            </div>

            {/* быстрый инлайн: сразу создаём проект типа entries */}
            {addingEntries && (
              <CreateProjectInlineActionClient
                structure="entries"
                onCancel={() => setAddingEntries(false)}
                inputClassName="w-full bg-slate-950/20 text-sm font-semibold text-slate-100 outline-none ring-1 ring-slate-500/60 rounded px-2 py-2"
              />
            )}

            <div className="space-y-2">
              {colEntries.map(p => (
                <ProjectRow key={p.id} p={p} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-semibold text-slate-100">Вложенные заметки</div>
              <div className="wb-tree-meta">{colSections.length}</div>
            </div>

            {/* быстрый инлайн: сразу создаём проект типа sections */}
            {addingSections && (
              <CreateProjectInlineActionClient
                structure="sections"
                onCancel={() => setAddingSections(false)}
                inputClassName="w-full bg-slate-950/20 text-sm font-semibold text-slate-100 outline-none ring-1 ring-slate-500/60 rounded px-2 py-2"
              />
            )}

            <div className="space-y-2">
              {colSections.map(p => (
                <ProjectRow key={p.id} p={p} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* переход в /demo */}
      <section className="mt-8 space-y-2">
        <div
          className="app-card app-card--soft cursor-pointer hover:border-slate-500/70 hover:bg-white/5 transition-colors"
          role="button"
          tabIndex={0}
          onClick={() => router.push("/demo")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push("/demo");
            }
          }}
        >
          <div className="text-sm font-semibold text-slate-100">Лаборатория учебных паттернов</div>
        </div>
      </section>
    </Container>
  );
}