# Design — Friendlier Shelf browse (collapsible categories · favorites · notes · light default)

Date: 2026-06-17
Status: awaiting user approval → writing-plans
Backlog ref: new (post P1–P7). Supersedes the flat List view shipped 2026-06-13.

## Problem

The Shelf (List) tab is a single flat scroll of all 201 items sorted by expiry. The only
filter is a single-select chip row hardcoded to **Cheek / Lip / Eye / Expiring** — six of her
real categories (Highlighter, Contour, Concealer, Base, Powder, Uncategorized) are unreachable
except via "All" or search. At 201 items it does not scale; even one category can be 50+ rows.
Separately, the app defaults to **dark** mode (it follows the OS, and her/our Macs are dark), so
the bright "Seoul Glass" rosy look she wants is hidden behind the system default.

## Decisions (locked with user, 2026-06-17)

1. **Browse model:** collapsible category sections, **all collapsed by default**. 201 rows → a
   ~9-line index; tap a header to expand that one category.
2. **Multi-category items appear in every category they fit** (a lip-and-cheek tint shows under
   both Lip and Cheek). Section counts overlap; the header total stays the true item count.
3. **Highlights = star favorites + a Favorites view.** Tap a star on any item; a pinned
   "Favorites" section (collapsed, only shown when ≥1 favorite) gathers them. Persisted to the
   sheet as a new column.
4. **Notes:** let her add/edit free-text notes per item from the app (data already exists in the
   sheet's `notes` column and is already returned by `getBootstrap`).
5. **Theme:** default to the **light** Seoul Glass skin (stop following the OS). Keep the manual
   sun/moon toggle and its `localStorage.st.dark` persistence.
6. Backend changes are allowed (favorites column + two row-update functions) — this is an
   additive, contract-safe migration, not a restructure.

## Scope of change

Touch **two files**: `apps-script/index.html` (List view, theme default, favorites + notes UI)
and `apps-script/Code.gs` (favorites column + `setFavorite` / `setNotes`). No data migration risk:
the new column is appended at the end via the existing `ensureSchema()` path; existing rows are
untouched.

### A. List view IA (`index.html`)

Replace the flat `#list-rows` + single-select `#list-chips` with, top to bottom:

1. **Header + search** — unchanged (`Shelf` title, count, dark toggle, search pill).
2. **Expiring strip** — a thin tappable banner shown only when any non-retired item is expired or
   ≤90 days out: e.g. `7 expired · 4 expiring soon`. Tap → filters to those (reuses the existing
   `expiring` filter predicate: `model(r).status === 'soon' || 'expired'`).
3. **Favorites section** — collapsible, pinned above the categories, shown only when ≥1 favorite.
4. **Category sections** — one collapsible section per category, **ordered by live item count
   descending, `Uncategorized` always last.** Current categories from her data: Cheek, Lip, Eye,
   Highlighter, Contour, Concealer, Base, Powder, Uncategorized. Each header row: chevron,
   category name, count pill, and a small status dot if the category contains any expired item.
   Tapping toggles expand/collapse for that section only.

**Category assignment:** for each item, assign it to **every** category whose label is found
(case-insensitive, token-aware) in `r.a` — mirrors today's `passFilter` substring logic and gives
multi-category for free. Items matching no known category (or empty `r.a`) → `Uncategorized`. The
category list is a single ordered constant so adding a category later is one edit.

**Rows inside a section:** reuse the existing `rowHTML(model(r))` verbatim — swatch dot, brand +
name, code/shade · area, status badge, swipe-to-reveal Opened/Retire. Sort within a section by the
existing expiry order (`expired → soon → fresh → none → retired`); retired items stay dimmed at the
bottom. Add a **star toggle** to each row and a **note glyph** when `r.notes` is non-empty.

**Search behavior:** when the search box has a query, collapse the section UI and render a **flat
match list across all items** (today's behavior) so nothing is ever hidden from search. Clearing
the box restores the sectioned view. Expand/collapse state persists per-session via `localStorage`
(reuse the `st.*` namespace).

### B. Favorites + notes UI (`index.html`)

- **Star:** a 44px star control on each list row and in the Detail view. Optimistic toggle →
  `RUN('setFavorite', row, bool)`; on success update `BOOT.rows[i].fav`. Favorited items also
  surface in the pinned Favorites section.
- **Notes:** in the Detail view, show the note and an edit affordance (textarea + Save). Save →
  `RUN('setNotes', row, text)`; update `BOOT.rows[i].notes`. A small glyph on the row signals a
  note exists. (Notes are already in bootstrap, so display needs no backend.)

### C. Theme default (`index.html`)

Change the init default (currently `stored!=null ? stored==='1' : matchMedia('(prefers-color-scheme:dark)').matches`)
to default **light** when nothing is stored: `var on = stored==='1';`. Keep the toggle, the
`setDark` writer, and `localStorage.st.dark` persistence intact. One-line change; dark is still one
tap away and still remembered.

### D. Backend (`Code.gs`)

- Append `'favorite'` as **column 17** to `HEADERS`. `ensureSchema()` already inserts missing
  columns and rewrites the header row, so the migration happens automatically on the next
  `getBootstrap()`; existing rows keep their data. `favorite` is not a TEXT_COL (stores `yes`/``).
- `getBootstrap()`: destructure the 17th cell and return `fav: (favorite === 'yes')` per row.
  (`notes` is already returned — no change needed for notes.)
- Add `setFavorite(row, on)` and `setNotes(row, text)`, each mirroring `markOpened`/`setStatus`:
  validate `row` bounds, `setValue` on the single target cell (col 17 / col 15). Never `appendRow`.
- `addItem` / `bulkImport` map over `HEADERS`, so the 17th column is handled automatically and the
  16-column scanner TSV still pads safely (favorite blank). Back-compat preserved.

## Preserved (explicitly not changing)

Add / Scan / Import tabs; the Catalog tab (Grid/Insights/Korea Haul); the effective-expiry rule
(earliest of printed / opened+PAO / mfg+36mo "est."); the swatch-smear system; `<base target="_top">`
+ scriptlet + IFRAME sandbox constraints; no build step, no paid APIs, no new libraries; TC font
fallbacks; 44px targets, focus rings, reduced-motion kill-switch; dark mode (still available, just
not the default).

## Testing (per CLAUDE.md checklist)

- `node tools/build-preview.js` parses all inline scripts (`new Function()`); preview opens in
  **light** by default with no stored preference.
- Sections render collapsed; tapping one expands only it; counts match; `Uncategorized` last.
- A known lip+cheek tint appears under **both** Lip and Cheek.
- Star toggles persist in the mock and surface in Favorites; note edit round-trips; note glyph
  shows. Add the `favorite` column + `setFavorite`/`setNotes` to the preview mock harness.
- Search collapses sections → flat results across all items; clearing restores sections.
- Dark toggle still works and is remembered; reduced-motion verified.

## Rollout / branching

PR #1 (`seoul-glass-followups`) is open and also edits `index.html` (P5 export). Implement this on
a branch **off `seoul-glass-followups`** (or merge PR #1 to main first, then branch) to avoid
clobbering the P5 / scanner work. One PR for this feature; append a dated entry to
`docs/decisions.md`.

## Out of scope (not now)

Reordering categories by hand; sub-grouping within a giant section (e.g. Cheek 87 by brand);
favorites sync to the Korea Haul; photocard export of a note. Revisit only if she asks.
