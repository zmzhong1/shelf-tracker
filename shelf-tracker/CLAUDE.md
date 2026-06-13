# CLAUDE.md — Shelf Tracker

Personal makeup inventory system for a friend (single user now, template-copy multi-user later).
**Source of truth: her Google Sheet.** Free forever. No paid APIs, no Apple developer account, no servers.

## Architecture (do not restructure without a decisions.md entry)

```
shelf-tracker/
├── apps-script/Code.gs        # GAS backend, bound to her sheet (deploy via clasp)
├── apps-script/index.html     # Tracker web app UI (Add / Scan / Import / List)
├── scanner/shelf-scanner.html # Claude-vision artifact — LIVES IN CLAUDE.AI ONLY
├── makeup-shelf-check.html    # Catalog: shelf browse / insights / Korea haul
└── docs/decisions.md          # log every architectural/UX decision, dated
```

- **Tracker** = system of record. Runs as GAS web app (`/exec` URL → iPhone Add to Home Screen).
- **Scanner** = photo → Claude vision → TSV rows → pasted into Tracker Import tab. The keyless
  Anthropic API (`fetch https://api.anthropic.com/v1/messages`, no key, model
  `claude-sonnet-4-20250514`, `max_tokens: 1000`) ONLY works inside a claude.ai artifact.
  Never move this to GitHub Pages or the GAS app. After edits, Ming re-publishes the artifact manually.
- **Catalog** = static page; v1.1 makes it read the sheet's publish-to-web CSV.

## Hard rules (violating these breaks her data)

1. `shade_number`, `barcode`, SKU-like codes: **always strings, leading zeros preserved.**
   Sheet writes must `setNumberFormat('@')` on TEXT_COLS [4,6,7,8,10,13] BEFORE `setValues`. Never `appendRow`.
2. Dates stored as **text** in `MMM d, yyyy` ("Jun 10, 2028") — matches her existing 201 rows.
3. Column order is a contract (16 cols, see Code.gs HEADERS — col 16 `swatch_color` added 2026-06-13). Add columns only at the end + migrate via `ensureSchema()`. The Korea Haul lives in a separate `haul` tab (HAUL_HEADERS) created on first use.
4. Effective expiry = **earliest of**: printed expiration, opened_date + pao_months, mfg + 36mo (flag "est."). Keep this logic identical in Tracker and Catalog.
5. Free-only: Open Beauty Facts (keyless, set User-Agent) for barcode lookup; html5-qrcode + native
   BarcodeDetector for decoding (iOS Safari has NO BarcodeDetector — file-photo path, never getUserMedia
   streams inside the GAS iframe). Verify any external API/library version before use.
6. GAS constraints: HtmlService IFRAME sandbox, `<base target="_top">`, scriptlets `<?= ?>` for server→client
   data, `google.script.run` with both success AND failure handlers. No build step — files must paste-run.
7. GitHub-backed: every change lands as a commit/PR. Use clasp (`clasp push`) for GAS deploys; never edit
   in the online editor only.
8. Her sheet contains Traditional Chinese product names — all UI fonts need TC fallbacks; never "translate away" her data.

## Design system: "Seoul Glass" (the futuristic-Korean direction — follow exactly)

Inspiration: Toss-app cleanliness × Olive Young product density × K-beauty "glass skin" × photocard culture.
Futuristic = dewy, luminous, precise. NOT cyberpunk neon-on-black, NOT generic purple AI gradients.

**Tokens**
- Type: `Pretendard` (CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css`),
  weights 500/700/800, tight letter-spacing on display; numerals/codes in `Spline Sans Mono`.
  Stack fallback: `"Pretendard","PingFang TC","Noto Sans TC",sans-serif`.
- Palette: base `#F7F4F5` (pearl), surface = translucent glass `rgba(255,255,255,.72)` + `backdrop-filter: blur(20px)`
  + 1px inner highlight; ink `#1A1518`; accent **tint-red `#FF4D62`** (juicy K-tint, used sparingly);
  secondary glow `#9DB8FF→#FFB7C9` iridescent gradient for hero/active states only; status colors unchanged
  (expired `#B8323E`, soon `#A85F12`, ok `#3E7D5C`).
- Shape: 16–20px radii, pill controls, cards float on soft `0 8px 30px rgba(26,21,24,.08)`.
- Signature: the **swatch smear** stays (organic blob gradient per shade) — evolve it with a glossy
  highlight sweep on tap (the "dewy" moment). Product cards proportioned like photocards (3:4-ish).
- Navigation: bottom tab bar (Add · Scan · Shelf · Haul), thumb-reachable, active tab gets the iridescent pill.
- Motion: spring-feel transitions (CSS only), tap = scale .97 + gloss sweep, list items stagger-fade 20ms.
  `prefers-reduced-motion` kills all of it. 44px minimum touch targets. Visible focus rings.
- Dark mode: `prefers-color-scheme` — ink base `#171215`, glass `rgba(40,32,36,.6)`, same accent.
- Copy register: short, warm, sentence case. Bilingual labels EN with 繁中 sublabels where space allows
  (her data is EN/繁中) — e.g. "Expiry 까지" stays since stamps are Korean.

## Backlog (work top-down; one PR per item; update docs/decisions.md)

- ✅ **P1 — Reskin Tracker UI to Seoul Glass** (2026-06-13). Full design from the handoff bundle, wired to live backend, paste-runs in GAS.
- ✅ **P2 — Merge Catalog into Tracker** (2026-06-13). Catalog tab (Grid/Insights) reads `getBootstrap()`; Korea Haul is its own tab persisted to a `haul` sheet tab via new Code.gs functions. `makeup-shelf-check.html` kept until parity confirmed, then deprecate.
- ✅ **P3 — Duplicate guard on add/import** (2026-06-13). Client-side brand+shade_number (fallback brand+product+shade_name); "You own this … Save anyway / Cancel" bottom sheet.
- ✅ **P4 — Search-first home** (2026-06-13). List opens on a glass search pill above filter chips.
- ✅ **P6 — Haul budget** (2026-06-13). Live ₩ subtotal (spent / left) over the persisted haul tab. (FX-rate field not added — flagged as out-of-scope unless she asks.)
- **P5 — Photocard export:** render any product card to PNG (canvas) for sharing. *(open)*
- **P7 — Multi-user template:** blank-sheet template + SETUP.md so friends copy & self-deploy. *(open)*
- **Follow-up — reskin `scanner/shelf-scanner.html` to Seoul Glass** (deferred from the 2026-06-13 session; Tracker-only by request).

## Testing checklist (every PR)

- `node -e "new Function(<extracted JS>)"` parses all script blocks (scriptlet replaced with `"{}"`).
- `clasp push` → open `/exec` on iPhone Safari: add an item with shade `01` → confirm sheet cell shows `01` (text).
- Scan tab: photo of any EAN-13 decodes; OBF miss path shows the friendly fallback.
- Reduced-motion and dark-mode media queries verified.
- No paid API, no key, no localStorage in the scanner artifact.
