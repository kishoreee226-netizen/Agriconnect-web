// state.js - Shared Global Data Store for AgriConnect with Persistent Escrow & Dynamic AppState

// 1. Helper: Safe LocalStorage JSON Getter/Setter
function getStoredJSON(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStoredJSON(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`LocalStorage write error for ${key}:`, e);
  }
}

// 2. Central Data Store (Jobs, Escrow, Wallet & Services Cache)
window.AgriState = {
  // LocalStorage నుండి జాబ్స్ లోడ్ చేసుకోవడం
  jobs: getStoredJSON("agri_farmer_posted_jobs", getStoredJSON("agri_jobs", [])),

  // పర్సిస్టెంట్ వాలెట్ మరియు ఎస్క్రో వివరాలు
  wallet: getStoredJSON("agri_wallet", {
    farmerBalance: 0,
    labourBalance: 0,
    lockedEscrow: []
  }),

  // Getters & Setters
  getJobs: function() {
    const latest = getStoredJSON("agri_farmer_posted_jobs", getStoredJSON("agri_jobs", []));
    if (latest && Array.isArray(latest)) {
      this.jobs = latest;
    }
    return this.jobs;
  },

  addJob: function(job) {
    if (!job) return;
    this.jobs.unshift(job);
    setStoredJSON("agri_farmer_posted_jobs", this.jobs);
    setStoredJSON("agri_jobs", this.jobs);
  },

  getWallet: function() {
    this.wallet = getStoredJSON("agri_wallet", this.wallet);
    return this.wallet;
  },

  lockEscrow: function(jobId, jobTitle, labourName, amount) {
    const amt = Number(amount) || 0;
    const newEscrow = {
      id: "ESC-" + Date.now(),
      jobId: jobId,
      jobTitle: jobTitle || "వ్యవసాయ పని",
      labourName: labourName || "కూలీ",
      amount: amt,
      status: "Locked",
      createdAt: Date.now()
    };

    this.wallet.lockedEscrow.unshift(newEscrow);
    setStoredJSON("agri_wallet", this.wallet);
    return newEscrow;
  },

  releaseEscrow: function(escrowId) {
    const esc = this.wallet.lockedEscrow.find(e => e.id === escrowId);
    if (esc && esc.status === "Locked") {
      esc.status = "Released";
      esc.releasedAt = Date.now();
      const amt = Number(esc.amount) || 0;
      this.wallet.farmerBalance = Math.max(0, this.wallet.farmerBalance - amt);
      this.wallet.labourBalance += amt;
      setStoredJSON("agri_wallet", this.wallet);
      return true;
    }
    return false;
  }
};

// 3. Global App User Session State (Integrated with 3-in-1 Role Switcher)
(function initGlobalAppState() {
  const savedProfile = getStoredJSON("agri_user_profile", null);
  
  // కీ మిస్-మ్యాచ్ రాకుండా సింక్రొనైజ్ చేయడం
  const savedRole = localStorage.getItem("agri_current_active_role") || localStorage.getItem("agri_user_role");

  const initialUserType = savedProfile ? (savedProfile.roleType || savedProfile.userType || "FARMER") : null;

  // ప్రొఫైల్ మరియు యాక్టివ్ మోడ్ ఆధారంగా రోల్ నిర్ణయించడం
  let defaultRole = "GUEST";
  if (savedProfile) {
    if (savedRole && ['FARMER', 'LABOUR', 'PROVIDER'].includes(savedRole)) {
      defaultRole = savedRole;
    } else {
      defaultRole = (initialUserType === "LABOUR" || initialUserType === "LABOURONLY" || initialUserType === "LABOUR_ONLY") 
                    ? "LABOUR" 
                    : (initialUserType === "PROVIDER" ? "PROVIDER" : "FARMER");
    }
  }

  window.AppState = Object.assign(window.AppState || {}, {
    isLoggedIn: Boolean(savedProfile && savedProfile.phone),
    userType: initialUserType,                               // 'FARMER', 'LABOUR', 'PROVIDER'
    currentRole: defaultRole,                                // 'FARMER' | 'LABOUR' | 'PROVIDER' | 'GUEST'
    providerType: localStorage.getItem("agri_provider_tab") || (savedProfile && savedProfile.providerType) || "equipment",
    autoVoice: false,
    userProfile: savedProfile,
    user: savedProfile,

    // Helper: అన్ని మాడ్యూల్స్ కీలను ఒకేలా అప్‌డేట్ చేసే ఫంక్షన్
    setCurrentRole: function(newRole) {
      this.currentRole = newRole;
      localStorage.setItem("agri_current_active_role", newRole);
      localStorage.setItem("agri_user_role", newRole);
    }
  });
})();
