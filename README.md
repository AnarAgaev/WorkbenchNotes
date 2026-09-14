# Workbench Notes

A learning project for the **Next.js + TypeScript** course. The app will
grow incrementally: projects, sections, notes, and a full workspace are on
the way. Demo pages (`/demo`) live separately from the "product" part and
are used to practice patterns, without replacing the core functionality.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) 4
- [Biome](https://biomejs.dev) — linting and formatting

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

The home page is edited in [src/app/page.tsx](src/app/page.tsx) — changes
are picked up automatically.

## Scripts

| Command          | Purpose                        |
| ---------------- | ------------------------------- |
| `npm run dev`    | Start the dev server            |
| `npm run build`  | Production build                |
| `npm run start`  | Run the production build        |
| `npm run lint`   | Lint the code with Biome        |
| `npm run format` | Format the code with Biome      |

## Project Structure

```
src/app/
├─ layout.tsx                     # root layout, app header
├─ page.tsx                       # home page
├─ globals.css                    # global styles (Tailwind)
└─ components/
   └─ layout/
      └─ AppHeader.tsx            # shared header with navigation
```

Fonts are loaded via [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
(the [Geist](https://vercel.com/font) family).

## Roadmap

- Turn the home page into a project showcase
- Add the first demo project
- Grow the `/demo` section for learning exercises

## Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js interactive tutorial](https://nextjs.org/learn)
- [Next.js GitHub repository](https://github.com/vercel/next.js)
- [Deploying on Vercel](https://nextjs.org/docs/app/building-your-application/deploying)
