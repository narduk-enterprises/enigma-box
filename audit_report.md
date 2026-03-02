# EnigmaBox — Template Audit Report

## 1. Did `pnpm setup` complete smoothly?

**Yes.** The setup script (`pnpm run setup -- --name="enigma-box" --display="EnigmaBox" --url="https://enigma-box.narduk.workers.dev"`) completed successfully and non-interactively. It:

- Replaced boilerplate strings in 18 files and 4 markdown files
- Provisioned D1 (`enigma-box-db`) and updated `wrangler.json`
- Created the Doppler project `enigma-box` and synced hub credentials
- Set `DOPPLER_TOKEN` in GitHub
- Deferred analytics setup (missing GA/GSC secrets) with a clear follow-up command
- Generated favicons
- Cleaned up example apps and workflows

**Friction:** None. One caveat: analytics setup was deferred; docs could state more explicitly that this is expected when hub secrets are not yet set.

---

## 2. Did Drizzle migration and `nitro-cloudflare-dev` work out of the box?

**Mostly yes.**

- **Drizzle migration:** The app already had `drizzle/0000_initial_schema.sql` and `db:migrate` wired to it. After adding new tables (rooms, puzzles, game_sessions) to the schema and migration SQL, `pnpm run db:migrate` ran successfully against the local D1 database.
- **nitro-cloudflare-dev:** Already present in `apps/web` with `nuxt.config.ts` pointing at `wrangler.json`. No extra setup was required.

**Friction:**

- **Schema vs layer:** The template uses a **layer** schema (users, sessions, todos) and recommends that apps that extend the schema provide their own database helper so the full schema is available. The docs say to use something like `useAppDatabase(event)` to avoid the layer’s `useDatabase` (which only sees the layer schema). Implementing this required:
  1. Defining app tables in `apps/web/server/database/schema.ts` (re-exporting the layer + adding rooms, puzzles, game_sessions).
  2. Adding `apps/web/server/utils/database.ts` that exports `useAppDatabase(event)` and uses the app schema.  
  If we had kept the name `useDatabase` in the app, Nuxt would have shown a “Duplicated imports” warning and the layer’s version would have been used, so app tables would be missing. This is documented in AGENTS.md but easy to miss; a short “extending the schema” subsection in the DB recipe would help.

---

## 3. Did Nuxt layer inheritance work seamlessly?

**Yes, with one important detail.**

- The layer’s modules, SEO composables, CSRF plugin, rate limiting, security headers, and base CSS were all inherited and worked.
- **Server merge behavior:** The app’s `server/utils/database.ts` did **not** override the layer’s when both exported `useDatabase` — Nitro chose the layer’s and warned about duplicated imports. Renaming to `useAppDatabase` fixed this. So “app overrides layer” is true for many things, but for identically named server utils the resolution can favor the layer; the audit suggests documenting this.

---

## 4. Any pre-existing TypeScript errors from `pnpm typecheck`?

**Yes — all in server code and all fixable.**

- **Server module resolution:** Relative imports like `../../../database/schema` from `server/api/admin/rooms.get.ts` failed under `nuxt typecheck` because the server tsconfig (`.nuxt/tsconfig.server.json`) resolves from a different base. Switching to the **`#server`** alias (e.g. `#server/database/schema`, `#server/utils/database`, `#server/utils/auth`) fixed every “Cannot find module” in server code. The template does not currently show `#server` in the server import examples; adding a note would prevent this.
- **Missing deps for typecheck:** The app’s server code uses `zod` and `drizzle-orm`. They are in the layer; for `pnpm typecheck` in the app they had to be added to `apps/web` so TypeScript could resolve them. Adding `zod` and `drizzle-orm` to the app’s `package.json` fixed it.
- **Other:** `crypto.getRandomUUID` was reported as missing; the correct API in the environment is `crypto.randomUUID()`. One `parsed.error` was possibly undefined; using `parsed.error?.message ?? '...'` fixed it. No suppressions were used.

---

## 5. Did documentation accurately guide you?

**Mostly yes.**

- **AGENTS.md** is accurate for structure, layer inventory, Cloudflare constraints, rate limiting, and the need for an app-specific DB helper when extending the schema. The “Schema ownership & extensions” note under the Auth recipe is correct but easy to skim past.
- **No `tools/BUILD_TEST_APP.md`** was present (only `tools/AGENTS.md`). The prompt referred to it; either the file was removed during cleanup or never existed. Not a functional issue.
- **Recipes:** Auth (PBKDF2, sessions), data fetching (useAsyncData/useFetch), and “no raw $fetch” are clearly stated. The requirement to use `$csrfFetch` or the CSRF header in composables for mutations is enforced by ESLint and is documented.

**Gaps:**

- Server imports: recommend **`#server/...`** in server code for reliable typecheck/build.
- Extending the schema: a single “Extending the database schema” subsection (in the DB or Recipe section) with “re-export layer schema, add tables, add `useAppDatabase` in app, use it everywhere in app server routes” would reduce mistakes.

---

## 6. Any HMR port collisions, Tailwind issues, or Doppler errors?

- **HMR / port:** Not observed. Dev was not run for long; no collision was seen.
- **Tailwind:** No functional issues. Build reported:  
  `[plugin @tailwindcss/vite:generate:build] Sourcemap is likely to be incorrect` — a Tailwind/Vite sourcemap warning only.
- **Doppler:** Setup created the project and synced hub credentials. Analytics setup was deferred due to missing hub secrets, with a clear message. No Doppler runtime errors were observed.

---

## Summary

| Area                    | Result   | Notes                                                                 |
|-------------------------|----------|-----------------------------------------------------------------------|
| `pnpm setup`            | Smooth   | Non-interactive, clear steps and deferral message for analytics.     |
| Drizzle + nitro-cloudflare-dev | Works    | Migration and local D1 fine; app must use `useAppDatabase` when extending schema. |
| Layer inheritance       | Good     | Use a distinct name for app DB helper to avoid duplicate-import behavior. |
| TypeScript (typecheck)   | Fixed    | Use `#server` in server imports; add zod/drizzle-orm in app for types. |
| Documentation           | Accurate | Small additions (server imports, schema extension) would help.        |
| HMR / Tailwind / Doppler| No issues| One Tailwind sourcemap warning; Doppler deferral was clear.            |

**Critical rule:** All reported errors and warnings were addressed with real fixes (alias imports, renames, dependency additions, API and type corrections). No `@ts-expect-error`, eslint-disable, or other suppressions were used.
