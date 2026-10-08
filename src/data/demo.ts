// src/data/demo.ts
const nowIso = () => new Date().toISOString();

const demoNotes2: WorkbenchDb = {
  projects: [
    {
      id: "demo-notes",
      title: "Заметки",
      createdAt: nowIso(),
      structure: "entries",
      isDemo: true,
    },
  ],
  sections: [],
  notes: [
    {
      id: "n-1",
      projectId: "demo-notes",
      parentType: "project",
      parentId: "demo-notes",
      title: "Добро пожаловать",
      contentHtml: `<p>Это демо проекта <strong>2 уровня</strong>: проект → заметки.</p>`,
      updatedAt: nowIso(),
    },
    {
      id: "n-2",
      projectId: "demo-notes",
      parentType: "project",
      parentId: "demo-notes",
      title: "Идея",
      contentHtml: `<p>Здесь будут быстрые заметки без вложенности.</p><ul><li>мысль</li><li>набросок</li></ul>`,
      updatedAt: nowIso(),
    },
    {
      id: "n-3",
      projectId: "demo-notes",
      parentType: "project",
      parentId: "demo-notes",
      title: "Чек-лист",
      contentHtml: `<ol><li>Открыть</li><li>Редактировать</li><li>Сохранить (позже)</li></ol>`,
      updatedAt: nowIso(),
    },
  ],
};

const demoNested23: WorkbenchDb = {
  projects: [
    {
      id: "demo-nested",
      title: "Вложенные заметки",
      createdAt: nowIso(),
      structure: "sections",
      isDemo: true,
    },
  ],
  sections: [
    { id: "s-ideas", projectId: "demo-nested", title: "Идеи", order: 1 },
    { id: "s-drafts", projectId: "demo-nested", title: "Черновики", order: 2 },
    { id: "s-plan", projectId: "demo-nested", title: "План", order: 3 },
  ],
  notes: [
    // Идеи (2 заметки)
    {
      id: "ni-1",
      projectId: "demo-nested",
      parentType: "section",
      parentId: "s-ideas",
      title: "Список идей",
      contentHtml: `<p>В этом демо проекте <strong>3 уровня</strong>: проект → разделы → заметки.</p>`,
      updatedAt: nowIso(),
    },
    {
      id: "ni-2",
      projectId: "demo-nested",
      parentType: "section",
      parentId: "s-ideas",
      title: "Скетч функции",
      contentHtml: `<p>Быстро набросать фичу:</p><pre><code>UI → State → Save</code></pre>`,
      updatedAt: nowIso(),
    },

    // Черновики (2 заметки)
    {
      id: "nd-1",
      projectId: "demo-nested",
      parentType: "section",
      parentId: "s-drafts",
      title: "Шаблон заметки",
      contentHtml: `<h3>Шаблон</h3><p>Проблема → Решение → Шаги.</p>`,
      updatedAt: nowIso(),
    },
    {
      id: "nd-2",
      projectId: "demo-nested",
      parentType: "section",
      parentId: "s-drafts",
      title: "Черновик текста",
      contentHtml: `<p>Набросок абзаца на русском. Потом отредактируем в Quill.</p>`,
      updatedAt: nowIso(),
    },

    // План (2 заметки)
    {
      id: "np-1",
      projectId: "demo-nested",
      parentType: "section",
      parentId: "s-plan",
      title: "План недели",
      contentHtml: `<ul><li>Понедельник — вход</li><li>Вторник — заметки</li><li>Среда — рефакторинг</li></ul>`,
      updatedAt: nowIso(),
    },
    {
      id: "np-2",
      projectId: "demo-nested",
      parentType: "section",
      parentId: "s-plan",
      title: "План курса",
      contentHtml: `<p>Постепенно строим Workbench Notes (TS) и по дороге учим Next + TypeScript.</p>`,
      updatedAt: nowIso(),
    },
  ],
};

export function getDefaultDb(): WorkbenchDb {
  const merged: WorkbenchDb = {
    projects: [...demoNotes2.projects, ...demoNested23.projects],
    sections: [...demoNested23.sections],
    notes: [...demoNotes2.notes, ...demoNested23.notes],
  };

  // deep clone, чтобы не мутировать исходники
  return JSON.parse(JSON.stringify(merged)) as WorkbenchDb;
}
