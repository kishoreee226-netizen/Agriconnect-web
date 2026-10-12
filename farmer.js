// farmer.js - Farmer Dashboard Module

function renderFarmerWidget() {
  const container = document.getElementById("farmer-post-container");
  if (!container) return;

  const jobs = window.getAppJobs ? window.getAppJobs() : [];
  const myAcceptedJobs = jobs.filter(j => j.status === "Confirmed");

  container.innerHTML = `
    <div style="background: #ffffff; border: 1.5px solid #81c784; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 8px rgba(0,0,0,0.06);">
      
      <!-- Light Green Header -->
      <div style="background: #e8f5e9; border-bottom: 1.5px solid #c8e6c9; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: #1b5e20; font-size: 14px; font-weight: 700;">
          👨‍🌾 రైతు డ్యాష్‌బోర్డ్ (కూలీలను వెతకడం)
        </h3>
        <span style="font-size: 10px; background: #c8e6c9; color: #1b5e20; padding: 2px 7px; border-radius: 4px; font-weight: 700;">Live</span>
      </div>

      <div style="padding: 12px;">
        <form id="farmer-form" style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; gap: 6px;">
            <input type="text" id="f-name" placeholder="మీ పేరు (Farmer Name)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
            <input type="tel" id="f-phone" placeholder="ఫోన్ నంబర్" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          </div>

          <div style="display: flex; gap: 6px;">
            <input type="text" id="f-crop" placeholder="పంట (Cotton, Paddy...)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
            <input type="text" id="f-work" placeholder="పని (తీత, కోత...)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          </div>

          <div style="display: flex; gap: 6px;">
            <input type="number" id="f-count" placeholder="కూలీల సంఖ్య" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
            <input type="number" id="f-wage" placeholder="రోజు కూలీ (₹)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          </div>

          <button type="button" id="loc-btn" style="background: #f1f8e9; color: #2e7d32; border: 1px dashed #2e7d32; border-radius: 6px; padding: 7px; font-size: 12px; font-weight: 600; cursor: pointer;">
            📍 పొలం GPS లొకేషన్ సెట్ చేయండి
          </button>
          <span id="loc-status" style="font-size: 10px; color: #555; text-align: center;"></span>

          <!-- Small Compact Submit Widget Box -->
          <div style="display: flex; justify-content: center; margin-top: 4px;">
            <button type="submit" style="background: #2e7d32; color: #ffffff; border: none; border-radius: 6px; padding: 7px 22px; font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 5px rgba(46,125,50,0.3);">
              📢 సబ్మిట్ (Submit)
            </button>
          </div>
        </form>

        <!-- Accepted Labours Section -->
        <div style="margin-top: 12px; border-top: 1.5px dashed #c8e6c9; padding-top: 8px;">
          <h4 style="margin: 0 0 6px 0; font-size: 12px; color: #1b5e20;">👥 కన్ఫర్మ్ అయిన కూలీలు (${myAcceptedJobs.length}):</h4>
          <div id="accepted-list" style="display: flex; flex-direction: column; gap: 6px;">
            ${myAcceptedJobs.length === 0 ? `
              <div style="font-size: 11px; color: #777; text-align: center; padding: 6px;">కూలీలు యాక్సెప్ట్ చేయగానే వారి వివరాలు ఇక్కడ కనిపిస్తాయి.</div>
            ` : myAcceptedJobs.map(j => `
              <div style="border: 1px solid #c8e6c9; border-radius: 6px; padding: 8px; background: #f9fbf9;">
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <strong>👷 ${j.labourName}</strong>
                  <span style="color: #2e7d32; font-weight: bold;">₹${j.wage}</span>
                </div>
                <div style="font-size: 11px; color: #555; margin-top: 2px;">పని: ${j.crop} (${j.workType})</div>
                <div style="display: flex; gap: 5px; margin-top: 6px;">
                  <a href="tel:${j.labourPhone}" style="flex: 1; text-align: center; background: #e8f5e9; color: #2e7d32; text-decoration: none; border-radius: 4px; padding: 5px; font-size: 11px; font-weight: 600; border: 1px solid #a5d6a7;">📞 కాల్</a>
                  <a href="sms:${j.labourPhone}?body=${encodeURIComponent('నమస్తే, అగ్రీకనెక్ట్ పనికి బయలుదేరండి.')}" style="flex: 1; text-align: center; background: #fffde7; color: #f57f17; text-decoration: none; border-radius: 4px; padding: 5px; font-size: 11px; font-weight: 600; border: 1px solid #fff59d;">✉️ SMS</a>
                  <a href="https://wa.me/91${j.labourPhone}?text=${encodeURIComponent('నమస్తే, అగ్రీకనెక్ట్ పనికి ఎప్పుడు వస్తున్నారు?')}" target="_blank" style="flex: 1.2; text-align: center; background: #e8f8f0; color: #075e54; text-decoration: none; border-radius: 4px; padding: 5px; font-size: 11px; font-weight: 600; border: 1px solid #25d366;">💬 వాట్సాప్</a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;

  let farmCoords = { lat: 17.9784, lng: 79.5941 };

  document.getElementById("loc-btn")?.addEventListener("click", () => {
    const status = document.getElementById("loc-status");
    if (navigator.geolocation) {
      status.innerText = "GPS లొకేషన్ గుర్తిస్తోంది...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          farmCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          status.innerText = `✅ GPS సెట్ అయింది (${farmCoords.lat.toFixed(3)}, ${farmCoords.lng.toFixed(3)})`;
        },
        () => {
          status.innerText = "డీఫాల్ట్ GPS సెట్ అయింది.";
        }
      );
    }
  });

  document.getElementById("farmer-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const newJob = {
      id: "JOB-" + Date.now(),
      farmerName: document.getElementById("f-name").value,
      farmerPhone: document.getElementById("f-phone").value,
      crop: document.getElementById("f-crop").value,
      workType: document.getElementById("f-work").value,
      count: document.getElementById("f-count").value,
      wage: document.getElementById("f-wage").value,
      distanceKm: (Math.random() * 4 + 1.2).toFixed(1),
      lat: farmCoords.lat,
      lng: farmCoords.lng,
      status: "Open",
      labourName: "",
      labourPhone: ""
    };

    if (window.addAppJob) {
      window.addAppJob(newJob);
    }
    e.target.reset();
    renderFarmerWidget();
    if (window.renderLabourWidget) window.renderLabourWidget();
    alert("📢 పని కూలీల డ్యాష్‌బోర్డ్‌లో పోస్ట్ చేయబడింది!");
  });
}

window.renderFarmerWidget = renderFarmerWidget;
