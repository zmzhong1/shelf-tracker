# Shelf Tracker

Personal makeup inventory system. Google Sheet = source of truth. Two pieces:

1. **Tracker web app** (Google Apps Script, bound to the Sheet) — add items, scan barcodes from a photo, bulk-import, list with live expiry status, weekly email digest. Free forever, no server.
2. **Shelf Scanner** (Claude artifact) — photograph products; Claude vision extracts brand / shade / 까지 expiry stamps into rows; copy-paste into the tracker's Import tab. Runs keyless inside any free claude.ai account.

The earlier **Shelf Check** catalog (`makeup-shelf-check.html`) stays as the browse/insights/Korea-haul view.

```
photo of product ──► Shelf Scanner (Claude vision) ──copy TSV──► Tracker Import tab ──► Sheet
photo of barcode ──► Tracker Scan tab ─► html5-qrcode/BarcodeDetector ─► Open Beauty Facts prefill ─► Sheet
manual entry     ──► Tracker Add tab (autocomplete from her own history) ────────────► Sheet
```

## Sheet schema (tab 1, row 1)

Her original 7 columns, plus 9 new — `ensureSchema()` writes headers automatically on first load, existing rows untouched:

| # | column | notes |
|---|--------|-------|
| 1–7 | brand_name … manufacture_date | unchanged |
| 8 | opened_date | tap "Opened today" in List view |
| 9 | pao_months | period-after-opening (6/9/12/…); **effective expiry = earliest of** printed date, opened+PAO, mfg+36 mo (est.) |
| 10 | barcode | stored as text |
| 11 | status | `active` / `retired` |
| 12 | price | |
| 13 | purchase_date | |
| 14 | image_url | Catalog shows real photos if filled |
| 15 | notes | |
| 16 | swatch_color | hex for the swatch smear; auto-filled on Add, else derived client-side |

A separate **`haul` tab** (created on first use) backs the Korea Haul shopping list: `brand, product, shade_number, shade_name, krw_price, note, checked, created_date`.

`shade_number`, `barcode`, and all date columns are forced to plain-text format — leading zeros survive; dates stay in her "Jun 10, 2028" style.

## Setup (she does this once, ~10 min, from HER Google account)

1. Open the spreadsheet → **Extensions → Apps Script**.
2. Replace the default code with `apps-script/Code.gs`. Add an HTML file named exactly `index`, paste `apps-script/index.html`.
3. **Deploy → New deployment → Web app** → Execute as: **Me** · Who has access: **Only myself**. Authorize when prompted.
4. Open the `/exec` URL on her iPhone in Safari → Share → **Add to Home Screen**. That's the "app" — no App Store, no fee.
5. Weekly digest (optional): in Apps Script, left sidebar **Triggers → Add Trigger** → function `sendExpiryDigest` → Time-driven → Week timer. Emails her anything expired or ≤60 days out.

### Scanner setup
Open `scanner/shelf-scanner.html` as a Claude artifact (Ming publishes it; she opens the link signed into her **free** Claude account). Photograph → review rows → **Copy rows** → paste into the tracker's **Import** tab. Vision calls draw on her account's free-tier quota — fine for batch sessions, not for 200 items in one sitting.

## Decisions & limits (read once)

- **Why the Sheet wins:** she already lives there, it's exportable forever, and multi-user later is trivial — each new person copies the spreadsheet template and runs the same 5 setup steps. No shared backend to build or pay for.
- **Barcodes solve identity, not dates.** No database on earth has her tube's expiry stamp; dates come from the date picker or the Claude scanner.
- **Open Beauty Facts** (free, keyless) prefills on barcode hits, but K-beauty per-shade coverage is thin — expect misses. Every miss she types once; her own sheet then autocompletes it forever, which is how "complete for her brands" actually happens.
- **No push notifications** — GAS can't. The weekly email digest is the substitute.
- **Privacy:** "Only myself" access means the web app URL is useless to anyone else. If Ming deploys from his account instead (he has edit access), set access to "Anyone with Google account" and accept that the URL is the only gate — prefer her deploying.
- iPhone note: barcode decoding uses html5-qrcode on the captured photo (Safari has no native BarcodeDetector). Flat, well-lit, frame-filling photos decode best; curved tubes sometimes need two tries.

## Repo layout

```
shelf-tracker/
├── README.md  ·  SETUP.md  ·  package.json
├── apps-script/             # ← clasp rootDir (only these push to GAS)
│   ├── Code.gs              # backend (bound script): items + haul tab
│   ├── index.html           # Seoul Glass tracker UI (List/Add/Scan/Import/Catalog/Detail)
│   └── appsscript.json      # GAS manifest (V8, web app: execute as Me / access Only myself)
├── tools/
│   └── build-preview.js     # syntax-checks index.html + builds preview.html with mock data
├── scanner/
│   └── shelf-scanner.html   # Claude-vision artifact (Seoul Glass)
├── preview.html             # generated browser preview (gitignored — regenerate any time)
└── makeup-shelf-check.html  # original catalog — superseded by the in-app Catalog tab
```

Preview the UI in a browser without deploying: `node tools/build-preview.js` (or `npm run preview`), then open `preview.html` (or serve the folder and visit `/preview.html`). It runs the real UI against her inventory snapshot via a mock `google.script.run`; the shipped `index.html` is never modified. Push-to-deploy with clasp is documented in [`SETUP.md`](SETUP.md).

GitHub-backed via [clasp](https://github.com/google/clasp) if you want push-to-deploy: `clasp clone <scriptId>` after step 2, commit this repo, `clasp push` on changes.

## Roadmap

- ✅ v1 (2026-06-13) — Seoul Glass reskin; Catalog/Insights/Korea-Haul merged into the Tracker; duplicate guard; swatch smears; photocard PNG export; Scanner reskinned to Seoul Glass; GitHub-backed + clasp; multi-user `SETUP.md`. **P1–P7 addressed** — see `docs/decisions.md`.
- v1.2 — deprecate `makeup-shelf-check.html` once Catalog-tab parity is confirmed in daily use.
- v1.3 — duplicate-guard tuning + photocard share sheet on iOS (Web Share API where available).
