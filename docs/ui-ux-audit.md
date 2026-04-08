# UI/UX + Frontend Architecture Audit (Baseline)

This document captures the current baseline issues and repetition patterns so we can measure the improvements as we migrate to a unified component system and Arabic-first UX.

## Screens inventory (App Router)

### Auth
- `src/app/login/page.tsx`
- `src/app/login/login-form.tsx`

### Core (authenticated)
- Tasks list/detail/new/edit
  - `src/app/(main)/tasks/page.tsx`
  - `src/app/(main)/tasks/[id]/page.tsx`
  - `src/app/(main)/tasks/new/page.tsx`
  - `src/app/(main)/tasks/[id]/edit/page.tsx`
  - `src/app/(main)/tasks/tasks-table.tsx`
- Malfunctions list/detail/new/edit
  - `src/app/(main)/malfunctions/page.tsx`
  - `src/app/(main)/malfunctions/[id]/page.tsx`
  - `src/app/(main)/malfunctions/new/page.tsx`
  - `src/app/(main)/malfunctions/[id]/edit/page.tsx`
  - `src/app/(main)/malfunctions/malfunctions-table.tsx`
- Achievements list/detail/new/edit
  - `src/app/(main)/achievements/page.tsx`
  - `src/app/(main)/achievements/[id]/page.tsx`
  - `src/app/(main)/achievements/new/page.tsx`
  - `src/app/(main)/achievements/[id]/edit/page.tsx`
- Reports dashboard
  - `src/app/(main)/reports/page.tsx`
  - `src/app/(main)/reports/reports-charts.tsx`

### Admin
- Admin home and users
  - `src/app/(main)/admin/page.tsx`
  - `src/app/(main)/admin/users/page.tsx`
  - `src/app/(main)/admin/users/users-admin-table.tsx`
  - `src/app/(main)/admin/users/new/page.tsx`
  - `src/app/(main)/admin/users/new/new-user-form.tsx`
  - `src/app/(main)/admin/users/[id]/activity/page.tsx`
- System admin (roles/permissions/sites/role-permissions)
  - `src/app/(main)/admin/(system)/**`

## UI/UX issues (top findings)

### 1) Theme/tokens are not consistently used
- `src/app/globals.css` defines base CSS vars (`--background`, `--foreground`) but most components hardcode `zinc-*` colors with `dark:` variants.\n+- Example: `src/components/app-nav.tsx`, many pages’ buttons and tables.

Impact: inconsistent appearance, harder re-theming, and slower iteration.

### 2) Repeated “page header” pattern
- Many pages repeat a layout like: title + count + action button.
- Example: `src/app/(main)/tasks/page.tsx`, `src/app/(main)/malfunctions/page.tsx`.

Impact: small divergences accumulate and create visual inconsistency.

### 3) Repeated form field styling (no primitives)
- Labels + inputs/selects/textarea repeat the same Tailwind strings across many forms.\n+- Example: `src/app/login/login-form.tsx` and all `*-form.tsx` files under `src/app/(main)/**`.

Impact: inconsistent focus rings, spacing, and validation rendering.

### 4) Table UX patterns vary and are embedded per-feature
- Tables are hand-rolled; wrappers, header styles, empty states, and spacing vary.\n+- Example: `src/app/(main)/tasks/tasks-table.tsx`, `src/app/(main)/malfunctions/malfunctions-table.tsx`, `src/app/(main)/reports/page.tsx`.

Impact: inconsistent readability, mobile behavior, and accessibility.

### 5) RTL sharp edges (mixed-direction bugs)
- Physical spacing utilities exist in at least one place (`ml-2`): `src/app/(main)/admin/users/[id]/activity/page.tsx`.\n+- Directional glyphs used in content (`→`) can reorder awkwardly in RTL: same file.\n+- Strings containing direction (e.g. arrows) should not be embedded in translations.

Impact: Arabic-first experience feels “ported” rather than native.

### 6) Client date/number formatting ignores app locale
- Client tables use `new Date(...).toLocaleString()` without passing the app locale.\n+- Example: `src/app/(main)/tasks/tasks-table.tsx`, `src/app/(main)/malfunctions/malfunctions-table.tsx`, `src/components/pagination.tsx` (total formatting).

Impact: user sees inconsistent formatting (browser default vs app language).

### 7) Accessibility gaps and inconsistencies
- Navigation lacks `aria-label` and does not expose the active route (`aria-current="page"`): `src/components/app-nav.tsx`.\n+- Error announcements are inconsistent (`role="alert"` present in some places, missing in others).\n+- Focus styles are not standardized across buttons/links.

Impact: weaker keyboard/screen-reader support and inconsistent interaction quality.

### 8) Visual hierarchy issues in dashboards/KPIs
- KPI cards and tables share similar borders/backgrounds with subtle differences.\n+- Example: `src/app/(main)/reports/page.tsx`.

Impact: the “what matters” is not always obvious at a glance.

### 9) State handling duplicated across client mutations
- Repeated `useState(pending/error)` + `fetch` + `router.refresh()` patterns in multiple client forms/tables.\n+- Example: `src/app/login/login-form.tsx`, `src/app/(main)/admin/users/users-admin-table.tsx`, and various `*-form.tsx`.

Impact: inconsistent errors, duplicated code, and slower UX iteration.

### 10) Dependency/tooling mismatch
- `clsx`, `tailwind-merge`, `class-variance-authority`, and `@tanstack/react-table` exist in `package.json`, but the UI doesn’t yet centralize variants or table patterns.

Impact: the codebase has the right tools installed, but not the architecture to leverage them.

## Repeated UI building blocks to extract (targets)
- **Primitives**: `Button`, `Input`, `Label`, `Textarea`, `Select`, `Card`, `Badge`, `Dialog`, `DropdownMenu`.\n+- **Shells**: `PageHeader`, `FormCard`, `FormField`, `DataTableShell`, `InlineAlert`, `EmptyState`.\n+- **Formatting**: a shared locale-aware formatting utility for dates/numbers usable in client components.

