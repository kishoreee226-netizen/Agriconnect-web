// auth/auth.js - Complete Auth Engine & UI Controller

// --- 1. Global State & Session Init ---
window.AppState = window.AppState || {};
window.AppState.isLoggedIn = false;
window.AppState.userProfile = null;
window.AppState.currentRole = null;

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

// --- 2. Registration & Cloud Sync ---
window.registerUniversalUser = function(profileData) {
  const { name, phone, village, roleType, pin, providerType } = profileData;

  if (!name || !name.trim()) { alert("దయచేసి మీ పేరు నమోదు చేయండి."); return false; }
  if (!phone || phone.trim().length !== 10 || !/^[0-9]{10}$/.test(phone.trim())) {
    alert("దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి."); return false;
  }
  if (!village || !village.trim()) { alert("దయచేసి మీ గ్రామం పేరు నమోదు చేయండి."); return false; }

  const cleanPin = (pin || "").toString().trim();
  if (!cleanPin || !/^[0-9]{4}$/.test(cleanPin)) {
    alert("దయచేసి 4 అంకెల సెక్యూరిటీ పిన్ నమోదు చేయండి."); return false;
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

  window.AppState.isLoggedIn = true;
  window.AppState.userType = profile.roleType;
  window.AppState.providerType = profile.providerType;
  window.AppState.currentRole = (profile.roleType === 'LABOUR_ONLY') ? 'LABOUR' : profile.roleType;
  window.AppState.userProfile = profile;

  try {
    localStorage.setItem('agri_user_profile', JSON.stringify(profile));
    localStorage.setItem('agri_last_user', JSON.stringify(profile));
  } catch (e) {}

  if (window.AgriDB && typeof window.AgriDB.saveUser === 'function') {
    window.AgriDB.saveUser(profile);
  } else if (window.db && window.db.collection) {
    window.db.collection("users").doc(cleanPhone).set(profile, { merge: true }).catch(console.error);
  }

  return true;
};

// --- 3. Fast Login with 4-Digit PIN ---
window.loginWithPin = async function(phone, inputPin) {
  const cleanPhone = (phone || "").toString().trim();
  const cleanPin = (inputPin || "").toString().trim();

  if (!cleanPhone || cleanPhone.length !== 10 || !/^[0-9]{10}$/.test(cleanPhone)) {
    alert("దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి."); return false;
  }
  if (!cleanPin || cleanPin.length !== 4 || !/^[0-9]{4}$/.test(cleanPin)) {
    alert("దయచేసి 4 అంకెల పిన్ నమోదు చేయండి."); return false;
  }

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
  } catch (e) {}

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
          alert("తప్పుడు పిన్! దయచేసి సరైన 4 అంకెల పిన్ నమోదు చేయండి."); return false;
        }
      } else {
        alert("ఈ మొబైల్ నంబర్ నమోదు కాలేదు. దయచేసి రిజిస్టర్ అవ్వండి."); return false;
      }
    } catch (err) {
      console.error(err);
    }
  }

  alert("లాగిన్ సమస్య వచ్చింది. మళ్ళీ ప్రయత్నించండి.");
  return false;
};

// --- 4. Logout ---
window.logoutUser = function() {
  window.AppState.isLoggedIn = false;
  window.AppState.userProfile = null;
  window.AppState.currentRole = null;
  localStorage.removeItem("agri_user_profile");
  location.reload();
};

// --- 5. UI Modal Controller (AuthModule) ---
window.AuthModule = {
  currentRole: 'FARMER',
  targetContainer: null,

  roleConfigs: {
    FARMER: { theme: 'role-theme-farmer', icon: '🌾', label: 'రైతు లాగిన్' },
    LABOUR: { theme: 'role-theme-labour', icon: '👷', label: 'కూలీల లాగిన్' },
    PROVIDER: { theme: 'role-theme-provider', icon: '🚜', label: 'యంత్రాల ప్రొవైడర్' }
  },

  isLoggedIn: function() {
    return !!(window.AppState && window.AppState.isLoggedIn);
  },

  open: function(options = {}) {
    this.currentRole = options.role || 'FARMER';
    this.targetContainer = options.target || null;

    const modal = document.getElementById('agriAuthModal');
    if (!modal) return;

    const cfg = this.roleConfigs[this.currentRole] || this.roleConfigs.FARMER;
    modal.className = `agri-auth-overlay ${cfg.theme}`;
    document.getElementById('authBadgeIcon').innerText = cfg.icon;
    document.getElementById('authBadgeText').innerText = cfg.label;

    const savedUser = window.AppState && window.AppState.userProfile;
    const phoneRow = document.getElementById('authPhoneRow');
    const phoneInput = document.getElementById('authMobileInput');
    const pinInput = document.getElementById('authPinInput');
    pinInput.value = '';

    if (savedUser && savedUser.phone) {
      phoneRow.style.display = 'none';
      phoneInput.value = savedUser.phone;
      document.getElementById('authCardSub').innerText = `${savedUser.name || 'రైతు'} (${savedUser.phone})`;
    } else {
      phoneRow.style.display = 'flex';
      phoneInput.value = '';
      document.getElementById('authCardSub').innerText = 'కొనసాగడానికి మీ భద్రతా పిన్ నమోదు చేయండి';
    }

    this.toggleView('PIN');
    modal.style.display = 'flex';
    document.body.classList.add('modal-open-freeze');
    setTimeout(() => pinInput.focus(), 200);
  },

  close: function() {
    const modal = document.getElementById('agriAuthModal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-open-freeze');
    this.targetContainer = null;
  },

  toggleView: function(view) {
    document.getElementById('authPinFlow').style.display = (view === 'PIN') ? 'block' : 'none';
    document.getElementById('authRegisterFlow').style.display = (view === 'REGISTER') ? 'block' : 'none';
  },

  submitLogin: async function() {
    const phone = (document.getElementById('authMobileInput').value || window.getActiveUserPhone()).trim();
    const pin = document.getElementById('authPinInput').value.trim();

    if (!phone || phone.length !== 10) {
      alert('దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.'); return;
    }
    if (!pin || pin.length !== 4) {
      alert('దయచేసి 4 అంకెల సెక్యూరిటీ పిన్ నమోదు చేయండి.'); return;
    }

    const user = await window.loginWithPin(phone, pin);
    if (user) {
      this.handleSuccessRedirect();
    }
  },

  submitRegister: function() {
    const name = document.getElementById('regNameInput').value;
    const phone = document.getElementById('regPhoneInput').value;
    const village = document.getElementById('regVillageInput').value;
    const pin = document.getElementById('regPinInput').value;

    const ok = window.registerUniversalUser({
      name, phone, village, pin, roleType: this.currentRole
    });

    if (ok) {
      alert('నమోదు విజయవంతమైంది!');
      this.handleSuccessRedirect();
    }
  },

  handleSuccessRedirect: function() {
    const target = this.targetContainer;
    this.close();

    if (target && typeof window.openDirectAppView === 'function') {
      setTimeout(() => {
        window.openDirectAppView(target.containerId, target.title, target.icon, false);
      }, 150);
    }
  }
};
