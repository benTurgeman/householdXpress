# HouseholdXpress — Frontend Plan (Phase 1: Shared Notes)

## Platform Decision

**Expo (React Native)** — primary target is iPhone via Expo Go.
No Apple Developer account required for Phase 1. Both users scan a QR code with the free Expo Go app.

## Interface Contract (source of truth from backend plan)

> All API paths are prefixed `/api/v1`. Base URL from `EXPO_PUBLIC_API_URL` env var.

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/v1/notes/` | Returns `{ items: Note[], total: number }` — NOT a plain array |
| `POST` | `/api/v1/notes/` | Body: `{ author, title, body }` → 201 + `NoteResponse` |
| `GET` | `/api/v1/notes/{id}` | `id` is an **integer** |
| `PATCH` | `/api/v1/notes/{id}` | Partial update; only sent fields change |
| `DELETE` | `/api/v1/notes/{id}` | Returns **204 No Content** (empty body) |

---

## 1. Project Structure

```
frontend/
├── app/                        # Expo Router file-based routes
│   ├── _layout.tsx             # Root layout — AuthorProvider + Stack
│   ├── index.tsx               # Author gate → redirects to /notes
│   └── notes/
│       ├── index.tsx           # Notes list screen
│       └── [id].tsx            # Note detail / edit screen
├── src/
│   ├── api/
│   │   └── client.ts           # ALL HTTP calls — only file that knows about URLs
│   ├── types/
│   │   └── notes.ts            # Shared TS interfaces
│   ├── context/
│   │   └── AuthorContext.tsx   # Global author identity (AsyncStorage)
│   ├── components/
│   │   ├── notes/
│   │   │   ├── NoteCard.tsx
│   │   │   ├── NoteDetail.tsx
│   │   │   └── NoteForm.tsx
│   │   └── ui/
│   │       ├── FilterBar.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBanner.tsx
│   └── hooks/
│       └── useNotes.ts         # List state + all mutations
├── global.css                  # Tailwind directives (NativeWind)
├── nativewind-env.d.ts         # NativeWind v4 type shim (className props on RN components)
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
└── app.json
```

---

## 2. TypeScript Types (`src/types/notes.ts`)

```ts
export type Author = 'Ben' | 'Wife';

export interface Note {
  id: number;           // integer PK from backend (NOT a UUID string)
  author: Author;
  title: string;
  body: string | null;
  created_at: string;   // ISO 8601 UTC string from backend
  updated_at: string;
}

export interface NoteListResponse {
  items: Note[];
  total: number;
}

export interface CreateNotePayload {
  author: Author;
  title: string;
  body?: string;
}

export interface UpdateNotePayload {
  title?: string;
  body?: string;
}

export type NoteFilter = Author | 'all';
```

---

## 3. API Client (`src/api/client.ts`)

```ts
const BASE = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/v1`;
```

Key decisions (same as original):
- `getNotes()` unwraps `.items` from the backend envelope — callers always get `Note[]`.
- `id` is `number` everywhere (integer PK, not UUID string).
- `DELETE` path returns `void`; the `request` helper short-circuits on 204.
- Error shape follows FastAPI default: `{ detail: string }`.

---

## 4. Screen / Component Tree

```
app/_layout.tsx       AuthorProvider wraps everything
│
app/index.tsx         Author gate — two buttons; stores to AsyncStorage
│                     Redirects → /notes once author is set
│
app/notes/index.tsx   Notes list
  ├── FilterBar       all / Ben / Wife
  ├── NoteForm        inline create form (toggled by + button)
  ├── ErrorBanner
  ├── LoadingSpinner
  └── FlatList → NoteCard[]  → push /notes/[id]

app/notes/[id].tsx    Note detail (fetches single note by id)
  └── NoteDetail
      ├── NoteForm    edit mode
      └── ConfirmDialog
```

---

## 5. State Management

No Redux or Zustand — local state + React Context only.

### Global: `AuthorContext`
```ts
interface AuthorContextValue {
  author: Author | null;
  setAuthor: (a: Author) => void;
  isHydrating: boolean;
}
```
Reads/writes `AsyncStorage` key `hx_author`.

`isHydrating` starts `true` and flips to `false` once the AsyncStorage read resolves. The root `_layout.tsx` should suppress navigation (or show a neutral splash) while `isHydrating` is `true` to prevent a flash of the author-gate screen on cold starts where the author is already set.

### Hook-level (`useNotes`)
- `notes: Note[]`, `loading: boolean`, `error: string | null`
- Exposes: `refresh()`, `createNote()`, `updateNote()`, `deleteNote()`

### Filter state
`filter: NoteFilter` lives as local `useState` in `app/notes/index.tsx` and is passed to `useNotes` as a parameter (or applied client-side to the returned list). It is not global — it resets on every visit to the list screen, which is the desired behaviour.

---

## 6. Routing (Expo Router)

| Route | Screen |
|---|---|
| `/` (index) | Author gate |
| `/notes` | Notes list |
| `/notes/[id]` | Note detail / edit |

Navigation uses `router.push(`/notes/${id}`)` (interpolated runtime URL) and `router.back()`. The bracket syntax `[id]` is a file-system convention only — never pass it as a literal string to `push`.

---

## 7. Styling

NativeWind (Tailwind for React Native). Use `className` props everywhere.
No StyleSheet API for layout — only use it for values NativeWind can't express.

### Required setup files

**`nativewind-env.d.ts`** — TypeScript shim so `className` is recognised on all React Native components:
```ts
/// <reference types="nativewind/types" />
```

**`global.css`** — must be imported in `app/_layout.tsx` for any Tailwind classes to apply:
```ts
// app/_layout.tsx
import '../global.css';
```

**`tailwind.config.js`** — `content` must cover both route and source directories:
```js
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
};
```

**`metro.config.js`** — `inlineRem: 16` ensures rem-based classes (e.g. `text-sm`, `p-4`) scale correctly on mobile:
```js
const { withNativeWind } = require("nativewind/metro");
module.exports = withNativeWind(config, { input: "./global.css", inlineRem: 16 });
```

---

## 8. UI Components

**Gluestack UI v3** is the selected component library.

**Why:** Built on NativeWind — all styling uses `className`, the same as the rest of the app. One unified styling system, no parallel theme engine.

**Setup:**
```bash
npx gluestack-ui@latest init
```
The CLI copies component source files into `components/ui/`. You own the code and can customise freely.

**Key components available:** Button, Card, Input, Textarea, FormControl, Modal, Toast, Badge, Avatar, Spinner, HStack/VStack/Box, Select, Alert, Fab, Progress, and more.

**Provider:** Wrap the root layout in `GluestackUIProvider`:
```tsx
// app/_layout.tsx
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <AuthorProvider>
        <Stack />
      </AuthorProvider>
    </GluestackUIProvider>
  );
}
```

Dark mode is available via `mode="dark"` — trivially toggleable later.

---

## 9. Environment / Config

```
# frontend/.env
EXPO_PUBLIC_API_URL=http://localhost:8000

# On physical device (Expo Go), use LAN IP:
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
```

---

## 10. Verification

1. `cd frontend && npx expo start` — Metro starts, QR displayed
2. Scan QR with Expo Go on iPhone — app loads
3. Pick author → redirected to notes list
4. Create a note → appears in list
5. Tap note → detail screen; edit → saved; delete → gone
6. Filter by author → only that author's notes shown
