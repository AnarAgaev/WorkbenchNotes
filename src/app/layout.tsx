// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import Providers from "@/lib/Providers";
import UIShellRootClient from "@/app/_ui/UIShellRootClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Workbench Notes", template: "%s — Workbench Notes" },
  description: "Workbench Notes — учебный проект для курса TypeScript (Next.js App Router).",
  icons: { icon: [{ url: "/favicon.ico" }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <div className="min-h-dvh flex flex-col">
            <AppHeader />
            <main className="app-main flex-1 min-h-0 pb-0 flex flex-col">
              <UIShellRootClient>{children}</UIShellRootClient>
            </main>
            <AppFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
