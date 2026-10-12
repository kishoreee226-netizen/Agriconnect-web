// labour.js - కూలీల జాబ్స్ & రూట్ నావిగేషన్ మాడ్యూల్

function getStoredJobs() {
  return JSON.parse(localStorage.getItem("agri_jobs")) || [
    {
      id: "JOB-101",
      farmerName: "రామిరెడ్డి",
      crop: "పత్తి (Cotton)",
      workType: "పత్తి తీత (Picking)",
      count: 6,
      wage: 450,
      distanceKm: 3.2,
      lat: 17.9784,
      lng: 79.5941,
      status: "Open"
    },
    {
      id: "JOB-102",
      farmerName: "వెంకటేశ్వర్లు",
      crop: "వరి (Paddy)",
      workType: "కోత & మోపులు (Harvesting)",
      count: 4,
      wage: 500,
      distanceKm: 5.8,
      lat: 17.9850,
      lng: 79.6012,
      status: "Open"
    }
  ];
}

function renderLabourJobs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const jobsData = getStoredJobs();
  const openJobs = jobsData.filter(j => j.status === "Open");

  container.innerHTML = `
    <div style="background: #ffffff; border: 1.5px solid #1565c0; border-radius: 10px; padding: 14px; max-width: 480px; margin: 10px auto; font-family: sans-serif; box-shadow: 0 4px 10px rgba(0,0,0,0.06);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0; color: #0d47a1; font-size: 15px;">👷‍♂️ అందుబాటులో ఉన్న పనులు (5-10 KM Jobs)</h3>
        <span style="font-size: 11px; background: #e3f2fd; color: #1565c0; padding: 2px 6px; border-radius: 4px; font-weight: bold;">Wallet: ₹0</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto;">
        ${openJobs.length === 0 ? `<div style="text-align: center; color: #888; font-size: 12px; padding: 15px;">ప్రస్తుతం కొత్త పనులు లేవు.</div>` : ""}
        ${openJobs.map(job => `
          <div style="border: 1px solid #bbdefb; border-radius: 8px; padding: 10px; background: #fdfefe;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <strong style="color: #0d47a1; font-size: 13px;">${job.crop} -${job.workType}</strong>
                <div style="font-size: 11px; color: #555; margin-top: 2px;">రైతు: ${job.farmerName} \vert{} అవసరం: ${job.count} మంది</div>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 14px; font-weight: 700; color: #2e7d32;">₹${job.wage}/రోజు</span>
                <div style="font-size: 10px; color: #e65100; font-weight: 600;">📍 ${job.distanceKm} కి.మీ దూరం</div>
              </div>
            </div>

            <div style="display: flex; gap: 6px; margin-top: 8px;">
              <button onclick="confirmJob('${job.id}')" style="flex: 1; background: #1976d2; color: #fff; border: none; border-radius: 5px; padding: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
                ✅ పని కన్ఫర్మ్ చేసుకోండి
              </button>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}" target="_blank" style="flex: 1; text-align: center; text-decoration: none; background: #388e3c; color: #fff; border-radius: 5px; padding: 6px; font-size: 11px; font-weight: 600;">
                🗺️ పొలానికి దారి (Maps)
              </a>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

window.confirmJob = function(jobId) {
  const jobsData = getStoredJobs();
  const job = jobsData.find(j => j.id === jobId);
  if (!job) return;

  job.status = "Confirmed";
  localStorage.setItem("agri_jobs", JSON.stringify(jobsData));
  alert(`🎉 పని కన్ఫర్మ్ అయింది! రైతు ${job.farmerName} గారికి మీ కన్ఫర్మేషన్ మెసేజ్ వెళ్లింది. "పొలానికి దారి" నొక్కి పొలానికి చేరుకోవచ్చు.`);
  renderLabourJobs("labour-jobs-container");
};

window.addEventListener("DOMContentLoaded", () => {
  renderLabourJobs("labour-jobs-container");
});
