// src/lib/workbenchStore.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { v4 as uuid } from "uuid";
import { getDefaultDb } from "@/data/demo";
import { getDbSnapshot } from "@/app/_actions/db";

import {
  createProjectAction,
  renameProjectAction,
  deleteProjectAction,
  createSectionAction,
  renameSectionAction,
  deleteSectionAction,
  createNoteAction,
  renameNoteAction,
  deleteNoteAction,
  updateNoteContentAction,
} from "@/app/_actions/mutations";

type NoteSaveStatus = "idle" | "saving" | "saved" | "error";
type NoteSaveInfo = {
  status: NoteSaveStatus;
  lastSavedAt?: string;
  error?: string | null;
};

type Store = {
  db: WorkbenchDb;

  // selectors
  getProject: (projectId: Id) => Project | undefined;
  getNote: (projectId: Id, noteId: Id) => Note | undefined;
  getSections: (projectId: Id) => Section[];
  getNotesByParent: (projectId: Id, parentType: NoteParentType, parentId: Id) => Note[];

  // mutations
  createNote: (projectId: Id, parentType: NoteParentType, parentId: Id, title: string) => Note;
  updateNoteContent: (noteId: Id, nextHtml: string) => void;

  createSection: (projectId: Id, title: string) => Section;
  renameSection: (sectionId: Id, nextTitle: string) => void;
  renameNote: (noteId: Id, nextTitle: string) => void;
  deleteNote: (noteId: Id) => void;
  deleteSection: (sectionId: Id) => void;

  // projects
  createProject: (title: string, structure: Project["structure"]) => Project;
  renameProject: (projectId: Id, nextTitle: string) => void;
  deleteProject: (projectId: Id) => void;

  isDemoProject: (projectId: Id) => boolean;

  // local-only (для формы -> action)
  addProjectLocal: (project: Project) => void;
  addSectionLocal: (section: Section) => void;

  // helper
  refreshFromServer: () => Promise<void>;

  // local-only для optimistic
  insertProjectLocal: (project: Project) => void;
  removeProjectLocal: (projectId: Id) => void;
  renameProjectLocal: (projectId: Id, nextTitle: string) => void;

  insertSectionLocal: (section: Section) => void;
  removeSectionLocal: (sectionId: Id) => void;
  renameSectionLocal: (sectionId: Id, nextTitle: string) => void;

  insertNoteLocal: (note: Note) => void;
  removeNoteLocal: (noteId: Id) => void;
  renameNoteLocal: (noteId: Id, nextTitle: string) => void;

  getNoteSaveInfo: (noteId: Id) => NoteSaveInfo;
};

const WorkbenchStoreContext = createContext<Store | null>(null);

export function WorkbenchStoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<WorkbenchDb>(() => getDefaultDb());
  const [noteSaveInfoById, setNoteSaveInfoById] = useState<Record<string, NoteSaveInfo>>({});

  // store bootstraps itself from server snapshot once
  // после F5 мы должны видеть “истину сервера”, а не только демо-данные
  const readyRef = useRef(false);

  // debounce timers per noteId (autosave)
  // частые изменения контента (editor) не должны спамить server action на каждый символ
  const saveTimersRef = React.useRef<Map<Id, number>>(new Map());

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const loaded = await getDbSnapshot();
        if (!alive) return;

        // readyRef нужен, чтобы отличать “первую загрузку” от обычных обновлений
        readyRef.current = true;
        setDb(loaded);
      } catch {
        // если snapshot не загрузился — остаёмся на демо, но UI продолжит работать
        readyRef.current = true;
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // refreshFromServer = “страховка” для optimistic
  // если сервер отказал/упал, проще пересинкнуться, чем строить сложные rollback-деревья
  const refreshFromServer = useCallback(async () => {
    const snapshot = await getDbSnapshot();
    setDb(snapshot);
  }, []);

  // selectors
  // electors не мутируют, только читают db (store остаётся предсказуемым)
  const getProject = useCallback(
    (projectId: Id) => db.projects.find((p) => p.id === projectId),
    [db.projects]
  );

  const getNote = useCallback(
    (projectId: Id, noteId: Id) =>
      db.notes.find((n) => n.projectId === projectId && n.id === noteId),
    [db.notes]
  );

  const getSections = useCallback(
    (projectId: Id) =>
      db.sections.filter((s) => s.projectId === projectId).sort((a, b) => a.order - b.order),
    [db.sections]
  );

  const getNotesByParent = useCallback(
    (projectId: Id, parentType: NoteParentType, parentId: Id) =>
      db.notes
        .filter(
          (n) => n.projectId === projectId && n.parentType === parentType && n.parentId === parentId
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [db.notes]
  );

  // autosave
  const scheduleSaveNote = useCallback(
    (noteId: Id, nextHtml: string) => {
      // per-note debounce (каждая заметка сохраняется отдельно)
      const t = saveTimersRef.current.get(noteId);
      if (t) window.clearTimeout(t);

      // saving status = UI feedback loop
      // пользователь должен видеть “saving / saved / error”
      setNoteSaveInfoById((prev) => ({
        ...prev,
        [noteId]: { status: "saving", error: null },
      }));

      const timer = window.setTimeout(() => {
        const updatedAt = new Date().toISOString();

        // write-point через server action (write outside UI)
        void updateNoteContentAction({ noteId, contentHtml: nextHtml, updatedAt })
          .then((r) => {
            if (!r.ok) {
              // сервер отказал → показываем error + пересинк
              setNoteSaveInfoById((prev) => ({
                ...prev,
                [noteId]: { status: "error", error: r.error },
              }));
              void refreshFromServer();
              return;
            }

            // updatedAt only after success
            // иначе сортировка/мета будет “врать” даже если сервер не сохранил
            setDb((prev) => ({
              ...prev,
              notes: prev.notes.map((n) => (n.id === noteId ? { ...n, updatedAt } : n)),
            }));

            setNoteSaveInfoById((prev) => ({
              ...prev,
              [noteId]: { status: "saved", lastSavedAt: updatedAt, error: null },
            }));
          })
          .catch(() => {
            // network error → error status + пересинк
            setNoteSaveInfoById((prev) => ({
              ...prev,
              [noteId]: { status: "error", error: "Network error" },
            }));
            void refreshFromServer();
          });
      }, 650);

      saveTimersRef.current.set(noteId, timer);
    },
    [refreshFromServer]
  );

  const updateNoteContent = useCallback(
    (noteId: Id, nextHtml: string) => {
      // optimistic content (локально сразу)
      // editor должен быть мгновенным, сервер — “догоняет” через debounce
      setDb((prev) => ({
        ...prev,
        notes: prev.notes.map((n) => (n.id === noteId ? { ...n, contentHtml: nextHtml } : n)),
      }));

      scheduleSaveNote(noteId, nextHtml);
    },
    [scheduleSaveNote]
  );

  // notes
  const createNote = useCallback(
    (projectId: Id, parentType: NoteParentType, parentId: Id, title: string) => {
      // create* методы — “быстрый UX” + затем server action
      const id = `n-${uuid()}`;
      const now = new Date().toISOString();

      const note: Note = {
        id,
        projectId,
        parentType,
        parentId,
        title,
        contentHtml: "",
        updatedAt: now,
      };

      // optimistic insert -> server action -> resync on fail
      setDb((prev) => ({
        ...prev,
        notes: [...prev.notes, note],
      }));

      void createNoteAction({ note })
        .then((r) => {
          if (!r.ok) void refreshFromServer();
        })
        .catch(() => void refreshFromServer());

      return note;
    },
    [refreshFromServer]
  );

  const renameNote = useCallback(
    (noteId: Id, nextTitle: string) => {
      // тут updatedAt обновляем сразу (это rename, не autosave контента)
      setDb((prev) => ({
        ...prev,
        notes: prev.notes.map((n) =>
          n.id === noteId ? { ...n, title: nextTitle, updatedAt: new Date().toISOString() } : n
        ),
      }));

      void renameNoteAction({ noteId, title: nextTitle })
        .then((r) => {
          if (!r.ok) void refreshFromServer();
        })
        .catch(() => void refreshFromServer());
    },
    [refreshFromServer]
  );

  const deleteNote = useCallback(
    (noteId: Id) => {
      setDb((prev) => ({
        ...prev,
        notes: prev.notes.filter((n) => n.id !== noteId),
      }));

      void deleteNoteAction({ noteId })
        .then((r) => {
          if (!r.ok) void refreshFromServer();
        })
        .catch(() => void refreshFromServer());
    },
    [refreshFromServer]
  );

  // sections
  const createSection = useCallback(
    (projectId: Id, title: string) => {
      const id = `s-${uuid()}`;

      // вычисляем order из prev (внутри setDb), чтобы не зависеть от “старого” db
      setDb((prev) => {
        const maxOrder = prev.sections
          .filter((s) => s.projectId === projectId)
          .reduce((m, s) => Math.max(m, s.order), 0);

        const section: Section = {
          id,
          projectId,
          title,
          order: maxOrder + 1,
        };

        void createSectionAction({ section })
          .then((r) => {
            if (!r.ok) void refreshFromServer();
          })
          .catch(() => void refreshFromServer());

        return {
          ...prev,
          sections: [...prev.sections, section],
        };
      });

      // возвращаем section “для автоселекта” (проектный UX)
      // order тут считается из внешнего db (может быть слегка устаревшим, но в UI сразу поправится)
      return {
        id,
        projectId,
        title,
        order:
          db.sections
            .filter((s) => s.projectId === projectId)
            .reduce((m, s) => Math.max(m, s.order), 0) + 1,
      } as Section;
    },
    [db.sections, refreshFromServer]
  );

  const renameSection = useCallback(
    (sectionId: Id, nextTitle: string) => {
      setDb((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, title: nextTitle } : s)),
      }));

      void renameSectionAction({ sectionId, title: nextTitle })
        .then((r) => {
          if (!r.ok) void refreshFromServer();
        })
        .catch(() => void refreshFromServer());
    },
    [refreshFromServer]
  );

  const deleteSection = useCallback(
    (sectionId: Id) => {
      // Pcascade delete (section -> notes)
      // db плоская, связи через parentType/parentId, значит каскад делаем вручную
      setDb((prev) => ({
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sectionId),
        notes: prev.notes.filter((n) => !(n.parentType === "section" && n.parentId === sectionId)),
      }));

      void deleteSectionAction({ sectionId })
        .then((r) => {
          if (!r.ok) void refreshFromServer();
        })
        .catch(() => void refreshFromServer());
    },
    [refreshFromServer]
  );

  // projects
  const isDemoProject = useCallback((projectId: Id) => {
    // демо защищаем “жёстко” по id
    return projectId === "demo-notes" || projectId === "demo-nested";
  }, []);

  const createProject = useCallback(
    (title: string, structure: Project["structure"]) => {
      const t = title.trim();
      // legacy API — просто не создаём (валидация есть и в UI)
      if (t.length < 2) return null as unknown as Project;

      const project: Project = {
        id: `p-${uuid()}`,
        title: t,
        structure,
        createdAt: new Date().toISOString(),
        isDemo: false,
      };

      setDb((prev) => ({
        ...prev,
        projects: [project, ...prev.projects],
      }));

      void createProjectAction({ project })
        .then((r) => {
          if (!r.ok) void refreshFromServer();
        })
        .catch(() => void refreshFromServer());

      return project;
    },
    [refreshFromServer]
  );

  const renameProject = useCallback(
    (projectId: Id, nextTitle: string) => {
      // демо не меняем
      if (isDemoProject(projectId)) return;

      const t = nextTitle.trim();
      if (t.length < 2) return;

      setDb((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === projectId ? { ...p, title: t } : p)),
      }));

      void renameProjectAction({ projectId, title: t })
        .then((r) => {
          if (!r.ok) void refreshFromServer();
        })
        .catch(() => void refreshFromServer());
    },
    [isDemoProject, refreshFromServer]
  );

  const deleteProject = useCallback(
    (projectId: Id) => {
      // демо не удаляем
      if (isDemoProject(projectId)) return;

      // cascade delete (project -> sections -> notes)
      setDb((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== projectId),
        sections: prev.sections.filter((s) => s.projectId !== projectId),
        notes: prev.notes.filter((n) => n.projectId !== projectId),
      }));

      void deleteProjectAction({ projectId })
        .then((r) => {
          if (!r.ok) void refreshFromServer();
        })
        .catch(() => void refreshFromServer());
    },
    [isDemoProject, refreshFromServer]
  );

  // local-only (форма -> action)
  const addProjectLocal = useCallback((project: Project) => {
    // form->action может сначала вставить optimistic объект (по clientId),
    // а потом “подтянуть” серверную истину — addProjectLocal помогает не дублировать
    setDb((prev) => {
      const idx = prev.projects.findIndex((p) => p.id === project.id);
      const nextProjects =
        idx === -1
          ? [...prev.projects, project]
          : prev.projects.map((p) => (p.id === project.id ? { ...p, ...project } : p));

      return { ...prev, projects: nextProjects };
    });
  }, []);

  const addSectionLocal = useCallback((section: Section) => {
    setDb((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === section.id);
      const nextSections =
        idx === -1
          ? [...prev.sections, section]
          : prev.sections.map((s) => (s.id === section.id ? { ...s, ...section } : s));

      return { ...prev, sections: nextSections };
    });
  }, []);

  // optimistic helpers
  // эти методы используют формы (useActionState) для мгновенного UI + rollback
  const insertProjectLocal = useCallback((project: Project) => {
    setDb((prev) => ({
      ...prev,
      projects: [project, ...prev.projects],
    }));
  }, []);

  const removeProjectLocal = useCallback((projectId: Id) => {
    setDb((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== projectId),
      sections: prev.sections.filter((s) => s.projectId !== projectId),
      notes: prev.notes.filter((n) => n.projectId !== projectId),
    }));
  }, []);

  const renameProjectLocal = useCallback((projectId: Id, nextTitle: string) => {
    const t = nextTitle.trim();
    if (t.length < 2) return;

    setDb((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === projectId ? { ...p, title: t } : p)),
    }));
  }, []);

  const insertSectionLocal = useCallback((section: Section) => {
    setDb((prev) => ({
      ...prev,
      sections: [...prev.sections, section],
    }));
  }, []);

  const removeSectionLocal = useCallback((sectionId: Id) => {
    setDb((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
      notes: prev.notes.filter((n) => !(n.parentType === "section" && n.parentId === sectionId)),
    }));
  }, []);

  const renameSectionLocal = useCallback((sectionId: Id, nextTitle: string) => {
    setDb((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, title: nextTitle } : s)),
    }));
  }, []);

  const insertNoteLocal = useCallback((note: Note) => {
    setDb((prev) => ({
      ...prev,
      notes: [...prev.notes, note],
    }));
  }, []);

  const removeNoteLocal = useCallback((noteId: Id) => {
    setDb((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== noteId),
    }));
  }, []);

  const renameNoteLocal = useCallback((noteId: Id, nextTitle: string) => {
    setDb((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === noteId ? { ...n, title: nextTitle } : n)),
    }));
  }, []);

  const getNoteSaveInfo = useCallback(
    (noteId: Id): NoteSaveInfo => noteSaveInfoById[noteId] ?? { status: "idle" },
    [noteSaveInfoById]
  );

  const value = useMemo<Store>(
    () => ({
      db,

      getProject,
      getNote,
      getSections,
      getNotesByParent,

      createNote,
      updateNoteContent,

      createSection,
      renameSection,
      renameNote,
      deleteSection,
      deleteNote,

      createProject,
      renameProject,
      deleteProject,

      isDemoProject,

      addProjectLocal,
      addSectionLocal,

      refreshFromServer,

      insertProjectLocal,
      removeProjectLocal,
      renameProjectLocal,

      insertSectionLocal,
      removeSectionLocal,
      renameSectionLocal,

      insertNoteLocal,
      removeNoteLocal,
      renameNoteLocal,

      getNoteSaveInfo,
    }),
    [
      db,
      getProject,
      getNote,
      getSections,
      getNotesByParent,
      createNote,
      updateNoteContent,
      createSection,
      renameSection,
      renameNote,
      deleteSection,
      deleteNote,
      createProject,
      renameProject,
      deleteProject,
      isDemoProject,
      addProjectLocal,
      addSectionLocal,
      refreshFromServer,
      insertProjectLocal,
      removeProjectLocal,
      renameProjectLocal,
      insertSectionLocal,
      removeSectionLocal,
      renameSectionLocal,
      insertNoteLocal,
      removeNoteLocal,
      renameNoteLocal,
      getNoteSaveInfo,
    ]
  );

  return <WorkbenchStoreContext.Provider value={value}>{children}</WorkbenchStoreContext.Provider>;
}

export function useWorkbenchStore() {
  const ctx = useContext(WorkbenchStoreContext);
  if (!ctx) throw new Error("useWorkbenchStore must be used within WorkbenchStoreProvider");
  return ctx;
}