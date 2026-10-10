// Central Firebase Initialization
const firebaseConfig = {
  apiKey: "AIzaSyAvev9rVOBx5xE1A993EtSD7FG9JxAmbyI",
  authDomain: "agriconnect-5fc39.firebaseapp.com",
  projectId: "agriconnect-5fc39",
  storageBucket: "agriconnect-5fc39.firebasestorage.app",
  messagingSenderId: "491716802186",
  appId: "1:491716802186:web:087ee5f6c30ec75ce75f73"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Global Firestore instance
window.db = (typeof firebase !== 'undefined') ? firebase.firestore() : null;
