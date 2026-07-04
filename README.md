# JS Practice Vault

A personal, dark-themed web app for browsing, editing, and expanding your
JavaScript practice files — with a real in-browser code editor (Monaco) that
gives you IntelliSense, `Ctrl+/` comment toggling, bracket-pair colorization,
auto-indent, and error squiggles.

Everything is persisted to **real `.js` files on disk** (in `/data`), so your
progress is permanent — nothing lives only in the browser.

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The Monaco editor loads its engine from a CDN (jsdelivr) the first
> time you open an editor view, so an internet connection is needed for that
> initial load.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
```

## How it works

- **Dashboard (`/`)** — every `.js` file in `/data` shown as a card with a
  difficulty badge, line count, and last-modified time. Search filters live.
- **Topic editor (`/topic/[slug]`)** — opens a file in Monaco. Edit and hit
  **Save** (or `Ctrl/Cmd+S`) to write changes back to disk. There's also a
  delete button.
- **Notebook (`/notebook`)** — a blank editor. Write something, click
  **Save to Vault**, give it a name, and it's created as a new `.js` file and
  appears on the dashboard automatically.

## Project structure

```
js-practice-vault/
├── app/
│   ├── layout.tsx              # Root layout: fonts + sidebar shell
│   ├── page.tsx                # Dashboard (server-reads /data)
│   ├── globals.css             # Tailwind v4 theme (dark + neon accents)
│   ├── not-found.tsx           # Friendly 404
│   ├── notebook/page.tsx       # Notebook route
│   ├── topic/[slug]/page.tsx   # Per-file editor route
│   └── api/
│       └── topics/
│           ├── route.ts        # GET list · POST create
│           └── [slug]/route.ts # GET read · PUT save · DELETE
├── components/
│   ├── Sidebar.tsx             # Responsive nav (sidebar ⇄ top bar)
│   ├── TopicCard.tsx           # Animated dashboard card
│   ├── DashboardClient.tsx     # Search + animated grid
│   ├── CodeEditor.tsx          # Monaco wrapper (theme + JS language service)
│   ├── TopicEditorClient.tsx   # Editor view with save/delete
│   └── NotebookClient.tsx      # Blank editor + "Save to Vault" modal
├── lib/
│   ├── topics.ts               # Filesystem read/list + path-safety (server)
│   └── ui.ts                   # Accent colors, difficulty chips, time (client)
└── data/                       # ← YOUR PRACTICE FILES (source of truth)
```

## Data & your original files

Your original practice files in the parent folder were **left untouched**. This
app works off **copies** placed in `js-practice-vault/data/`. Edits, new files,
and deletions made in the app only affect that `data/` folder.

## Tech stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4
- `@monaco-editor/react` for the editor
- `framer-motion` for animations
- Fonts: Inter (UI) + JetBrains Mono (code) via `next/font`
