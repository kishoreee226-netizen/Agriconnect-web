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
window.AppState = {
  currentRole: "FARMER", // 'FARMER' leda 'LABOUR'
  autoVoice: false,
  user: {
    name: "Kishore",
    mobile: "9876543210"
  }
};

// Switch Role Function
function switchUserRole(role) {
  window.AppState.currentRole = role;

  const farmerBtn = document.getElementById("btn-role-farmer");
  const labourBtn = document.getElementById("btn-role-labour");
  const farmerContainer = document.getElementById("farmer-post-container");
  const labourContainer = document.getElementById("labour-jobs-container");

  if (role === "FARMER") {
    farmerBtn?.classList.add("active");
    labourBtn?.classList.remove("active");

    farmerContainer?.classList.remove("container-disabled");
    farmerContainer?.classList.add("container-highlight");

    labourContainer?.classList.add("container-disabled");
    labourContainer?.classList.remove("container-highlight");

    if (typeof speakTeluguText === "function") {
      speakTeluguText("రైతు మోడ్ ఆన్ చేయబడింది. కూలీలు కావాలంటే వివరాలు చెప్పండి.");
    }
  } else {
    labourBtn?.classList.add("active");
    farmerBtn?.classList.remove("active");

    labourContainer?.classList.remove("container-disabled");
    labourContainer?.classList.add("container-highlight");

    farmerContainer?.classList.add("container-disabled");
    farmerContainer?.classList.remove("container-highlight");

    if (typeof speakTeluguText === "function") {
      speakTeluguText("కూలీ మోడ్ ఆన్ చేయబడింది. మీకు అనువైన పనుల వివరాలు ఇక్కడ ఉన్నాయి.");
    }
  }
}

// Auto Voice Toggle Handler
function toggleAutoVoice(isEnabled) {
  window.AppState.autoVoice = isEnabled;
  if (isEnabled && typeof speakTeluguText === "function") {
    speakTeluguText("ఆటోమేటిక్ వాయిస్ ఆన్ చేయబడింది. నేను ప్రతీదీ మీకు వివరించి అడుగుతాను.");
  }
}

// Initial setup
window.addEventListener("DOMContentLoaded", () => {
  switchUserRole("FARMER");
});

