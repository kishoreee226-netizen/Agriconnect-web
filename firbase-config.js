// ================= IMMUTABLE FIREBASE CONFIG & INIT =================
(function () {
  // 1. Mee Original Firebase Credentials (Read-only Lock)
  const firebaseConfig = Object.freeze({
    apiKey: "AIzaSyAvev9rVOBx5xElA993EtSD7FG9JxAMbyI",
    authDomain: "agriconnect-5fc39.firebaseapp.com",
    projectId: "agriconnect-5fc39",
    storageBucket: "agriconnect-5fc39.firebasestorage.app",
    messagingSenderId: "491716802186",
    appId: "1:491716802186:web:087ee5f6c30ec75ce75f73",
    measurementId: "G-8134KCW1ZT"
  });

  // 2. Safe App Initialization
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
console.log("Firebase initialized successfully!");

  }

  // 3. Database Instance Lock (Global 'db' ni evaru rewrite/modify cheyakunda freeze)
  const firestoreInstance = firebase.firestore();

  Object.defineProperty(window, "db", {
    value: firestoreInstance,
    writable: false,
    configurable: false,
    enumerable: true
  });
})();
