// state.js - Shared Global Data Store for AgriConnect with Escrow

window.AgriState = {
  // డమ్మీ డేటా తీసేసి ఖాళీ లిస్ట్‌లు ఉంచాం
  jobs: [],

  wallet: {
    farmerBalance: 0,
    labourBalance: 0,
    lockedEscrow: []
  },

  getJobs: function() {
    return this.jobs;
  },

  addJob: function(job) {
    this.jobs.unshift(job);
  },

  getWallet: function() {
    return this.wallet;
  },

  lockEscrow: function(jobId, jobTitle, labourName, amount) {
    this.wallet.lockedEscrow.unshift({
      id: "ESC-" + Date.now(),
      jobId: jobId,
      jobTitle: jobTitle,
      labourName: labourName,
      amount: amount,
      status: "Locked"
    });
  },

  releaseEscrow: function(escrowId) {
    const esc = this.wallet.lockedEscrow.find(e => e.id === escrowId);
    if (esc && esc.status === "Locked") {
      esc.status = "Released";
      this.wallet.farmerBalance -= Number(esc.amount);
      this.wallet.labourBalance += Number(esc.amount);
    }
  }
};

// Global App User State
window.AppState = window.AppState || {
  isLoggedIn: false,        // ప్రారంభంలో లాగిన్ అవ్వలేదు
  userType: null,           // 'LABOUR_ONLY' లేదా 'FARMER'
  currentRole: "GUEST",     // ప్రారంభంలో 'GUEST'
  autoVoice: false,
  userProfile: null,
  user: null
};
