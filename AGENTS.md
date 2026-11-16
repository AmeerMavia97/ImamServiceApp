This is an Expo (SDK 58) / React Native mobile app written in plain JavaScript (no TypeScript). Prioritize mobile-first patterns, performance, and cross-platform compatibility. It must run in Expo Go.

## Expo has changed — do not trust your training data

Before writing code that touches an Expo, EAS, or React Native API, check the `expo` major version in `package.json` and read the matching docs: `https://docs.expo.dev/versions/v<major>.0.0/`. For anything else see https://docs.expo.dev/llms.txt.

## Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx expo-doctor             # diagnose dependency and config issues
```

## Project structure (`src/`)

Only create a folder when it is actually needed. Import with the `@/` alias (maps to `src/`).

- `assets/` — `fonts/`, `images/`
- `components/` — reusable UI, grouped by kind: `ui/`, `Cards/`, `Modals/`, `Sections/`, `Tabs/`, `hooks/`, ...
- `configuration/` — app wiring: `navigation/` (React Navigation), `query/` (React Query client), `protection/` (route guards)
- `constants/` — `colors.js` (ALL colors live here only), `fonts.js` (2 families: Lobster for headings + TASA Orbiter for text)
- `screens/` — one folder per role/area, e.g. `screens/Home/Home.jsx`, `screens/admin/Dashboard.jsx`
- `services/` — every API call (Supabase) lives here; screens import service functions and call them via React Query (`useQuery` / `useMutation`)
- `store/`, `utils/`, `validations/` — add when needed
- Root `supabase/` — Supabase CLI files (migrations, etc.) when needed

## Rules

- Navigation is React Navigation (not Expo Router). Register screens in `src/configuration/navigation/`.
- Never hard-code colors or font names in screens/components — use `constants/colors.js` and `constants/fonts.js`.
- Data fetching: service function in `services/` → React Query in the screen.
- Backend is Supabase (client in `services/supabase.js`, PUBLISHABLE key in `.env`, never the secret key). The schema, RLS rules and booking functions are in `supabase/schema.sql`; change the database there and re-run it. Home lists the registered Imams and Masjids through the `get_directory` database function (`services/directoryService.js`; public columns of approved accounts only).
- Read services/cities through the `useServices()` / `useCities()` hooks so admin edits show up everywhere. There is no user login: the phone remembers its own booking ids (`utils/storage.js`) and "My Bookings" fetches those.
- Accounts: Imam, Masjid Representative and Admin all log in with Supabase Auth on ONE Login page (`screens/Auth/`; the role is read from the database after login). Sign Up (Imam / Masjid boxes at the top; no admin sign up) creates the `profiles` row through a database trigger. The role always comes from the database (`services/authService.getAccount`: `is_admin()` or `profiles.role`), never from the app; `store/AuthContext` exposes `useAuth()` (user, role, profile, ready, logout).
- Each role has its own dashboard screen (`screens/admin`, `screens/Imam`, `screens/Masjid`; route names in `constants/roles.js`) wrapped in `configuration/protection/RoleGuard`. A new Imam / Masjid account starts 'pending' until the admin approves it (Approvals in the admin drawer); until then it sees only the waiting screen (`ApprovalGate`), is not listed on Home and gets no booking requests. Guards only choose what to show — the real protection is RLS in `supabase/schema.sql`. Home's top-right button is "Join Us" (opens Login) when logged out and the person's photo (opens their dashboard) when logged in.
- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. A library with custom native code needs a development build.
