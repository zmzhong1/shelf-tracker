# Handoff: Shelf Tracker — "Seoul Glass"

## Overview
**Shelf Tracker** is a personal makeup-inventory app for a single user — a K-beauty collector with 201 logged items across 51 brands (heavily blush). It runs off her Google Sheet and ships as **one HTML file pasted into Google Apps Script**. Three surfaces share one design language, **Seoul Glass** (Toss-clean × Olive-Young density × glass-skin × photocard culture):

1. **Tracker** — the daily iPhone app (added to Home Screen). Tabs: List · Add · Scan · Import, plus Catalog.
2. **Shelf Scanner** — runs inside claude.ai; photographs products, AI reads brand / shade code / Korean date stamps, outputs an editable table to copy into Import.
3. **Catalog** — browse mode: brand-grouped swatch grid, insights, Korea-Haul checklist.

The top job to protect above all: **in a Korean store, answer "do I already own this shade?" in under 5 seconds** (the "money path").

## About the design files
The files in this bundle are **design references created in HTML** — working prototypes that show the intended look and behavior. They are **not production code to ship as-is**. The task is to **recreate these designs in the target environment**. Since the stated implementation target is a **single self-contained HTML file for Google Apps Script (no build step, no framework, CSS-only animation, system/CDN fonts only)**, the prototype's own stack (vanilla HTML/CSS/JS) is already the right target — port it into the Apps Script `index.html`, wiring the data layer to the live Google Sheet instead of the mock `DATA` array. Do **not** introduce React/Vue/a bundler; that would violate the engineering constraints.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, shadows, and interactions are final. Recreate the UI faithfully — exact hex values and token names are in `seoul-glass.css` and documented in `Shelf Tracker Spec.html`.

## Screens / views

### Tracker — List ("Shelf")
- **Purpose:** find any item fast; see expiry at a glance; mark Opened / Retire.
- **Layout:** single column. Header (title "Shelf" + count) → glass **search pill** → horizontal **filter chips** (All / Cheek / Lip / Expiring) → **rows** sorted by expiry (expired → soon → fresh → retired). Floating tab bar overlays the bottom.
- **Row (`.row`):** 30px dot swatch · brand (bold) + product name (ellipsizes) · mono shade code (**never truncates**) + shade/中文 · status badge. Long-press (420ms) reveals **Opened today / Retire** (both ≥44px). Retired items stay at 0.48 opacity (history, not trash). Tap a row → detail.
- **Search:** live filter on every keystroke across brand + name + 中文 + code + shade; no submit.

### Tracker — Detail (owned card)
- **Purpose:** the 5-second in-store answer.
- **Layout:** full-bleed **swatch hero** (16:10) with brand, giant mono code, status glass-badge, back button → green **"You already own this shade"** ribbon → key/value rows (shade, code, area, added/opened, expiry basis) → ghost "Back" + primary "Opened today".

### Tracker — Add
- **Purpose:** log a purchase in < 30s, one-handed.
- **Layout:** Brand field (with **autocomplete** from her own 51 brands; own-history rows first, "add as new brand" last) · Product · Shade code (mono) + Shade name · Area category pills · Use-by 까지 / Mfg 제조 / Opened (all optional) · helper note · sticky primary **Save**.
- **States:** empty · autocomplete open · **duplicate sheet** (saving an owned brand+code opens a bottom sheet "You own this — [owned row], added [date] · Cancel / Save anyway"; fires on Save, never mid-typing) · saved **toast** (form resets, brand kept, "Add another" action).

### Tracker — Scan
- **Purpose:** barcode → prefill.
- **Layout:** camera **viewfinder** with corner guides + 70px **shutter** in thumb zone → 1.3s "Reading barcode…" spinner → result.
- **States:** **database hit** (green; prefills brand+product only, cursor lands on the shade field she must confirm) · **database miss** (`Not in the database — normal for K-beauty`; neutral, **NOT an error styling** — same form as Add with the barcode attached). Both → Save → toast → List.

### Tracker — Import
- **Purpose:** paste rows extracted by the Scanner.
- **Layout:** paste area → "Paste sample" → **preview** using the same row component, each row flagged **new** or **skip dupe** (matched on code) before import → Clear / "Import N · skip M".

### Catalog (Grid / Insights / Korea Haul — segmented)
- **Grid:** brand = section with sticky header + count; 2-up **photocards** (`.pc`). Filter chips for area/expiry.
- **Insights:** stat cards (expired / ≤90d / on-shelf) · "Expiring next" panel · "Collection gaps" spectrum strip (owned shades; gaps shown hollow).
- **Korea Haul:** checkable shopping rows + **sticky ₩ subtotal** that updates live (spent ↑ / left ↓ as items are checked in-store). One row warns "check shade vs the 5 you own".

### Shelf Scanner (separate surface — runs in claude.ai)
- **Purpose:** review AI readings before trusting them.
- **Layout:** window chrome → **photo queue** (states: read ✓ / reading ◌ / retake ✗ / add +) → amber **"Review before trusting"** banner → **editable results table** (checkbox · photo · Brand · Product · Shade · Use-by 까지 · Mfg 제조 · Confidence). **Low-confidence cells are tinted red + "?"**; editing one clears the flag. Footer: "Re-read photos" + **"Copy N rows → Import"** (TSV in the exact column order Import expects). Reads `까지` = use-by, `제조` = mfg; calls out common emboss misreads (0↔O, 1↔l).

## Interactions & behavior
Full per-animation spec with **reduced-motion** fallbacks is in **`Shelf Tracker Spec.html` → section 03**. Summary:
- Two easings: `--sg-spring` cubic-bezier(.34,1.56,.64,1) for presses/entries; `--sg-ease` cubic-bezier(.22,.61,.36,1) for the rest.
- Signature **gloss sweep** on the active swatch card (4.6s loop) — wrapped in `@media (prefers-reduced-motion: no-preference)`.
- Screen change: fade + 8px rise .26s. Tap press: scale .94–.975 spring. Bottom sheet: spring up .34s + blur scrim. Toast: rise+fade .3s, auto-dismiss 2.6s. Mode switch: .35s cross-fade.
- **Expiry badge logic is fixed (do not redesign the rule, only its presentation):** earliest of printed date / opened+PAO / mfg+36mo "est.". Tones: fresh `#3E7D5C`, soon `#A85F12`, expired `#B8323E`.

## State management
- **Source of truth:** the Google Sheet. Replace the mock `DATA` array in `app.js` with Sheet rows (Apps Script `google.script.run` or an inlined JSON bootstrap).
- **Per item:** brand, name, 中文/shade, code, area, status (derived from expiry rule), badge label, dates (added/opened/use-by/mfg), and a **color triplet `--s1/--s2/--sdeep`** for the smear (see flag below).
- **Client state:** active tab, search query, active filter chip, Catalog sub-view, dark mode, current screen (the prototype persists screen + mode in `localStorage` under `st.screen` / `st.cat` / `st.dark`).
- **Flag — new data field:** the smear needs a per-item color triplet the Sheet does not have yet. Add a hex column, or derive a shade color at entry/scan time. Card text legibility is guaranteed by the scrim, so any color is safe. **Do not invent other new fields** — if a screen seems to need one, raise it as a note.

## Design tokens
All tokens are CSS custom properties in **`hifi/seoul-glass.css`** (light) re-bound under **`.sg-dark`**. Key values:
- **Base/ink:** pearl `#F7F4F5`, pearl-2 `#EFEAEC`, ink `#1A1518`, ink-70/45/12, hairline.
- **Glass:** `rgba(255,255,255,.72)` + `blur(20px)` + inner highlight `inset 0 1px 0 rgba(255,255,255,.9)` + 1px edge.
- **Accent (sparse):** `#FF4D62` (ink `#E11D38`).
- **Iridescent (hero/active only):** `linear-gradient(118deg,#9DB8FF,#FFB7C9)`.
- **Status:** fresh `#3E7D5C`, soon `#A85F12`, expired `#B8323E` (+ 10% tint backgrounds).
- **Radii:** card 20px, tile 16px, pill 999px. **Shadows:** card & float (see file).
- **Type:** `Pretendard` 500/700/800 with **`"PingFang TC","Noto Sans TC"` fallback** (bilingual); **`Spline Sans Mono`** for shade codes, dates, counts.

## Assets
- **Fonts (CDN):** Pretendard (`cdn.jsdelivr.net/gh/orioncactus/pretendard`), Spline Sans Mono (Google Fonts). No other web assets.
- **Icons:** inline SVG (stroke), defined in `app.js` (`I` map) and the Scanner file. No icon library.
- **Imagery:** none required — the **swatch smear** is generated from the color triplet via layered CSS gradients (no product photos needed). The Scanner photo thumbnails are CSS placeholders; in production they'd be the user's captured images.

## Files in this bundle
| File | What it is |
|---|---|
| `Shelf Tracker.html` | **Primary** — full clickable Tracker prototype (List/Add/Scan/Import/Catalog/Detail + money-path autoplay). Light/dark. |
| `Shelf Scanner.html` | The claude.ai review surface (photo queue + editable results table). |
| `Shelf Tracker Spec.html` | **Read this** — component inventory, final tokens, motion spec w/ reduced-motion. |
| `Shelf Tracker Signature System.html` | The approved signature system (card C × row A × tab bar B) + swatch anatomy. |
| `Shelf Tracker Wireframes.html` | Low-fi exploration (structure/flow reference). |
| `hifi/seoul-glass.css` | **Token layer** — all CSS variables, light + `.sg-dark`. |
| `hifi/components.css` | All component classes. |
| `hifi/app.js` | Tracker behavior + mock `DATA` (replace with Sheet data). |
| `design-canvas.jsx` | Canvas harness used only by the wireframe file. |

## Implementation notes
- **No build step.** Inline `seoul-glass.css`, `components.css`, and `app.js` into the single Apps Script `index.html` (or keep as `<style>`/`<script>` blocks). CSS-only animation; CDN/system fonts only.
- **One-handed iPhone:** single column, bottom nav, ≥44px targets, thumb-zone primary actions, visible focus.
- **Bilingual & dense:** rows must survive long strings (`C088-18`, `提亮腮紅澎澎餅`) — the shade code is `flex:none` and never truncates; names ellipsize.
- **Out of scope:** logo/branding beyond the wordmark, marketing pages, Android patterns, the Sheet itself.
