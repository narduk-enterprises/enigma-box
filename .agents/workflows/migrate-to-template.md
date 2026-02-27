---
description: How to migrate an existing app to the nuxt-v4-template boilerplate
---

# Migrate an App to the `nuxt-v4-template`

This workflow covers the full end-to-end process for migrating an existing Nuxt (or non-Nuxt) project into the `nuxt-v4-template` boilerplate, including infrastructure provisioning, code migration, deployment, and portfolio registration.

> **Prerequisite:** You must have `pnpm`, `wrangler`, `doppler`, and `gh` CLIs installed and authenticated.

---

## Phase 1: Scaffold the New Project

1. **Clone the template into a new directory:**

   ```bash
   gh repo create <new-app-name> --template loganrenz/nuxt-v4-template --private --clone
   cd ~/code/<new-app-name>
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Run the init script** to provision D1, Doppler, analytics, and rename all boilerplate strings:

   ```bash
   npm run init -- --name="<new-app-name>" --display="<Display Name>" --url="https://<domain>"
   ```

   This does the following automatically:
   - Replaces all `nuxt-v4-template` / `Nuxt 4 Demo` strings across the codebase
   - Creates the Cloudflare D1 database (`<new-app-name>-db`)
   - Injects the `database_id` and custom domain route into `wrangler.json`
   - Creates the Doppler project and syncs hub credentials from `narduk-enterprise-apps` and `narduk-analytics`
   - Creates a Doppler CI token and sets `DOPPLER_TOKEN` as a GitHub Actions secret
   - Runs the analytics provisioning pipeline (GA4, GSC, IndexNow)
   - Resets `README.md`

4. **Run Doppler setup locally:**

   ```bash
   doppler setup
   ```

5. **Verify the init worked:**
   - Check `wrangler.json` has a real `database_id` and the correct `routes[].pattern`
   - Check `package.json` has `"name": "<new-app-name>"`
   - Check `nuxt.config.ts` has the correct `site.url` and `site.name`
   - Run `doppler secrets --project <new-app-name> --config prd` to confirm secrets are linked

---

## Phase 2: Migrate Application Code

### 2a. Identify what to migrate from the old project

Open the **old project** side-by-side and inventory:

| Category           | Old Location                         | New Location              |
| ------------------ | ------------------------------------ | ------------------------- |
| Pages              | `app/pages/` or `pages/`             | `app/pages/`              |
| Components         | `app/components/` or `components/`   | `app/components/`         |
| Composables        | `app/composables/` or `composables/` | `app/composables/`        |
| Layouts            | `app/layouts/` or `layouts/`         | `app/layouts/`            |
| Server API routes  | `server/api/`                        | `server/api/`             |
| Server utils       | `server/utils/`                      | `server/utils/`           |
| Server middleware  | `server/middleware/`                 | `server/middleware/`      |
| Database schema    | `server/database/`                   | `server/database/`        |
| Drizzle migrations | `drizzle/`                           | `drizzle/`                |
| Static assets      | `public/`                            | `public/`                 |
| Content (markdown) | `content/`                           | `content/`                |
| CSS / Tailwind     | `assets/css/` or `app/assets/css/`   | `app/assets/css/main.css` |

### 2b. Copy application code

// turbo-all

1. Copy pages, components, composables, layouts from old project to new project's `app/` directory.
2. Copy server-side code (API routes, utils, middleware, database schema) to `server/`.
3. Copy Drizzle migration files to `drizzle/`.
4. Copy static assets (images, favicons, fonts) to `public/`.
5. Copy content files to `content/` if using Nuxt Content.

### 2c. Migrate dependencies

1. Compare the old `package.json` dependencies with the new one.
2. Install any **additional** dependencies the old project needs:
   ```bash
   pnpm add <dependency-1> <dependency-2>
   ```
3. **Do NOT** downgrade any template dependencies — the template versions are authoritative.

### 2d. Migrate configuration

1. **`nuxt.config.ts`**: Merge any custom modules, runtimeConfig keys, or Nitro settings from the old project. Do not replace the template's config wholesale — add incrementally.
2. **`wrangler.json`**: If the old project needs R2 buckets, KV namespaces, or additional D1 databases, add them here:
   ```json
   "r2_buckets": [
     { "binding": "IMAGES", "bucket_name": "<new-app-name>-images" }
   ]
   ```
   Create the R2 bucket if needed: `pnpm wrangler r2 bucket create <new-app-name>-images`
3. **`app/app.config.ts`**: Update the UI color tokens (`primary`, `neutral`) to match the old project's brand.
4. **`app/assets/css/main.css`**: Migrate any custom `@theme` tokens, fonts, or CSS.

### 2e. Fix Cloudflare Workers compatibility

Before proceeding, audit for edge-incompatible code:

- Replace any `bcrypt` usage with `crypto.subtle` (PBKDF2)
- Replace `fs`, `path`, `crypto` Node.js imports with edge-compatible alternatives
- Replace Prisma with Drizzle ORM
- Ensure all `better-sqlite3` usage is only in local dev (D1 is the production database)
- Run `/check-nitro-edge` workflow to verify

### 2f. Fix Nuxt 4 / Nuxt UI 4 compliance

- Ensure the Nuxt 4 `app/` directory structure is used (not legacy `pages/` at root)
- Replace `UDivider` with `USeparator`
- Replace icon `name="heroicons-..."` with `icon="i-lucide-..."` prefix
- Run `/check-nuxt-ui-v4` workflow to verify
- Run `/check-nuxt-ssr` workflow to verify SSR safety
- Run `/check-store-separation` workflow to verify thin-component patterns

---

## Phase 3: Database Migration

1. **Update the Drizzle schema** in `server/database/schema.ts` to match the old project's data model.

2. **Generate the migration:**

   ```bash
   pnpm run db:generate
   ```

3. **Apply locally:**

   ```bash
   pnpm run db:migrate
   ```

4. **Apply to production D1:**

   ```bash
   pnpm wrangler d1 execute <new-app-name>-db --remote --file=drizzle/<migration-file>.sql
   ```

5. **Seed data** if the old project has existing data that needs to be transferred (e.g., product catalogs, user records). Write a migration script or use `wrangler d1 execute` with INSERT statements.

---

## Phase 4: Local Verification

1. **Start the dev server:**

   ```bash
   doppler run -- pnpm run dev
   ```

2. **Verify all pages load** without hydration errors or SSR crashes.

3. **Run quality checks:**

   ```bash
   pnpm run quality
   ```

   This runs both `lint` and `typecheck`.

4. **Test the build:**
   ```bash
   pnpm run build
   ```

---

## Phase 5: Deploy

1. **Commit all changes:**

   ```bash
   git add .
   git commit -m "feat: migrate <old-project> to nuxt-v4-template"
   git push origin main
   ```

2. **The CI/CD pipeline** (`.github/workflows/deploy.yml`) will automatically:
   - Install dependencies with pnpm
   - Fetch Doppler secrets
   - Build and deploy to Cloudflare Workers via Wrangler

3. **Verify deployment:**
   - Check the Cloudflare dashboard for the new Worker
   - Visit the production URL and verify all pages load
   - Check PostHog and GA4 for incoming events with the correct `app` label

---

## Phase 6: Custom Domain (if applicable)

1. **Add the domain in Cloudflare DNS** — create a CNAME or A record pointing to the Worker.

2. **Verify `wrangler.json`** has the correct `routes` entry:

   ```json
   "routes": [
     { "pattern": "<yourdomain.com>", "custom_domain": true }
   ]
   ```

3. **Re-deploy** to bind the custom domain:

   ```bash
   pnpm run deploy
   ```

4. **Verify SSL** is active and the site loads on the custom domain.

---

## Phase 7: Register on Portfolio

Add the new project to https://portfolio.nard.uk:

1. **Open** `~/code/narduk-enterprises-portfolio/app/pages/index.vue`
2. **Add a new entry** to the `projects` array in `<script setup>`:
   ```ts
   {
     name: '<Display Name>',
     description: '<One-line description of the project>',
     url: 'https://<domain>',
     icon: 'i-lucide-<icon-name>',
     gradient: 'from-<color>-400 to-<color>-500',
     iconColor: 'text-<color>-400',
     badgeColor: '<nuxt-ui-color>',
     tag: '<Category>'
   }
   ```
3. **Deploy the portfolio:**
   ```bash
   cd ~/code/narduk-enterprises-portfolio
   git add . && git commit -m "feat: add <new-app-name> to portfolio" && git push origin main
   ```

---

## Phase 8: Cleanup

1. **Archive the old project** (move to graveyard or reference):

   ```bash
   mv ~/code/<old-project-name> ~/old-code/graveyard/<old-project-name>
   # or for reference:
   mv ~/code/<old-project-name> ~/old-code/reference/<old-project-name>
   ```

2. **Archive the old GitHub repo** (if applicable):

   ```bash
   gh repo archive loganrenz/<old-project-name> --yes
   ```

3. **Remove old Cloudflare Workers** deployment if the old project had one with a different name.

4. **Delete old Doppler project** if the old project had a separate one that is no longer needed.

---

## ⚠️ Migration Tips & Known Gotchas

These are battle-tested lessons from past migrations (circuit-breaker-online, papa-everetts-pizza, austin-texas-net) and the institutional knowledge base.

### CSS Import Order is Critical

In `app/assets/css/main.css`, you **MUST** import `@nuxt/ui` immediately after `tailwindcss`. Without this, Nuxt UI components (UButton, UCard, etc.) will render completely unstyled.

```css
/* CORRECT ORDER */
@import url('https://fonts.googleapis.com/...'); /* fonts FIRST if any */
@import 'tailwindcss';
@import '@nuxt/ui';

@theme {
  /* custom tokens */
}
```

> Google Font `@import url()` must come BEFORE tailwindcss/nuxt-ui imports (PostCSS requirement).

### Never Use `@apply` with Scoped Styles

Using `@apply` inside `<style scoped>` (especially with `:deep()`) can trigger `Cannot apply unknown utility class` errors during SSR. Use CSS variables instead:

```css
/* BAD */
.prose :deep(pre) {
  @apply bg-neutral-100;
}
/* GOOD */
.prose :deep(pre) {
  background-color: var(--color-neutral-100);
}
```

### Stale `.nuxt` Cache After File Moves

After copying/moving files, Nuxt's build cache can become stale, causing `ERR_MODULE_NOT_FOUND` or phantom 500 errors. Always run the "deep clean" after major file operations:

```bash
rm -rf .nuxt .output && npx nuxi prepare
```

### Nuxt UI 4 Component Renames

When migrating from older Nuxt UI versions, watch for these renames:

- `UDivider` → `USeparator`
- `UNavigationTree` → `UTree`
- `UDashboardPanelContent` → `UDashboardPanelBody`
- `value-attribute` → `value-key` (on USelectMenu)
- `option-attribute` → `label-key` (on USelectMenu)
- `options` prop → `items` prop (on USelectMenu)

### Tailwind v4 Utility Renames

Old Tailwind v3 class names that changed in v4:

- `flex-shrink-0` → `shrink-0`
- `flex-grow-0` → `grow-0`
- `bg-gradient-to-r` → `bg-linear-to-r`

### Remove Legacy Tailwind/PostCSS Config Files

Tailwind v4 uses the Vite plugin. If the old project has `tailwind.config.ts`, `tailwind.config.js`, or `postcss.config.js`, **delete them** — they interfere with Nuxt UI 4's built-in integration.

### `.npmrc` Must Exist

The template ships with `.npmrc` containing `shamefully-hoist=true`. Make sure this file is preserved after cloning. Without it, `pnpm install` may fail to resolve some Nuxt dependencies.

### D1 Binding Gotcha on Production Deploy

If D1 works locally but returns errors in production:

1. Verify `d1_databases` is in `wrangler.json` (not just the Cloudflare dashboard).
2. For custom domains, existing A/AAAA DNS records will conflict with the CNAME setup — delete them first.
3. DNS CNAME records must be **Proxied** (orange cloud) for apex domain CNAME flattening.

### Nuxt Content v3 on Cloudflare Workers

Nuxt Content auto-switches to D1 database storage on Workers. The `DB` binding in `wrangler.json` is shared. If your app uses both Nuxt Content and custom D1 tables, both use the same D1 database — this is fine but be aware of it.

### Dynamic Route Bracket Escaping

When copying `[slug].vue` or `[id]/` directories via CLI, the brackets can get escaped as `\[id\]/`. This silently breaks filesystem routing (404s with no build errors). Verify with `ls -la` and rename if needed:

```bash
mv '\[id\]' '[id]'
```

### PostHog: Do NOT Create Separate Projects

All template apps log to the single `narduk-analytics` PostHog workspace. Apps are differentiated by the `app` property injected by the client plugin. Do NOT create a new PostHog project per app.

### `db:migrate` Script Needs Updating

After init, the `db:migrate` script in `package.json` references the initial schema file. If you add new migration files, update this script or run migrations manually:

```bash
pnpm wrangler d1 execute <app-name>-db --local --file=drizzle/<your-migration>.sql
```

### Environment Check Pattern (Server-side)

When writing server plugins or middleware, use `!import.meta.dev` instead of `process.env.NODE_ENV === 'production'`. The `import.meta.dev` boolean is the standard in the Vite/Nitro ecosystem.

---

## Quick Reference: Init Script Re-run (Repair Mode)

If infrastructure provisioning failed or needs re-running without re-doing string replacements:

```bash
npm run init -- --name="<app-name>" --display="<Display Name>" --url="https://<domain>" --repair
```
