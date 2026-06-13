# KICKOFF_PROMPT.md — paste this as your first Claude Code message

---

Read CLAUDE.md fully, then inspect every file in this repo before writing anything.

Context: this repo was scaffolded in a Claude.ai chat and works end-to-end (GAS tracker bound to a
Google Sheet, Claude-vision scanner artifact, static catalog page). Your job is iteration, not rebuild.

Session 1 scope — exactly P1 from the CLAUDE.md backlog:

Reskin `apps-script/index.html` to the **Seoul Glass** design system. Token precedence: if a Claude
Design handoff bundle exists in `docs/design/`, follow it literally; otherwise follow the tokens in
CLAUDE.md. Do not invent a different palette or fonts either way. Functionality is frozen: same four views,
same `google.script.run` calls, same field IDs and server contract with `Code.gs`. The result must still
paste-run inside Google Apps Script HtmlService (no build step, no modules, `<base target="_top">`,
scriptlet `<?= JSON.stringify(prefill) ?>` preserved).

Definition of done:
1. Bottom tab bar (Add · Scan · Import · List), thumb-reachable, iridescent active pill.
2. Glass surfaces with blur + inner highlight; photocard-proportioned list rows; swatch-smear accents.
3. Gloss-sweep tap micro-interaction; stagger-fade list; all motion disabled under prefers-reduced-motion.
4. Dark mode via prefers-color-scheme.
5. 44px touch targets, visible focus rings, TC font fallbacks intact.
6. All script blocks pass `new Function()` syntax check; commit on a branch `p1-seoul-glass` with a PR
   description that includes before/after notes and anything you deliberately did NOT change.
7. Append a dated entry to docs/decisions.md (create it) recording the design tokens as adopted.

Do not touch Code.gs, the scanner, or the catalog this session. If you believe a P1 change requires a
backend change, stop and ask instead of doing it.

When P1 is merged I will say "go P2" — do not start P2 speculatively.

---

## Spare prompts for later sessions (use verbatim when ready)

**P2:** "Go P2 per CLAUDE.md: merge the catalog into the Tracker as a 'Shelf' tab fed by getBootstrap(),
port brand grouping/filters/insights from makeup-shelf-check.html, move Korea Haul into a 'Haul' tab with
checkbox state persisted to a `haul` sheet tab via new Code.gs functions (string-safe writes). Keep the
standalone catalog file working until parity is proven, then mark it deprecated in README."

**P3:** "Go P3: duplicate guard. On Add save and on each Import row, check brand+product+shade_number
(case-insensitive, trimmed) against existing rows client-side from bootstrap data; show a warning sheet
('You own this — added <date>') with Save Anyway / Cancel. No backend changes unless bootstrap lacks a field."

**Brainstorm session:** "Read CLAUDE.md. Propose 5 feature ideas NOT in the backlog that fit Seoul Glass,
GAS-free-tier constraints, and a single-user makeup tracker. For each: one-line pitch, effort (S/M/L),
which hard rule it risks. No code."
