// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import Providers from "@/lib/Providers";

export const metadata: Metadata = {
  title: "Workbench Notes",
  description: "Next.js + TypeScript training project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <div className="min-h-dvh flex flex-col">
            <AppHeader />
            <main className="app-main flex-1 min-h-0 pb-0 flex flex-col">{children}</main>
            <AppFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
