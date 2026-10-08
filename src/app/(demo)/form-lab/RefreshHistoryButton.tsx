// src/app/(demo)/form-lab/RefreshHistoryButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function RefreshHistoryButton() {
  const router = useRouter();

  return (
    <button type="button" className="app-btn app-btn-ghost" onClick={() => router.refresh()}>
      Обновить список
    </button>
  );
}
