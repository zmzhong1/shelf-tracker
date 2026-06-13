# DESIGN_BRIEF.md — paste into Claude Design (run BEFORE Claude Code P1)

Setup first: point Claude Design at this repo (or upload `apps-script/index.html`,
`makeup-shelf-check.html`, and `scanner/shelf-scanner.html`) so the design system seeds from real code,
not from imagination. When finished, export the **Claude Code handoff bundle** — that bundle lands in
`docs/design/` and supersedes the Seoul Glass tokens in CLAUDE.md wherever they differ.

---

## The full picture

**Product:** Shelf Tracker — a personal makeup-inventory app for one user (my friend), built on her
Google Sheet. She owns 201 logged items across 51 brands, heavily K-beauty (FWEE, BBIA, Dasique,
Rom&nd, Hince…), 87 of them blush. Three surfaces share one design language:

1. **Tracker** (the daily app, iPhone, added to Home Screen): tabs Add · Scan · Import · List.
   Add = form with autocomplete from her own history. Scan = photograph a barcode → free database
   prefill. Import = paste rows extracted elsewhere. List = every item with a live expiry badge,
   "Opened today" and "Retire" actions.
2. **Shelf Scanner** (runs inside claude.ai): photograph products → AI reads brand / shade code /
   Korean date stamps (까지 = use-by, 제조 = manufactured) → editable row table → copy to Import.
3. **Catalog** (browse mode): brand-grouped grid with shade-swatch cards, area/expiry filters,
   insights (expired counts, collection gaps), and a checkable Korea shopping list.

**User & jobs:** a collector, not a developer. Top jobs, in order: ① in a Korean store, answer
"do I already own this shade?" in under 5 seconds; ② log a new purchase in under 30 seconds, one-handed;
③ know what's expiring before it turns. She reads English and Traditional Chinese; product data mixes
both (e.g. 水霧交融澎潤腮紅膏 next to "Pudding Pot PK03").

**Why this design matters:** v0 works but looks utilitarian. The bar is an app she *prefers* over the
pretty commercial trackers — something that feels like Korean beauty-tech, not like a spreadsheet form.

## Design direction: "Seoul Glass" — futuristic Korean, defined precisely

Toss-app cleanliness × Olive Young product density × K-beauty "glass skin" × photocard culture.
Futuristic means dewy, luminous, precise. Explicitly NOT: cyberpunk neon-on-black, generic purple
AI gradients, cream-paper-serif editorial.

Starting tokens (refine, don't replace wholesale):
- Type: Pretendard 500/700/800 (display tight), Spline Sans Mono for shade codes & dates;
  fallback stack must include "PingFang TC","Noto Sans TC".
- Color: pearl base `#F7F4F5`; glass surfaces `rgba(255,255,255,.72)` with 20px blur + 1px inner
  highlight; ink `#1A1518`; one accent, tint-red `#FF4D62`, used sparingly; iridescent `#9DB8FF→#FFB7C9`
  reserved for hero/active states; status colors expired `#B8323E` / soon `#A85F12` / fresh `#3E7D5C`.
- Shape & motion: 16–20px radii, pill controls, bottom tab bar, spring-feel transitions, tap = gloss
  sweep (the "dewy" moment). Dark mode required.
- **Signature element (keep and elevate):** the swatch smear — each product's shade rendered as an
  organic gradient blob, like a swatch on the back of a hand. Product cards lean photocard (≈3:4).

## What to design (deliverables)

A. **Three directional explorations** of the signature system only — swatch card + list row + tab bar —
   pushing "futuristic" different amounts. I pick one; everything else follows it.
B. **Tracker, all four tabs**, iPhone-width, light + dark: including these exact states —
   Add (empty, brand-autocomplete open, saved-toast), Scan (photo taken, database hit, database miss
   — the miss is common for K-beauty and must feel fine, not like an error), Import (pasted preview),
   List (search active, expired item, item ≤90 days, retired item at reduced emphasis,
   **duplicate warning sheet**: "You own this — Pure Cake, added May 2028 · Save anyway / Cancel").
C. **Catalog**: brand section + filter chips + one insights screen + the Korea Haul checklist with a
   KRW running subtotal.
D. **Scanner**: photo queue with reading/success/fail states and the editable results table; must read
   as "review before trusting" — AI can misread embossed stamps.
E. **Component inventory + final tokens** (CSS variable names), and an interaction spec one-liner per
   micro-animation including its reduced-motion behavior.
F. **Clickable prototype** of the money path: open app → search "Pure Cake" → see owned card →
   scan a new product → save. This is the 5-second in-store job; design it first, judge everything by it.
G. Export the **handoff bundle for Claude Code** as the final step.

## Engineering constraints design must respect (non-negotiable)

- Implementation target is a single HTML file pasted into Google Apps Script: no build step, no
  component framework, CSS-only animation, system/CDN fonts only. If a design choice needs a build
  pipeline, it's wrong.
- One-handed iPhone use: single column, bottom navigation, 44px minimum targets, thumb-zone primary
  actions, visible focus states.
- Data is dense and bilingual: shade codes like "C088-18", names like 提亮腮紅澎澎餅 — list rows must
  survive long strings without truncating the code (the code is the identity).
- Expiry badge logic is fixed (earliest of printed date / opened+PAO / mfg+36mo "est.") — design its
  presentation, not its rules.
- Don't invent new features or data fields; if a screen begs for one, flag it as a note instead.

## Out of scope

Logo/branding beyond the wordmark, marketing pages, Android-specific patterns, the Google Sheet itself.
