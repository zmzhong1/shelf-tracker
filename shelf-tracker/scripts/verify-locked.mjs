// Confirms the lockdown: an UNAUTHENTICATED read of `items` must be denied.
// Polls until rules propagate (they can take ~1 min after deploy).
// Run: node scripts/verify-locked.mjs
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const cfg = {
  apiKey: 'AIzaSyC85qOE1lIlez5aZbJs_utL83XBk8FfnSE',
  authDomain: 'shelf-tracker-kristina.firebaseapp.com',
  projectId: 'shelf-tracker-kristina',
  appId: '1:816599917009:web:270aa215b139f7ae0d80f0',
};
const col = collection(getFirestore(initializeApp(cfg)), 'items');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (let i = 1; i <= 8; i++) {
  try {
    const snap = await getDocs(col);
    console.log(`attempt ${i}: still OPEN — unauth read returned ${snap.size} docs (waiting for propagation)`);
  } catch (e) {
    if (e.code === 'permission-denied') {
      console.log(`attempt ${i}: LOCKED ✓ — unauthenticated read denied. Allow-list is enforced.`);
      process.exit(0);
    }
    console.log(`attempt ${i}: error ${e.code || e.message}`);
  }
  await sleep(12000);
}
console.log('Did not observe lockdown within timeout — check rules deploy.');
process.exit(1);
