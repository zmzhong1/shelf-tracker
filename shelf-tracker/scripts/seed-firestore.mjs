// One-time seed: import the 2026-06-11 snapshot into Firestore.
// Uses the Firebase Web SDK against the open security rules (no service account needed).
// Run: npm i firebase && node scripts/seed-firestore.mjs   (aborts if `items` already has docs)
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const cfg = {
  apiKey: 'AIzaSyC85qOE1lIlez5aZbJs_utL83XBk8FfnSE',
  authDomain: 'shelf-tracker-kristina.firebaseapp.com',
  projectId: 'shelf-tracker-kristina',
  storageBucket: 'shelf-tracker-kristina.firebasestorage.app',
  messagingSenderId: '816599917009',
  appId: '1:816599917009:web:270aa215b139f7ae0d80f0',
};

const db = getFirestore(initializeApp(cfg));
const snap = JSON.parse(readFileSync(new URL('../data/inventory-snapshot-2026-06-11.json', import.meta.url)));
const data = snap.data || [];
const wish = snap.wish || [];

function mapItem(r, i) {
  const areas = Array.isArray(r.areas) ? r.areas : (r.areas ? [r.areas] : []);
  return {
    brand_name: r.brand || '', product_name: r.product || '', area_usage: areas.join(', '),
    shade_number: String(r.sn == null ? '' : r.sn), shade_name: r.shade || '',
    expiration_date: r.exp || '', manufacture_date: r.mfg || '', opened_date: '',
    pao_months: '', barcode: '', status: 'active', price: '', purchase_date: '',
    image_url: '', notes: r.notes || '', swatch_color: '', origin: r.origin || '',
    favorite: false, createdAt: 1717000000000 + i,
  };
}
function mapHaul(r, i) {
  return {
    brand: r.brand || '', product: r.product || '', shade_number: String(r.sn == null ? '' : r.sn),
    shade_name: r.shade || '', krw_price: String(r.krw || r.krw_price || ''), note: r.note || '',
    checked: false, created_date: 'Jun 11, 2026', createdAt: 1717000000000 + i,
  };
}
async function seedCollection(name, items, mapper) {
  const col = collection(db, name);
  const existing = await getDocs(col);
  if (!existing.empty) { console.log(`[skip] ${name} already has ${existing.size} docs — not seeding`); return 0; }
  let n = 0;
  for (let start = 0; start < items.length; start += 450) {
    const batch = writeBatch(db);
    items.slice(start, start + 450).forEach((r, j) => batch.set(doc(col), mapper(r, start + j)));
    await batch.commit();
    n += Math.min(450, items.length - start);
  }
  console.log(`[ok] ${name}: wrote ${n} docs`);
  return n;
}

console.log(`snapshot: ${data.length} items, ${wish.length} wishlist`);
await seedCollection('items', data, mapItem);
if (wish.length) await seedCollection('haul', wish, mapHaul);
console.log('done');
process.exit(0);
