/**
 * Shelf Tracker — Apps Script backend
 * Bind this to HER spreadsheet: Extensions → Apps Script → paste Code.gs + index.html
 * Deploy → New deployment → Web app → Execute as: Me · Access: Only myself
 *
 * Column contract (tab 1, row 1). First 7 match her existing sheet; 8–15 are added by ensureSchema().
 */
const HEADERS = [
  'brand_name','product_name','area_usage','shade_number','shade_name',
  'expiration_date','manufacture_date','opened_date','pao_months','barcode',
  'status','price','purchase_date','image_url','notes','swatch_color'
];
// Columns that must NEVER be auto-coerced by Sheets (leading zeros, text dates):
const TEXT_COLS = [4,6,7,8,10,13]; // shade_number, exp, mfg, opened, barcode, purchase_date
const DATE_FMT = 'MMM d, yyyy';

// Korea Haul shopping list — its own tab, created on demand.
const HAUL_HEADERS = ['brand','product','shade_number','shade_name','krw_price','note','checked','created_date'];
const HAUL_TEXT_COLS = [3]; // shade_number

function doGet(e) {
  const t = HtmlService.createTemplateFromFile('index');
  t.prefill = JSON.stringify((e && e.parameter) || {});
  return t.evaluate()
    .setTitle('Shelf Tracker')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function sheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]; // tab 1 = collection
}

/** One-time + idempotent: writes the headers (preserving her data) and text-formats key columns. */
function ensureSchema() {
  const sh = sheet_();
  if (sh.getMaxColumns() < HEADERS.length) sh.insertColumnsAfter(sh.getMaxColumns(), HEADERS.length - sh.getMaxColumns());
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  const rows = Math.max(sh.getMaxRows() - 1, 1);
  TEXT_COLS.forEach(c => sh.getRange(2, c, rows, 1).setNumberFormat('@'));
  return 'schema ok';
}

function getBootstrap() {
  ensureSchema();
  const sh = sheet_();
  const last = sh.getLastRow();
  const data = last > 1 ? sh.getRange(2, 1, last - 1, HEADERS.length).getDisplayValues() : [];
  const rows = [];
  const brands = {}, products = {}; // products["brand"] = Set of product names
  data.forEach((r, i) => {
    const [b,p,a,sn,s,exp,mfg,opened,pao,barcode,status,price,pd,img,notes,color] = r;
    if (!(b||p||s||sn)) return;
    rows.push({ row: i + 2, b:b.trim(), p:p.trim(), a:a.trim(), sn:String(sn), s:s.trim(),
                exp, mfg, opened, pao, barcode:String(barcode), status: status || 'active',
                price, pd, img, notes, color:(color||'').trim() });
    if (b.trim()) {
      brands[b.trim()] = true;
      if (p.trim()) (products[b.trim()] = products[b.trim()] || {})[p.trim()] = true;
    }
  });
  return {
    rows: rows,
    brands: Object.keys(brands).sort((x,y)=>x.localeCompare(y,undefined,{sensitivity:'base'})),
    products: Object.keys(products).reduce((o,k)=>{o[k]=Object.keys(products[k]).sort();return o;},{}),
    count: rows.length
  };
}

/** String-safe single append. item = object keyed by HEADERS names. */
function addItem(item) {
  const sh = sheet_();
  const row = sh.getLastRow() + 1;
  const vals = HEADERS.map(h => String(item[h] == null ? '' : item[h]));
  if (!vals[10]) vals[10] = 'active'; // status default
  TEXT_COLS.forEach(c => sh.getRange(row, c).setNumberFormat('@'));
  sh.getRange(row, 1, 1, HEADERS.length).setValues([vals]);
  return { row: row, count: sh.getLastRow() - 1 };
}

/** Bulk TSV import (rows of up to 15 tab-separated cols, no header line). */
function bulkImport(tsv) {
  const lines = String(tsv).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { added: 0 };
  const block = lines.map(l => {
    const c = l.split('\t').map(x => x.trim());
    while (c.length < HEADERS.length) c.push('');
    if (!c[10]) c[10] = 'active';
    return c.slice(0, HEADERS.length).map(String);
  });
  const sh = sheet_();
  const start = sh.getLastRow() + 1;
  TEXT_COLS.forEach(col => sh.getRange(start, col, block.length, 1).setNumberFormat('@'));
  sh.getRange(start, 1, block.length, HEADERS.length).setValues(block);
  return { added: block.length };
}

/** Open Beauty/Food Facts universal barcode lookup — free, no key. */
function lookupBarcode(code) {
  code = String(code).replace(/\D/g, '');
  if (!code) return { found: false };
  try {
    const url = 'https://world.openfoodfacts.org/api/v2/product/' + encodeURIComponent(code) +
                '?product_type=all&fields=brands,product_name,image_front_url';
    const res = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true, followRedirects: true,
      headers: { 'User-Agent': 'ShelfTracker/1.0 (personal inventory; Apps Script)' }
    });
    if (res.getResponseCode() !== 200) return { found: false };
    const j = JSON.parse(res.getContentText());
    if (!j.product) return { found: false };
    return { found: true, brand: j.product.brands || '', product: j.product.product_name || '',
             image: j.product.image_front_url || '' };
  } catch (e) { return { found: false, error: String(e) }; }
}

function markOpened(row) {
  const sh = sheet_();
  if (row < 2 || row > sh.getLastRow()) throw new Error('bad row');
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), DATE_FMT);
  sh.getRange(row, 8).setNumberFormat('@').setValue(today);
  return today;
}

function setStatus(row, status) {
  const sh = sheet_();
  if (row < 2 || row > sh.getLastRow()) throw new Error('bad row');
  sh.getRange(row, 11).setValue(status === 'retired' ? 'retired' : 'active');
  return status;
}

/* ---------- Korea Haul (separate 'haul' tab, created on first use) ---------- */
function haulSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('haul');
  if (!sh) {
    sh = ss.insertSheet('haul');
    sh.getRange(1, 1, 1, HAUL_HEADERS.length).setValues([HAUL_HEADERS]);
  }
  return sh;
}

function getHaul() {
  const sh = haulSheet_();
  const last = sh.getLastRow();
  const data = last > 1 ? sh.getRange(2, 1, last - 1, HAUL_HEADERS.length).getDisplayValues() : [];
  const rows = [];
  data.forEach((r, i) => {
    const [brand, product, sn, shade, krw, note, checked] = r;
    if (!(brand || product || shade || sn)) return;
    rows.push({ row: i + 2, brand: brand.trim(), product: product.trim(), sn: String(sn),
                shade: shade.trim(), krw: Number(String(krw).replace(/[^0-9.]/g, '')) || 0,
                note: note.trim(), checked: checked === 'yes' });
  });
  return rows;
}

/** String-safe append to the haul tab. item keyed by HAUL_HEADERS names. */
function addHaulItem(item) {
  const sh = haulSheet_();
  const row = sh.getLastRow() + 1;
  const vals = HAUL_HEADERS.map(h => String(item[h] == null ? '' : item[h]));
  if (!vals[7]) vals[7] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), DATE_FMT);
  HAUL_TEXT_COLS.forEach(c => sh.getRange(row, c).setNumberFormat('@'));
  sh.getRange(row, 1, 1, HAUL_HEADERS.length).setValues([vals]);
  return { row: row };
}

function setHaulChecked(row, checked) {
  const sh = haulSheet_();
  if (row < 2 || row > sh.getLastRow()) throw new Error('bad row');
  sh.getRange(row, 7).setValue(checked ? 'yes' : '');
  return checked;
}

function removeHaulItem(row) {
  const sh = haulSheet_();
  if (row < 2 || row > sh.getLastRow()) throw new Error('bad row');
  sh.deleteRow(row);
  return true;
}

/**
 * Weekly email digest of expired / ≤60-day items.
 * Setup once: Apps Script → Triggers → add → sendExpiryDigest → Time-driven → Week timer.
 * Effective expiry = earliest of printed date, opened_date + pao_months, mfg + 36mo (est).
 */
function sendExpiryDigest() {
  const boot = getBootstrap();
  const now = new Date(), DAY = 864e5;
  const eff = it => {
    const ds = [];
    if (it.exp) { const d = new Date(it.exp); if (!isNaN(d)) ds.push(d); }
    if (it.opened && it.pao) { const d = new Date(it.opened); if (!isNaN(d)) { d.setMonth(d.getMonth() + Number(it.pao)); ds.push(d); } }
    if (!ds.length && it.mfg) { const d = new Date(it.mfg); if (!isNaN(d)) { d.setMonth(d.getMonth() + 36); ds.push(d); } }
    return ds.length ? new Date(Math.min.apply(null, ds)) : null;
  };
  const hot = boot.rows
    .filter(r => r.status !== 'retired')
    .map(r => ({ r: r, d: eff(r) }))
    .filter(x => x.d && (x.d - now) / DAY <= 60)
    .sort((a, b) => a.d - b.d);
  if (!hot.length) return 'nothing expiring';
  const fmt = d => Utilities.formatDate(d, Session.getScriptTimeZone(), DATE_FMT);
  const body = hot.map(x => {
    const days = Math.floor((x.d - now) / DAY);
    const tag = days < 0 ? 'EXPIRED ' + fmt(x.d) : days + 'd left (' + fmt(x.d) + ')';
    return '• ' + [x.r.b, x.r.p, x.r.sn, x.r.s].filter(String).join(' ') + ' — ' + tag;
  }).join('\n');
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(),
    'Shelf Tracker: ' + hot.length + ' item(s) expired or expiring soon', body);
  return 'sent ' + hot.length;
}
