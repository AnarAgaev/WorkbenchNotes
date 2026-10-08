// src/components/ui/Collapsible.tsx
"use client";

import { useState } from "react";

export default function Collapsible({
  title,
  defaultOpen = false,
  children,
  headerRight,
  hideTitle = false,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  hideTitle?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      {!hideTitle && (
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-semibold"
            onClick={() => setOpen((v) => !v)}
          >
            <span>{title}</span>
            <span className="text-slate-400">{open ? "▾" : "▸"}</span>
          </button>

          {headerRight}
        </div>
      )}

      {open && <div className="flex flex-col gap-1">{children}</div>}
    </div>
  );
}