# Taskboard – React Todo App

A todo app with full CRUD, built with **React + TypeScript + Vite** and **shadcn/ui** (Tailwind CSS v4).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

Requires Node.js 20.19+ (Vite 7).

## Features

- **Create** – title (required) and optional description, with validation
- **Read** – list of all todos, filter by All / Active / Completed, progress ring
- **Update** – edit title/description inline, tick the checkbox to complete
- **Delete** – remove one task, or clear all completed
- State lives in memory with `useState` (no persistence)

## Structure

```
src/
├── components/
│   ├── ui/               shadcn/ui: button, input, textarea, label, card, checkbox
│   ├── todo-form.tsx
│   ├── todo-item.tsx
│   ├── todo-list.tsx
│   └── progress-ring.tsx
├── lib/                  utils (cn) + title validation
├── types/todo.ts         Todo, TodoDraft, TodoFilter
├── App.tsx               state + handlers
└── main.tsx
```

## Note on shadcn/ui

The `components/ui/*` files are the standard shadcn/ui components (copied into the project, as shadcn does), and `components.json` is included so you can add more with
`npx shadcn@latest add <component>`.
