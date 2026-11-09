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
        window.AppState.userType = parsed.roleType || 'FARMER';
        window.AppState.providerType = parsed.providerType || 'equipment';
        
        const savedRole = localStorage.getItem("agri_current_active_role");
        window.AppState.currentRole = savedRole || ((parsed.roleType === 'LABOUR_ONLY' || parsed.roleType === 'LABOUR') ? 'LABOUR' : 'FARMER');
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
  const assignedRole = (roleType === 'LABOUR_ONLY' || roleType === 'LABOUR') ? 'LABOUR' : (roleType || 'FARMER');

  const profile = {
    name: name.trim(),
    phone: cleanPhone,
    village: village.trim(),
    roleType: assignedRole,
    userType: assignedRole,
    providerType: providerType || window.AppState.providerType || 'equipment',
    pin: cleanPin,
    updatedAt: new Date().toISOString()
  };

  window.AppState.isLoggedIn = true;
  window.AppState.userType = assignedRole;
  window.AppState.currentRole = assignedRole;
  window.AppState.providerType = profile.providerType;
  window.AppState.userProfile = profile;

  try {
    localStorage.setItem('agri_user_profile', JSON.stringify(profile));
    localStorage.setItem('agri_last_user', JSON.stringify(profile));
    localStorage.setItem('agri_current_active_role', assignedRole);
  } catch (e) {}

  if (window.AgriDB && typeof window.AgriDB.saveUser === 'function') {
    window.AgriDB.saveUser(profile);
  } else if (window.db && window.db.collection) {
    window.db.collection("users").doc(cleanPhone).set(profile, { merge: true }).catch(console.error);
  }

  return true;
};

// --- 3. Fast Login with 4-Digit PIN ---
window.loginWithPin = async function(phone, inputPin, expectedRole = 'FARMER') {
  const cleanPhone = (phone || "").toString().trim();
  const cleanPin = (inputPin || "").toString().trim();

  if (!cleanPhone || cleanPhone.length !== 10 || !/^[0-9]{10}$/.test(cleanPhone)) {
    alert("దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి."); return false;
  }
  if (!cleanPin || cleanPin.length !== 4 || !/^[0-9]{4}$/.test(cleanPin)) {
    alert("దయచేసి 4 అంకెల పిన్ నమోదు చేయండి."); return false;
  }

  // A. LocalStorage Check
  try {
    const saved = localStorage.getItem("agri_user_profile") || localStorage.getItem("agri_last_user");
    if (saved) {
      const user = JSON.parse(saved);
      if (user.phone === cleanPhone && user.pin === cleanPin) {
        const assignedRole = expectedRole || user.roleType || 'FARMER';
        window.AppState.isLoggedIn = true;
        window.AppState.userProfile = user;
        window.AppState.userType = assignedRole;
        window.AppState.currentRole = assignedRole;
        localStorage.setItem("agri_user_profile", JSON.stringify(user));
        localStorage.setItem("agri_current_active_role", assignedRole);
        return user;
      }
    }
  } catch (e) {}

  // B. Firebase Firestore Cloud Check
  if (window.db && window.db.collection) {
    try {
      const snap = await window.db.collection("users").doc(cleanPhone).get();
      if (snap.exists) {
        const cloudUser = snap.data();
        if (cloudUser.pin === cleanPin) {
          const assignedRole = expectedRole || cloudUser.roleType || 'FARMER';
          window.AppState.isLoggedIn = true;
          window.AppState.userProfile = cloudUser;
          window.AppState.userType = assignedRole;
          window.AppState.currentRole = assignedRole;
          localStorage.setItem("agri_user_profile", JSON.stringify(cloudUser));
          localStorage.setItem("agri_last_user", JSON.stringify(cloudUser));
          localStorage.setItem("agri_current_active_role", assignedRole);
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

  alert("లాగిన్ వివరాలు సరిపోలలేదు. దయచేసి నమోదు చేసుకోండి.");
  return false;
};

// --- 4. Logout ---
window.logoutUser = function() {
  if (window.AppState) {
    window.AppState.isLoggedIn = false;
    window.AppState.userProfile = null;
    window.AppState.currentRole = "GUEST";
  }
  localStorage.removeItem("agri_user_profile");
  localStorage.removeItem("agri_current_active_role");
  
  if (typeof window.applyUserRoleView === 'function') {
    window.applyUserRoleView();
  } else {
    location.reload();
  }
};

// --- 5. UI Modal Controller (AuthModule) ---
window.AuthModule = {
  currentRole: 'FARMER',
  targetContainer: null,

  roleConfigs: {
    FARMER: { theme: 'role-theme-farmer', icon: '🌾', label: 'రైతు లాగిన్' },
    LABOUR: { theme: 'role-theme-labour', icon: '👷', label: 'కూలీల లాగిన్' },
    LABOUR_ONLY: { theme: 'role-theme-labour', icon: '👷', label: 'కూలీల లాగిన్' },
    PROVIDER: { theme: 'role-theme-provider', icon: '🤝', label: 'యజమానుల కేంద్రం' }
  },

  isLoggedIn: function() {
    return !!(window.AppState && window.AppState.isLoggedIn);
  },

  open: function(options = {}) {
    const rawRole = (typeof options === 'string') ? options : (options.role || 'FARMER');
    this.currentRole = (rawRole === 'LABOUR_ONLY' || rawRole === 'LABOUR') ? 'LABOUR' : rawRole;
    this.targetContainer = options.target || null;

    const modal = document.getElementById('agriAuthModal');
    if (!modal) return;

    const cfg = this.roleConfigs[this.currentRole] || this.roleConfigs.FARMER;
    modal.className = `agri-auth-overlay ${cfg.theme}`;
    
    const iconEl = document.getElementById('authBadgeIcon');
    const badgeEl = document.getElementById('authBadgeText');
    if (iconEl) iconEl.innerText = cfg.icon;
    if (badgeEl) badgeEl.innerText = cfg.label;

    const savedUser = window.AppState && window.AppState.userProfile;
    const phoneRow = document.getElementById('authPhoneRow');
    const phoneInput = document.getElementById('authMobileInput');
    const pinInput = document.getElementById('authPinInput');
    const subText = document.getElementById('authCardSub');
    if (pinInput) pinInput.value = '';

    // కేవలం అదే రోల్ కు సంబంధించిన యూజర్ డేటా ఉంటేనే ఆటోమేటిక్ గా పిన్ స్క్రీన్ వస్తుంది
    if (savedUser && savedUser.phone && (savedUser.roleType === this.currentRole || savedUser.userType === this.currentRole)) {
      if (phoneRow) phoneRow.style.display = 'none';
      if (phoneInput) phoneInput.value = savedUser.phone;
      if (subText) subText.innerText = `${savedUser.name || 'వినియోగదారుడు'} (${savedUser.phone})`;
      this.toggleView('PIN');
    } else {
      if (phoneRow) phoneRow.style.display = 'flex';
      if (phoneInput) phoneInput.value = '';
      if (subText) subText.innerText = 'కొనసాగడానికి వివరాలు నమోదు చేయండి';
      this.toggleView('PIN');
    }

    modal.style.display = 'flex';
    document.body.classList.add('modal-open-freeze');
    setTimeout(() => {
      if (phoneRow && phoneRow.style.display !== 'none' && phoneInput) {
        phoneInput.focus();
      } else if (pinInput) {
        pinInput.focus();
      }
    }, 200);
  },

  close: function() {
    const modal = document.getElementById('agriAuthModal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-open-freeze');
    this.targetContainer = null;
  },

  toggleView: function(view) {
    const pinBox = document.getElementById('authPinFlow');
    const regBox = document.getElementById('authRegisterFlow');
    if (pinBox) pinBox.style.display = (view === 'PIN') ? 'block' : 'none';
    if (regBox) regBox.style.display = (view === 'REGISTER') ? 'block' : 'none';
  },

  submitLogin: async function() {
    const phoneInput = document.getElementById('authMobileInput');
    const phone = (phoneInput?.value || window.getActiveUserPhone()).trim();
    const pin = document.getElementById('authPinInput')?.value.trim();

    if (!phone || phone.length !== 10) {
      alert('దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.'); return;
    }
    if (!pin || pin.length !== 4) {
      alert('దయచేసి 4 అంకెల సెక్యూరిటీ పిన్ నమోదు చేయండి.'); return;
    }

    const user = await window.loginWithPin(phone, pin, this.currentRole);
    if (user) {
      this.handleSuccessRedirect();
    }
  },

  submitRegister: function() {
    const name = document.getElementById('regNameInput')?.value;
    const phone = document.getElementById('regPhoneInput')?.value;
    const village = document.getElementById('regVillageInput')?.value;
    const pin = document.getElementById('regPinInput')?.value;

    const ok = window.registerUniversalUser({
      name, phone, village, pin, roleType: this.currentRole
    });

    if (ok) {
      alert('నమోదు విజయవంతమైంది!');
      this.handleSuccessRedirect();
    }
  },

  handleSuccessRedirect: function() {
    this.close();

    // కేంద్ర ట్రాఫిక్ కంట్రోలర్ వ్యూ అప్‌డేట్ ట్రిగ్గర్
    if (typeof window.applyUserRoleView === 'function') {
      window.applyUserRoleView();
    } else if (window.RoleController && typeof window.RoleController.applyUserRoleView === 'function') {
      window.RoleController.applyUserRoleView();
    }
  }
};

// --- 6. Global Forwarding Bridge (రైతు & కూలీ కార్డుల కోసం) ---
window.openLoginModal = function(role) {
  window.AuthModule.open({ role: role || 'FARMER' });
};

window.closeLoginModal = function() {
  window.AuthModule.close();
};
