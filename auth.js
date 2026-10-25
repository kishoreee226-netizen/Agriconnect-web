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

// 2. Universal User Registration & Cloud Sync
window.registerUniversalUser = function(profileData) {
  const { name, phone, village, roleType } = profileData;

  if (!name || !name.trim()) {
    alert("Dayachesi mee peru namodu cheyandi.");
    return false;
  }
  if (!phone || phone.trim().length !== 10) {
    alert("Dayachesi saraina 10 ankela mobile number namodu cheyandi.");
    return false;
  }
  if (!village || !village.trim()) {
    alert("Dayachesi mee gramam peru namodu cheyandi.");
    return false;
  }

  const cleanPhone = phone.trim();
  const profile = {
    name: name.trim(),
    phone: cleanPhone,
    village: village.trim(),
    roleType: roleType || 'FARMER'
  };

  // State Update
  window.AppState.isLoggedIn = true;
  window.AppState.userType = profile.roleType;
  window.AppState.currentRole = (profile.roleType === 'LABOUR_ONLY') ? 'LABOUR' : profile.roleType;
  window.AppState.userProfile = profile;

  // Local Storage Save
  try {
    localStorage.setItem("agri_user_profile", JSON.stringify(profile));
  } catch (e) {}

  // Central Cloud Sync (AgriDB -> Firestore)
  if (window.AgriDB && typeof window.AgriDB.saveUser === 'function') {
    window.AgriDB.saveUser(profile);
  }

  return true;
};

// 3. User Logout Functionality
window.logoutUser = function() {
  window.AppState.isLoggedIn = false;
  window.AppState.userProfile = null;
  window.AppState.currentRole = null;
  localStorage.removeItem("agri_user_profile");
  location.reload();
};
