# Agent Prompt: Build "example-tasks" Test App (Standalone Template)

> **Purpose:** This prompt instructs an AI agent to build a simple task-list app by cloning the `narduk-nuxt-template` repository and initializing it as a standalone project. The app is intentionally small but touches every major subsystem — proving the template's end-to-end workflow works from clone to deploy.

---

## Prompt

You are building a **simple task-list application** called `example-tasks` by using the `narduk-nuxt-template` repository. The app should be minimal but must exercise every major subsystem the template provides. Follow these instructions exactly.

### 1. Clone & Initialize the Template

1. Clone the template repository to a new directory:
   ```bash
   git clone https://github.com/loganrenz/narduk-nuxt-template.git example-tasks
   cd example-tasks
   ```
2. Clear the template's git history and set up your own repository (Required for GitHub CI secrets to bind properly):
   ```bash
   rm -rf .git
   git init
   git remote add origin git@github.com:your-username/example-tasks.git
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Run the initialization script to rename the project, configure D1 databases, secure CI tokens, and clean up template examples:
   ```bash
   pnpm setup -- --name="example-tasks" --display="Tasks Example" --url="http://localhost:3000"
   ```

### 2. Scaffold the App in `apps/web`

Build your task app within the main project directory (`apps/web/`). Remove the placeholder `apps/web/app/pages/index.vue` and create the following structure:

```text
apps/web/
  app/
    app.vue
    app.config.ts
    assets/css/main.css
    pages/
      index.vue        # Task list page
      about.vue         # Static about page
    components/
      TaskForm.vue      # Add-task form (Zod-validated)
      TaskList.vue      # Renders task list
    composables/
      useTasks.ts       # Task CRUD composable (Thin Component pattern)
    layouts/
      default.vue       # App shell with header + footer
  server/
    api/
      tasks/
        index.get.ts    # GET /api/tasks → list all tasks
        index.post.ts   # POST /api/tasks → create task
        [id].patch.ts   # PATCH /api/tasks/:id → toggle complete
        [id].delete.ts  # DELETE /api/tasks/:id → delete task
    database/
      schema.ts         # Drizzle schema for 'tasks' table (re-exports layer base)
  drizzle/
    0001_tasks.sql      # CREATE TABLE tasks migration
  nuxt.config.ts
  package.json
  wrangler.json
```

### 3. Configuration Files (`apps/web/`)

#### `nuxt.config.ts`

- Ensure `extends: ['@loganrenz/narduk-nuxt-template-layer']` remains.
- Add `modules: ['nitro-cloudflare-dev']` with `nitro.cloudflareDev.configPath` pointing to local `wrangler.json` (Required to access the local D1 database during development).
- Ensure `site` metadata matches "Tasks Example".

#### `package.json`

- Ensure the name is `"example-tasks-web"`.
- Add `"drizzle-orm"`, `"nuxt"`, and `"zod"` as dependencies.
- Make sure `db:migrate` and `db:seed` scripts point to the right D1 database name (e.g. `example-tasks-db`).

#### `wrangler.json`

- Verify the `d1_databases` array is configured with `binding: "DB"` and the correct `database_name`.

### 4. Database Schema

#### `server/database/schema.ts`

```ts
// Re-export the layer base schema, then add app-specific tables
export * from '@loganrenz/narduk-nuxt-template-layer/server/database/schema';

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
```

#### `drizzle/0001_tasks.sql`

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 5. API Routes

All server routes live in `apps/web/server/api/tasks/`. They must:

- Use the `useDatabase()` utility from the layer (imported from `#imports`) to access D1.
- Use `enforceRateLimit()` from the layer for POST/PATCH/DELETE routes (e.g., `await enforceRateLimit(event, 'tasks-write', 30, 60_000)`).
- Use Zod for input validation on POST and PATCH.
- Return proper HTTP status codes.
- **Constraint:** NO Node.js `fs`, `path`, `crypto`, or `bcrypt` — this runs on Cloudflare Workers.

#### `index.get.ts` — List tasks

Query all tasks ordered by `createdAt` DESC using Drizzle.

#### `index.post.ts` — Create task

Validate `{ title: string }` with Zod. Insert into `tasks` table. Return the new task with 201 status.

#### `[id].patch.ts` — Toggle task

Read the task by ID, flip `completed`, update, return updated task. Return 404 if not found.

#### `[id].delete.ts` — Delete task

Delete by ID, return 204. Return 404 if not found.

### 6. Frontend Pages & Components

#### `app/app.vue`

```vue
<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
```

#### `app/layouts/default.vue`

Simple layout with:

- A sticky header using `UHeader` or manual markup with app name "Tasks Example" and a nav link to `/about`
- A `<slot />` for page content
- A footer with "Built with narduk-nuxt-template"

#### `app/pages/index.vue`

- Calls `useSeo()` and `useWebPageSchema()` (required by template standards)
- Uses the `useTasks()` composable for all data operations
- Renders `<TaskForm />` and `<TaskList />`
- Shows a count of completed vs total tasks
- Uses `useAsyncData` (never raw `$fetch` in `<script setup>`)

#### `app/pages/about.vue`

- Calls `useSeo()` and `useWebPageSchema()`
- A static page explaining this is a test app
- Links back to the index page

#### `app/components/TaskForm.vue`

- Uses `<UForm :schema :state>` with Zod validation (minimum title length: 1 char)
- Emits a `created` event on success
- Uses `<UFormField>` + `<UInput>` + `<UButton>`

#### `app/components/TaskList.vue`

- Props: `tasks`, `loading`
- Emits: `toggle`, `remove`
- Renders each task with a `<UCheckbox>` for toggle and a `<UButton>` with `i-lucide-trash-2` icon for delete
- Shows empty state with `<UAlert>` when no tasks exist
- Uses Nuxt UI components exclusively (no raw HTML inputs)

#### `app/composables/useTasks.ts`

- Uses `useAsyncData('tasks', () => $fetch('/api/tasks'))` to load tasks
- Exposes `tasks`, `pending`, `addTask(title)`, `toggleTask(id)`, `removeTask(id)`, `refresh()`
- All mutation functions call `$fetch` and then `refresh()` the data
- Uses `useState()` or reactive state from `useAsyncData` (never bare `ref()` at module scope)

#### `app/assets/css/main.css`

Minimal app-specific styles only — the layer provides the base design system. Just import Tailwind:

```css
@import 'tailwindcss';
```

#### `app/app.config.ts`

```ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'zinc',
    },
  },
});
```

### 7. E2E Tests (`apps/web/tests/e2e/tasks.spec.ts`)

Write Playwright tests covering:

1. **Page loads** — home page renders with the app title and task form
2. **SEO** — verify `<title>` and `<meta name="description">` are set
3. **Add a task** — type a title, submit, verify it appears in the list
4. **Toggle a task** — click the checkbox, verify visual state change
5. **Delete a task** — click delete button, verify task disappears
6. **Empty state** — when no tasks, verify the empty-state alert shows
7. **About page** — navigate to `/about`, verify content renders
8. **API health** — `GET /api/health` returns 200 (from layer)

Use these Playwright patterns:

- `await page.waitForLoadState('networkidle')` before assertions
- Use `page.locator()` with semantic selectors (role, text, test IDs)
- Keep tests independent — each test should create its own data

### 8. Verification Checklist

After building the app, verify these commands succeed in order in the root directory:

```bash
# 1. Prepare the local database and run migrations
pnpm run db:migrate
pnpm run db:seed  # (Optional if you have seed data)

# 2. Quality checks (lint + typecheck)
pnpm run quality

# 3. Start dev server and verify manually
pnpm run dev
# → Visit http://localhost:3000 — should see the task list page
# → Add a task, toggle it, delete it
# → Visit http://localhost:3000/about — should render
# → Visit http://localhost:3000/api/health — should return { "status": "ok" }

# 4. Run E2E tests
pnpm run test:e2e

# 5. Build for production (Cloudflare Workers bundle)
pnpm build
```

### 9. Template Subsystems Exercised

When complete, this project will have validated:

| Subsystem                  | How It's Tested                                                     |
| -------------------------- | ------------------------------------------------------------------- |
| **Project Initialization** | Template clone, `init.ts` setup + automated cleanup                 |
| **Layer inheritance**      | `extends: ['@loganrenz/narduk-nuxt-template-layer']` in nuxt.config |
| **Nuxt 4 structure**       | `app/` directory with `future: { compatibilityVersion: 4 }`         |
| **D1 + Drizzle**           | `tasks` table via Drizzle ORM with D1 binding                       |
| **Cloudflare Workers**     | `wrangler.json` + `nitro` config + no Node.js APIs                  |
| **API routes**             | Full CRUD REST API under `server/api/tasks/`                        |
| **Rate limiting**          | `enforceRateLimit()` on mutation endpoints                          |
| **CSRF protection**        | Automatic via layer's `fetch.client.ts` plugin                      |
| **Security headers**       | Automatic via layer middleware                                      |
| **SEO**                    | `useSeo()` + `useWebPageSchema()` on every page                     |
| **Nuxt UI 4**              | `UForm`, `UInput`, `UButton`, `UCheckbox`, `UCard`, `UAlert`        |
| **Tailwind CSS 4**         | `@import 'tailwindcss'` + design tokens from layer                  |
| **Zod validation**         | Client-side form + server-side API validation                       |
| **Thin Component pattern** | Components delegate to `useTasks()` composable                      |
| **SSR-safe state**         | `useAsyncData` + `useState` (no bare module-scope `ref()`)          |
| **E2E tests**              | Playwright tests running against `apps/web`                         |

### 10. Hard Constraints (Do Not Violate)

- **NO `.env` files** — all secrets via Doppler (or assumed local bindings for CI).
- **NO Node.js modules** — no `fs`, `path`, `crypto`, `bcrypt`.
- **NO raw `$fetch`** in `<script setup>` — use `useAsyncData` or `useFetch`.
- **NO bare `ref()`** at module scope — use `useState()` for SSR safety.
- **NO duplicating layer files** — don't recreate `useSeo`, `useSchemaOrg`, plugins, or middleware.
- **DO call `useSeo()` + `useWebPageSchema()`** on every page.
- **DO use Nuxt UI 4 components** — `USeparator` (not `UDivider`), `i-lucide-*` icons.
- **DO use `@loganrenz/narduk-nuxt-template-layer` as workspace dependency** — never copy layer code.
