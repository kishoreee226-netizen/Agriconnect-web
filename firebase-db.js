// firebase-db.js - Universal Central Agri Database Service (Single Engine for All Modules)

window.AgriDB = {
  // 1. UNIVERSAL SAVE / ADD / UPDATE
  // docId ఇస్తే ఆ నిర్దిష్ట ఐడీతో సేవ్ అవుతుంది (లేదా అప్‌డేట్ అవుతుంది), లేకపోతే ఆటో-ఐడీతో కొత్త డాక్యుమెంట్ క్రియేట్ అవుతుంది.
  async saveRecord(collectionName, data, customDocId = null) {
    if (!window.db) throw new Error("Firebase DB సిద్ధంగా లేదు!");
    if (!collectionName || !data) return null;

    const payload = {
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (customDocId) {
      await window.db.collection(collectionName).doc(customDocId).set(payload, { merge: true });
      return customDocId;
    } else {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const docRef = await window.db.collection(collectionName).add(payload);
      return docRef.id;
    }
  },

  // 2. UNIVERSAL DELETE
  // Doc ID ద్వారా లేదా ఫోన్/ఫీల్డ్ క్వెరీ ద్వారా డిలీట్ చేయడం
  async deleteRecord(collectionName, docId, fallbackQuery = null) {
    if (!window.db) throw new Error("Firebase DB సిద్ధంగా లేదు!");
    if (!collectionName) return false;

    // A. Doc ID తెలిస్తే నేరుగా డిలీట్ చేయడం
    if (docId && typeof docId === 'string' && docId.trim().length > 0 && !docId.startsWith("idx_")) {
      try {
        await window.db.collection(collectionName).doc(docId).delete();
        return true;
      } catch (e) {
        console.warn(`Direct delete failed for ${collectionName}/${docId}:`, e);
      }
    }

    // B. Doc ID లేని పాత రికార్డులను ఫోన్ + నిర్దిష్ట ఫీల్డ్‌తో వెతికి బ్యాచ్ డిలీట్ చేయడం
    if (fallbackQuery && fallbackQuery.phone && fallbackQuery.field && fallbackQuery.value) {
      try {
        const snap = await window.db.collection(collectionName)
          .where('phone', '==', fallbackQuery.phone)
          .where(fallbackQuery.field, '==', fallbackQuery.value)
          .get();

        const batch = window.db.batch();
        snap.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        return true;
      } catch (err) {
        console.warn(`Query batch delete error in ${collectionName}:`, err);
      }
    }
    return false;
  },

  // 3. UNIVERSAL LIVE SYNC (Realtime Listener)
  // ఏ కలెక్షన్ నుండైనా లైవ్ డేటాను ఆటోమేటిక్‌గా స్క్రీన్‌పై అప్‌డేట్ చేస్తుంది
  listenCollection(collectionName, options = {}, callback) {
    if (!window.db || !collectionName || typeof callback !== 'function') return null;

    let query = window.db.collection(collectionName);

    // ఫిల్టర్ అవసరమైతే (ఉదా: phone == '9876543210')
    if (options.where && Array.isArray(options.where)) {
      query = query.where(options.where[0], options.where[1], options.where[2]);
    }

    // క్రమబద్ధీకరణ (ఉదా: orderBy 'createdAt')
    if (options.orderBy) {
      query = query.orderBy(options.orderBy, options.orderDirection || 'desc');
    }

    return query.onSnapshot(snapshot => {
      const records = [];
      snapshot.forEach(doc => {
        records.push({ firestoreDocId: doc.id, id: doc.id, ...doc.data() });
      });
      callback(records);
    }, error => {
      console.error(`Live sync error on [${collectionName}]:`, error);
    });
  },

  // 4. UNIVERSAL ONE-TIME GET
  // రియల్‌టైమ్ లిజనర్ కాకుండా ఒకేసారి డేటా ఫెచ్ చేయడానికి
  async getRecords(collectionName, options = {}) {
    if (!window.db || !collectionName) return [];

    let query = window.db.collection(collectionName);
    if (options.where && Array.isArray(options.where)) {
      query = query.where(options.where[0], options.where[1], options.where[2]);
    }
    if (options.orderBy) {
      query = query.orderBy(options.orderBy, options.orderDirection || 'desc');
    }

    const snap = await query.get();
    const records = [];
    snap.forEach(doc => records.push({ firestoreDocId: doc.id, id: doc.id, ...doc.data() }));
    return records;
  }
};

Object.freeze(window.AgriDB);
console.log("⚡ Central AgriDB Universal CRUD Engine Initialized!");
