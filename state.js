// state.js - Shared Global Data Store for AgriConnect

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

  getJobs: function() {
    return this.jobs;
  },

  addJob: function(job) {
    this.jobs.unshift(job);
  }
};
