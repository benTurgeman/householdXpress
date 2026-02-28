# Frontend

React 18, TypeScript 5, Vite 7, Vitest, Testing Library, pnpm.

## Relevant Agents
- **frontend-developer** — primary implementation agent
- **architect-reviewer** — reviews PRs before human merge

## Structure

```
src/
├── api/
│   └── client.ts      # ALL backend API calls live here — no exceptions
├── components/        # shared/reusable UI pieces
├── pages/             # top-level route views
├── hooks/             # custom React hooks
├── types/             # TypeScript interfaces & enums
└── App.tsx            # root component, routing
```

## Commands

```bash
pnpm dev          # Vite dev server on :5173
pnpm build        # tsc + Vite production build
pnpm test         # Vitest watch mode
pnpm test:run     # Vitest single run (CI)
pnpm lint         # ESLint check
pnpm type-check   # tsc --noEmit
```

## Conventions

- All API calls in `src/api/client.ts` — no inline fetch/axios in components
- One file per domain: `notes.ts`, `expenses.ts`, etc. inside `src/api/`
- Import alias `@/` maps to `src/` — use it everywhere, no relative `../../`
- Components: PascalCase filename + default export; hooks: `use` prefix
- Strict TypeScript — no `any`; use `unknown` + type guards if needed
- No auth in v1 — `author` is `"Ben" | "Wife"` passed as a plain field
- `VITE_API_URL` env var points to the backend base URL

## Adding a New Feature

1. Add API helpers to `src/api/<domain>.ts`
2. Add TypeScript types to `src/types/<domain>.ts`
3. Build components in `src/components/<domain>/`
4. Add page view in `src/pages/<Domain>Page.tsx` and wire into routing
5. Write tests alongside each component (`*.test.tsx`)

## Testing

- Vitest + Testing Library; jsdom environment (configured in `vite.config.ts`)
- Test files colocate with source: `Button.test.tsx` next to `Button.tsx`
- Setup file at `src/test/setup.ts` (imports jest-dom matchers)
- Run tests without Docker: `pnpm test:run`
