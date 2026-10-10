// Firebase Configuration & Safe Global Init
const firebaseConfig = Object.freeze({
  apiKey: "AIzaSyAvev9rVOBx5xE1A993EtSD7FG9JxAmbyI",
  authDomain: "agriconnect-5fc39.firebaseapp.com",
  projectId: "agriconnect-5fc39",
  storageBucket: "agriconnect-5fc39.firebasestorage.app",
  messagingSenderId: "491716802186",
  appId: "1:491716802186:web:087ee5f6c30ec75ce75f73"
});

function initFirebaseGlobal() {
  if (typeof firebase === 'undefined') {
    setTimeout(initFirebaseGlobal, 50);
    return;
  }
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  window.db = firebase.firestore();
  console.log("Firebase & window.db ready!");
}

initFirebaseGlobal();
