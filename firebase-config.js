// firebase-config.js - Secure Firebase Initialization & Offline-Ready Central Store

// 1. Config Object Freeze (కీస్ మార్చకుండా ఫ్రీజ్ చేయడం)
const firebaseConfig = Object.freeze({
  apiKey: "AIzaSyAvev9rVOBx5xE1A993EtSD7FG9JxAmbyI",
  authDomain: "agriconnect-5fc39.firebaseapp.com",
  projectId: "agriconnect-5fc39",
  storageBucket: "agriconnect-5fc39.firebasestorage.app",
  messagingSenderId: "491716802186",
  appId: "1:491716802186:web:087ee5f6c30ec75ce75f73"
});

// 2. Firebase App Initialization
let firestoreInstance = null;

if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // 3. Firestore Offline Persistence (గ్రామీణ ప్రాంతాల్లో సిగ్నల్ లేకపోయినా డేటా లోడ్ అవ్వడానికి)
  try {
    firestoreInstance = firebase.firestore();
    firestoreInstance.enablePersistence({ synchronizeTabs: true }).catch((err) => {
      if (err.code === 'failed-precondition') {
        // బహుళ ట్యాబ్‌లు ఒకేసారి ఓపెన్ అయినప్పుడు
        console.warn("Firestore persistence notice: Multiple tabs open.");
      } else if (err.code === 'unimplemented') {
        // బ్రౌజర్ సపోర్ట్ చేయనప్పుడు
        console.warn("Firestore persistence notice: Browser not supported.");
      }
    });
  } catch (err) {
    console.warn("Firestore init notice:", err);
  }
} else {
  console.error("❌ Firebase SDK లోడ్ కాలేదు. ದయచేసి HTML లో Firebase స్క్రిప్ట్‌లు సరిగ్గా ఉన్నాయో లేదో తనిఖీ చేయండి.");
}

// 4. Global window.db Tamper-Proof & Freeze Lock
try {
  Object.defineProperty(window, 'db', {
    get: function() {
      if (firestoreInstance) return firestoreInstance;
      if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        firestoreInstance = firebase.firestore();
        return firestoreInstance;
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

console.log("🔒 Firebase initialized with Offline Cache & Tamper-Proof Protection!");
