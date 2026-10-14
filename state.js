// state.js - Shared Global Data Store for AgriConnect with Escrow

window.AgriState = {
  jobs: [
    {
      id: "JOB-1",
      farmerName: "కిషోర్",
      farmerPhone: "9876543210",
      crop: "వరి (Paddy)",
      workType: "కోత",
      count: 2,
      wage: 450,
      distanceKm: "2.4",
      lat: 17.9784,
      lng: 79.5941,
      status: "Confirmed",
      labourName: "రాము (టెస్ట్ కూలీ)",
      labourPhone: "9876543211"
    },
    {
      id: "JOB-2",
      farmerName: "వెంకటేశ్వర్లు",
      farmerPhone: "9876543210",
      crop: "పత్తి (Cotton)",
      workType: "తీత",
      count: 4,
      wage: 500,
      distanceKm: "3.5",
      lat: 17.9850,
      lng: 79.6012,
      status: "Open",
      labourName: "",
      labourPhone: ""
    }
  ],

  wallet: {
    farmerBalance: 2500,
    labourBalance: 0,
    lockedEscrow: [
      {
        id: "ESC-1",
        jobId: "JOB-1",
        jobTitle: "వరి కోత",
        labourName: "రాము",
        amount: 450,
        status: "Locked" // 'Locked' or 'Released'
      }
    ]
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
  currentRole: "GUEST",     // ప్రారంభంలో 'GUEST', లాగిన్ తర్వాత 'LABOUR' లేదా 'FARMER'
  autoVoice: false,
  user: {
    name: "కిషోర్",
    mobile: "9876543210"
  }
};

