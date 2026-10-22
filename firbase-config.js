// 1. Config Object Freeze (Evaru keys ni maarvaleru / tamper cheyaleru)
const firebaseConfig = Object.freeze({
  apiKey: "AIzaSyAvev9rVOBx5xE1A993EtSD7FG9JxAmbyI",
  authDomain: "agriconnect-5fc39.firebaseapp.com",
  projectId: "agriconnect-5fc39",
  storageBucket: "agriconnect-5fc39.firebasestorage.app",
  messagingSenderId: "491716802186",
  appId: "1:491716802186:web:087ee5f6c30ec75ce75f73"
});

// 2. Firebase App Initialization
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// 3. Database Instance
const dbInstance = (typeof firebase !== 'undefined') ? firebase.firestore() : null;

// 4. Global window.db Tamper-Proof & Freeze Lock
// Deeni valla inspect element/console nunchi evaru db ni overwrite cheyaleru
try {
  Object.defineProperty(window, 'db', {
    value: dbInstance,
    writable: false,      // Evaru window.db = null leda vere database petti marchaleru
    configurable: false   // Evaru ee property ni delete cheyaleru
  });
} catch (e) {
  window.db = dbInstance;
}

console.log("🔒 Firebase initialized with Tamper-Proof & Freeze Protection!");
