#!/usr/bin/env node
/**
 * build-preview.js — turn the GAS-only apps-script/index.html into a browser-runnable
 * preview.html, and syntax-check every inline <script>.
 *
 *   - replaces the GAS scriptlet `<?= JSON.stringify(prefill) ?>` with "{}"
 *   - tags <body class="preview"> (device-frame CSS)
 *   - injects window.__MOCK__ seeded from the real inventory snapshot, so every
 *     google.script.run call resolves against in-memory data (no Apps Script needed)
 *
 * The shipped index.html is never modified. Run: node tools/build-preview.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'apps-script', 'index.html');
const OUT = path.join(ROOT, 'preview.html');   // kept out of apps-script/ so `clasp push` only sees real GAS files
const SNAP = path.join(ROOT, 'data', 'inventory-snapshot-2026-06-11.json');

const html = fs.readFileSync(SRC, 'utf8');
const snap = JSON.parse(fs.readFileSync(SNAP, 'utf8'));

/* ---- syntax-check every inline <script> (scriptlet neutralised) ---- */
const checkable = html.replace('<?= JSON.stringify(prefill) ?>', '"{}"');
const scripts = [...checkable.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let ok = true;
scripts.forEach((body, i) => {
  try { new Function(body); }            // parse-only; runtime globals don't matter
  catch (e) { ok = false; console.error(`✗ inline <script> #${i + 1} syntax error:\n  ${e.message}`); }
});
if (!ok) process.exit(1);
console.log(`✓ ${scripts.length} inline <script> block(s) parse clean`);

/* ---- mock backend seeded from her real snapshot ---- */
const mock = `<script>
(function(){
  var SNAP = ${JSON.stringify(snap.data || [])};
  var WISH = ${JSON.stringify(snap.wish || [])};
  var rows = SNAP.map(function(d,i){ return {
    row:i+2, b:d.brand||"", p:d.product||"", a:(d.areas||[]).join(", "), sn:String(d.sn||""), s:d.shade||"",
    exp:d.exp||"", mfg:d.mfg||"", opened:"", pao:"", barcode:"", status:"active", price:"", pd:"", img:"", notes:d.notes||"", color:""
  };});
  var haul = WISH.map(function(d,i){ return {row:i+2, brand:d.brand||"", product:d.product||"", sn:String(d.sn||""),
    shade:d.shade||"", krw:(i*5000+9000), note:d.notes||"", checked:false}; });
  function bootstrap(){
    var brands={}, products={};
    rows.forEach(function(r){ if(r.b){ brands[r.b]=true; if(r.p){ (products[r.b]=products[r.b]||{})[r.p]=true; } } });
    return { rows:rows.slice(), count:rows.length,
      brands:Object.keys(brands).sort(function(x,y){return x.localeCompare(y,undefined,{sensitivity:"base"});}),
      products:Object.keys(products).reduce(function(o,k){o[k]=Object.keys(products[k]).sort();return o;},{}) };
  }
  window.__MOCK__={
    __delay:80,
    getBootstrap:bootstrap,
    addItem:function(item){ rows.push({row:rows.length+2,b:item.brand_name,p:item.product_name,a:item.area_usage,sn:String(item.shade_number||""),s:item.shade_name,exp:item.expiration_date,mfg:item.manufacture_date,opened:item.opened_date,pao:item.pao_months,barcode:item.barcode,status:item.status||"active",price:item.price,pd:item.purchase_date,img:"",notes:item.notes,color:item.swatch_color||""}); return {row:rows.length+1,count:rows.length}; },
    bulkImport:function(tsv){ var lines=String(tsv).split(/\\r?\\n/).filter(function(l){return l.trim();}); lines.forEach(function(l){ var c=l.split("\\t"); rows.push({row:rows.length+2,b:(c[0]||""),p:(c[1]||""),a:(c[2]||""),sn:String(c[3]||""),s:(c[4]||""),exp:(c[5]||""),mfg:(c[6]||""),opened:(c[7]||""),pao:(c[8]||""),barcode:(c[9]||""),status:(c[10]||"active"),price:(c[11]||""),pd:(c[12]||""),img:(c[13]||""),notes:(c[14]||""),color:(c[15]||"")}); }); return {added:lines.length}; },
    lookupBarcode:function(code){ if(Number(String(code).slice(-1))%2===0) return {found:true,brand:"BBIA",product:"Ready To Wear Cheek",image:""}; return {found:false}; },
    markOpened:function(row){ var r=rows.filter(function(x){return x.row===row;})[0]; if(r) r.opened="Jun 13, 2026"; return "Jun 13, 2026"; },
    setStatus:function(row,st){ var r=rows.filter(function(x){return x.row===row;})[0]; if(r) r.status=st==="retired"?"retired":"active"; return st; },
    getHaul:function(){ return haul.slice(); },
    addHaulItem:function(item){ haul.push({row:haul.length+2,brand:item.brand,product:item.product,sn:String(item.shade_number||""),shade:item.shade_name||"",krw:Number(String(item.krw_price).replace(/[^0-9.]/g,""))||0,note:item.note||"",checked:false}); return {row:haul.length+1}; },
    setHaulChecked:function(row,ch){ var h=haul.filter(function(x){return x.row===row;})[0]; if(h) h.checked=!!ch; return ch; },
    removeHaulItem:function(row){ haul=haul.filter(function(x){return x.row!==row;}); return true; }
  };
})();
</script>`;

const preview = checkable
  .replace('<body>', '<body class="preview">')
  .replace('<body class="preview">', '<body class="preview">\n' + mock);

fs.writeFileSync(OUT, preview, 'utf8');
console.log(`✓ wrote ${path.relative(ROOT, OUT)}  (${rowsLine(snap)})`);

function rowsLine(s){ return (s.data ? s.data.length : 0) + ' items, ' + (s.wish ? s.wish.length : 0) + ' wishlist'; }
