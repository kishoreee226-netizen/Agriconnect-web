// auth.js - Central Authentication & Session Controller (Farmer, Labour, Provider)

// Global User Session State
window.AppState = window.AppState || {};
window.AppState.isLoggedIn = false;
window.AppState.userProfile = null;
window.AppState.currentRole = null;

// Page open avvagane saved session restore cheyadam
(function initUserSession() {
  try {
    const saved = localStorage.getItem("agri_user_profile");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.phone) {
        window.AppState.isLoggedIn = true;
        window.AppState.userProfile = parsed;
        window.AppState.userType = parsed.roleType;
        window.AppState.providerType = parsed.providerType || 'equipment';
        window.AppState.currentRole = (parsed.roleType === 'LABOUR_ONLY') ? 'LABOUR' : (parsed.roleType || 'FARMER');
      }
    }
  } catch (e) {
    console.error("Session restore error:", e);
  }
})();

// 1. Universal Phone Retrieval (Phone Isolation Helper)
window.getActiveUserPhone = function() {
  if (window.AppState && window.AppState.userProfile && window.AppState.userProfile.phone) {
    return window.AppState.userProfile.phone.trim();
  }
  try {
    const saved = localStorage.getItem("agri_user_profile");
    if (saved) {
      const parsed = JSON.parse(saved);
      return (parsed.phone || "").trim();
    }
  } catch (e) {}
  return "";
};

// 2. Universal User Registration with 4-Digit Security PIN & Cloud Sync
window.registerUniversalUser = function(profileData) {
  const { name, phone, village, roleType, pin, providerType } = profileData;

  if (!name || !name.trim()) {
    alert("Dayachesi mee peru namodu cheyandi.");
    return false;
  }
  if (!phone || phone.trim().length !== 10 || !/^[0-9]{10}$/.test(phone.trim())) {
    alert("Dayachesi saraina 10 ankela mobile number namodu cheyandi.");
    return false;
  }
  if (!village || !village.trim()) {
    alert("Dayachesi mee gramam peru namodu cheyandi.");
    return false;
  }

  // 4-Digit PIN Strict Validation
  const cleanPin = (pin || "").toString().trim();
  if (!cleanPin || !/^[0-9]{4}$/.test(cleanPin)) {
    alert("Dayachesi 4 ankela security PIN ni mathrame namodu cheyandi (e.g. 1234).");
    return false;
  }

  const cleanPhone = phone.trim();
  const profile = {
    name: name.trim(),
    phone: cleanPhone,
    village: village.trim(),
    roleType: roleType || 'FARMER',
    providerType: providerType || window.AppState.providerType || 'equipment',
    pin: cleanPin,
    updatedAt: new Date().toISOString()
  };

  // State Update
  window.AppState.isLoggedIn = true;
  window.AppState.userType = profile.roleType;
  window.AppState.providerType = profile.providerType;
  window.AppState.currentRole = (profile.roleType === 'LABOUR_ONLY') ? 'LABOUR' : profile.roleType;
  window.AppState.userProfile = profile;

  // Local Storage Save
  try {
    localStorage.setItem('agri_user_profile', JSON.stringify(profile));
    localStorage.setItem('agri_last_user', JSON.stringify(profile));
  } catch (e) {
    console.warn("LocalStorage save error:", e);
  }

  // Central Cloud Sync (AgriDB / Firestore)
  if (window.AgriDB && typeof window.AgriDB.saveUser === 'function') {
    window.AgriDB.saveUser(profile);
  } else if (window.db && window.db.collection) {
    window.db.collection("users").doc(cleanPhone).set(profile, { merge: true })
      .catch(err => console.error("Firestore user save error:", err));
  }

  return true;
};

// 3. Fast Login with Mobile Number & 4-Digit Security PIN
window.loginWithPin = async function(phone, inputPin) {
  const cleanPhone = (phone || "").toString().trim();
  const cleanPin = (inputPin || "").toString().trim();

  if (!cleanPhone || cleanPhone.length !== 10 || !/^[0-9]{10}$/.test(cleanPhone)) {
    alert("Dayachesi saraina 10 ankela mobile number enter cheyandi.");
    return false;
  }
  if (!cleanPin || cleanPin.length !== 4 || !/^[0-9]{4}$/.test(cleanPin)) {
    alert("Dayachesi 4 ankela PIN enter cheyandi.");
    return false;
  }

  // A. LocalStorage Check
  try {
    const saved = localStorage.getItem("agri_user_profile") || localStorage.getItem("agri_last_user");
    if (saved) {
      const user = JSON.parse(saved);
      if (user.phone === cleanPhone && user.pin === cleanPin) {
        window.AppState.isLoggedIn = true;
        window.AppState.userProfile = user;
        window.AppState.userType = user.roleType;
        window.AppState.providerType = user.providerType || 'equipment';
        window.AppState.currentRole = (user.roleType === 'LABOUR_ONLY') ? 'LABOUR' : (user.roleType || 'FARMER');
        localStorage.setItem("agri_user_profile", JSON.stringify(user));
        return user;
      }
    }
  } catch (e) {
    console.warn("LocalStorage login check error:", e);
  }

  // B. Cloud Firestore / AgriDB Verification Check
  if (window.db && window.db.collection) {
    try {
      const snap = await window.db.collection("users").doc(cleanPhone).get();
      if (snap.exists) {
        const cloudUser = snap.data();
        if (cloudUser.pin === cleanPin) {
          window.AppState.isLoggedIn = true;
          window.AppState.userProfile = cloudUser;
          window.AppState.userType = cloudUser.roleType;
          window.AppState.providerType = cloudUser.providerType || 'equipment';
          window.AppState.currentRole = (cloudUser.roleType === 'LABOUR_ONLY') ? 'LABOUR' : (cloudUser.roleType || 'FARMER');
          localStorage.setItem("agri_user_profile", JSON.stringify(cloudUser));
          localStorage.setItem("agri_last_user", JSON.stringify(cloudUser));
          return cloudUser;
        } else {
          alert("తప్పుడు పిన్! దయచేసి సరైన 4 అంకెల పిన్ నమోదు చేయండి.");
          return false;
        }
      } else {
        alert("ఈ మొబైల్ నంబర్ ఇంకా రిజిస్టర్ అవ్వలేదు. దయచేసి ముందుగా నమోదు చేసుకోండి.");
        return false;
      }
    } catch (err) {
      console.error("PIN Cloud Login Error:", err);
    }
  }

  alert("లాగిన్ చేయడంలో సమస్య వచ్చింది. వివరాలు మళ్లీ సరిచూసుకోండి.");
  return false;
};

// 4. User Logout Functionality
window.logoutUser = function() {
  window.AppState.isLoggedIn = false;
  window.AppState.userProfile = null;
  window.AppState.currentRole = null;

  try {
    const saved = localStorage.getItem("agri_user_profile");
    if (saved) {
      localStorage.setItem("agri_last_user", saved);
    }
  } catch (e) {}

  localStorage.removeItem("agri_user_profile");
  location.reload();
};
