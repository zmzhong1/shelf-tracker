# SETUP — Shelf Tracker

Three things live here:
1. **First-time deploy** (manual paste — what she does once).
2. **Push-to-deploy with clasp** (optional — edit from any computer, push with one command).
3. **Multi-user template** (give the app to a friend on her own sheet).

---

## 1. First-time deploy (manual, ~10 min, from HER Google account)

1. Open the spreadsheet → **Extensions → Apps Script**.
2. Replace the default `Code.gs` with [`apps-script/Code.gs`](apps-script/Code.gs). Add an HTML file named exactly **`index`** and paste [`apps-script/index.html`](apps-script/index.html).
3. In the editor, run the **`ensureSchema`** function once (Run ▸ ensureSchema). Authorize when prompted. This writes the 16 column headers and creates the **`haul`** tab — existing rows are untouched.
4. **Deploy → New deployment → Web app** → Execute as **Me** · Who has access **Only myself** → Deploy. Authorize.
5. Open the `/exec` URL on her iPhone in Safari → Share → **Add to Home Screen**. That tile is the app.
6. *(optional)* Weekly digest: **Triggers → Add Trigger → `sendExpiryDigest` → Time-driven → Week timer.** Emails her anything expired or ≤60 days out.

> The `index.html` here is for Apps Script and contains the GAS scriptlet `<?= … ?>`, so it will **not** render if you just double-click it. To preview the UI in a normal browser, run `node tools/build-preview.js` and open `preview.html` (mock data, no Google account needed).

---

## 2. Push-to-deploy with clasp (optional)

Edit `Code.gs` / `index.html` locally (Mac or Windows), commit to git, and push to her live script with one command — no copy-paste.

**One-time:**
```bash
npm install                 # installs clasp locally
npx clasp login             # opens a browser; sign in as the account that owns the script
```
Get the **Script ID**: in the Apps Script editor → **Project Settings (⚙) → IDs → Script ID**. Then:
```bash
cp .clasp.json.example .clasp.json
# edit .clasp.json → paste the Script ID (rootDir is already "apps-script")
```
`.clasp.json` is gitignored (it holds the script ID).

**Every change after that:**
```bash
npm run push                # clasp push  → uploads apps-script/Code.gs + index.html + appsscript.json
npm run open                # opens the script in the editor
npm run deploy              # cuts a new web-app version
```
Only the three files in `apps-script/` are pushed (Code.gs, index.html, appsscript.json). `preview.html` lives outside that folder on purpose, so it never gets pushed.

> First push may warn it will overwrite the manifest — that's `appsscript.json` setting **execute as Me / access Only myself**, which matches step 4 above. If her timezone isn't `America/Los_Angeles`, edit `apps-script/appsscript.json` before pushing.

---

## 3. Multi-user template (give it to a friend)

The app needs **no shared backend** — each person runs their own copy, free, private. Nothing to host or pay for.

**For a brand-new user (blank slate):**
1. Create a **new, empty Google Sheet** (this *is* the template — `ensureSchema` builds the columns on first run).
2. Do **§1 steps 1–5** above in that sheet.
3. On first load the app self-initializes: 16 headers on tab 1, a `haul` tab, zero items. They add or scan their first product and they're live.

**For someone who already has a makeup list:** have them paste their existing rows into tab 1 under the matching headers (or use the **Import** tab), then deploy. The first 7 columns match the original layout; columns 8–16 fill in as they use the app.

**Privacy:** "Only myself" access means each person's `/exec` URL is useless to anyone else — no auth to manage, no data shared between users.

### Column contract (tab 1)
`brand_name, product_name, area_usage, shade_number, shade_name, expiration_date, manufacture_date, opened_date, pao_months, barcode, status, price, purchase_date, image_url, notes, swatch_color`

`shade_number`, `barcode`, and the date columns are stored as **text** (leading zeros and "Jun 10, 2028" formatting survive). Don't reorder columns — append new ones at the end and migrate via `ensureSchema()`.
