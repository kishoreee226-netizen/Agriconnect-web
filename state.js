// state.js - Shared Global Data Store for AgriConnect with Persistent Escrow & AppState

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

// 2. Central Data Store
window.AgriState = {
  // LocalStorage నుండి జాబ్స్ లోడ్ చేసుకోవడం (Fallback to empty array)
  jobs: getStoredJSON("agri_farmer_posted_jobs", getStoredJSON("agri_jobs", [])),

  // పర్సిస్టెంట్ వాలెట్ మరియు ఎస్క్రో వివరాలు
  wallet: getStoredJSON("agri_wallet", {
    farmerBalance: 0,
    labourBalance: 0,
    lockedEscrow: []
  }),

  // Getters & Setters
  getJobs: function() {
    // తాజా లోకల్ స్టోరేజ్ డేటాతో సింక్ చేసి ఇవ్వడం
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

// 3. Global App User Session State (Consistent with auth.js)
window.AppState = window.AppState || {
  isLoggedIn: false,
  userType: null,            // 'LABOUR_ONLY', 'FARMER', etc.
  currentRole: "GUEST",      // 'FARMER', 'LABOUR', 'PROVIDER', 'GUEST'
  providerType: "equipment", // 'equipment', 'seeds', 'transport'
  autoVoice: false,
  userProfile: null,
  user: null
};
