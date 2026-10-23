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

// 3 & 4. Global window.db Tamper-Proof & Freeze Lock (Root Fix)
try {
    Object.defineProperty(window, 'db', {
        get: function() {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                return firebase.firestore();
            }
            return null;
        },
        set: function() {
            console.warn("⚠️ భద్రత దృష్ట్యా window.db ని మార్చడం నిషేధించబడింది!");
        },
        configurable: false
    });
} catch (e) {
    console.error("Freeze lock init error:", e);
}

console.log("🔒 Firebase initialized with Tamper-Proof & Freeze Protection!");
