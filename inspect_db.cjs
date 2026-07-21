const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = require('./src/firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspect() {
  const collections = [
    'students',
    'teachers',
    'courses',
    'studentGroups',
    'clinicalSites',
    'wards',
    'academicSchedules',
    'clinicalSchedules',
    'dutyAssignments',
    'vanTrips',
    'utilityBills',
    'announcements'
  ];

  for (const colName of collections) {
    try {
      const q = query(collection(db, colName), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        console.log(`=== Collection: ${colName} ===`);
        const doc = snap.docs[0];
        console.log(`ID: ${doc.id}`);
        console.log(JSON.stringify(doc.data(), null, 2));
      } else {
        console.log(`=== Collection: ${colName} (EMPTY) ===`);
      }
    } catch (err) {
      console.error(`Error inspecting ${colName}:`, err.message);
    }
  }
}

inspect().then(() => process.exit(0));
