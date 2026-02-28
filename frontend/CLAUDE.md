# Frontend

React Native, Expo SDK 54, Expo Router (file-based), NativeWind (Tailwind for RN), TypeScript 5, npm.

## Relevant Agents
- **frontend-developer** — primary implementation agent
- **architect-reviewer** — reviews PRs before human merge

## Structure

```
frontend/
├── app/                     # Expo Router file-based routes
│   ├── _layout.tsx          # Root layout — AuthorProvider + Stack
│   ├── index.tsx            # Author gate (redirects to /notes when set)
│   └── notes/
│       ├── index.tsx        # Notes list screen
│       └── [id].tsx         # Note detail screen
├── src/
│   ├── api/
│   │   └── client.ts        # ALL backend API calls — no exceptions
│   ├── components/
│   │   ├── notes/           # NoteCard, NoteDetail, NoteForm
│   │   └── ui/              # FilterBar, LoadingSpinner, ErrorBanner, ConfirmDialog
│   ├── context/
│   │   └── AuthorContext.tsx # Global author identity (AsyncStorage)
│   ├── hooks/
│   │   └── useNotes.ts      # List state + all mutations
│   └── types/
│       └── notes.ts         # TypeScript interfaces & enums
├── assets/                  # App icons, splash images
├── global.css               # Tailwind directives (imported by app/_layout.tsx)
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
├── app.json
└── .env.example             # EXPO_PUBLIC_API_URL=http://localhost:8000
```

## Commands

```bash
npx expo start          # Metro bundler + QR code for Expo Go
npx expo start --ios    # iOS simulator (requires Xcode)
npx tsc --noEmit        # Type-check
```

## Conventions

- All API calls in `src/api/client.ts` — no inline fetch in components
- One file per domain: `notes.ts`, `expenses.ts`, etc. inside `src/api/` and `src/types/`
- Import alias `@/` maps to the project root (set in tsconfig.json)
- Components: PascalCase filename + default export; hooks: `use` prefix
- Strict TypeScript — no `any`; use `unknown` + type guards if needed
- No auth in v1 — `author` is `"Ben" | "Wife"` persisted via AsyncStorage
- `EXPO_PUBLIC_API_URL` env var points to the backend base URL
- Styling: NativeWind `className` props — no StyleSheet API for layout

## Environment Variables

Expo exposes env vars prefixed `EXPO_PUBLIC_` to the JS bundle.

```
# frontend/.env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

When testing on a **physical iPhone** (Expo Go), use your Mac's LAN IP instead:
```
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
```

## Adding a New Feature

1. Add TypeScript types to `src/types/<domain>.ts`
2. Add API helpers to `src/api/client.ts` (or `src/api/<domain>.ts`)
3. Build components in `src/components/<domain>/`
4. Add Expo Router screen in `app/<domain>/index.tsx`
5. Register the new screen in `app/_layout.tsx` Stack if it needs a custom header

## NativeWind Quick Reference

```tsx
// Use className just like Tailwind on web
<View className="flex-1 bg-gray-50 px-4">
  <Text className="text-xl font-bold text-gray-900">Hello</Text>
</View>

// Conditional classes
<Pressable className={`rounded-xl py-3 ${active ? 'bg-blue-500' : 'bg-white'}`}>
```

## Running Without Docker

The Expo Metro bundler runs on the host machine. The backend still needs Docker:

```bash
docker compose up db api   # backend only
cd frontend && npx expo start
```
