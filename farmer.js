// farmer.js - రైతు Dashboard (Light Green Header & Compact Submit)

function renderFarmerWidget() {
  const container = document.getElementById("farmer-post-container");
  if (!container) return;

  const jobs = window.AgriState ? window.AgriState.getJobs() : [];
  const myAcceptedJobs = jobs.filter(j => j.status === "Confirmed");

  container.innerHTML = `
    <div style="background: #ffffff; border: 1.5px solid #81c784; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 8px rgba(0,0,0,0.06);">
      
      <!-- Light Green Header -->
      <div style="background: #e8f5e9; border-bottom: 1.5px solid #c8e6c9; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: #1b5e20; font-size: 14px; font-weight: 700;">
          👨‍🌾 రైతు Dashboard (కూలీలను వెతకడం)
        </h3>
        <span style="font-size: 10px; background: #c8e6c9; color: #1b5e20; padding: 2px 7px; border-radius: 4px; font-weight: 700;">Live</span>
      </div>

      <div style="padding: 12px;">
        <form id="farmer-form" style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; gap: 6px;">
            <input type="text" id="f-name" placeholder="మీ పేరు" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
            <input type="tel" id="f-phone" placeholder="ఫోన్ నంబర్" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          </div>

          <div style="display: flex; gap: 6px;">
            <input type="text" id="f-crop" placeholder="పంట" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
            <input type="text" id="f-work" placeholder="పని" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          </div>
    <div style="display: flex; gap: 6px; margin-top: 6px;">
      <input type="number" id="f-count" placeholder="కూలీల సంఖ్య"
 required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
      <input type="number" id="f-wage" placeholder="రోజు కూలీ (₹)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
    </div>
                    <!-- Row 4: Box lopala "📅 పని తేదీ", click chesthe calendar, compact width + GPS + Village -->
              <div style="display: flex; gap: 6px; align-items: center; justify-content: space-between; margin-top: 6px;">
                <input 
                  type="text" 
                  id="f-date" 
                  placeholder="📅 పని తేదీ" 
                  onfocus="(this.type='date'); this.showPicker && this.showPicker();" 
                  onblur="if(!this.value) this.type='text';" 
                  required 
                  style="width: 125px; height: 34px; padding: 0 8px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 11px; outline: none; background: #fff; box-sizing: border-box; cursor: pointer; text-align: center;" 
                />
                
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <button type="button" id="loc-btn" style="height: 34px; background: #f1f8e9; color: #2e7d32; border: 1px dashed #2e7d32; border-radius: 6px; padding: 0 8px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 3px;">
                    📍 పొలం GPS
                  </button>
                  <span id="loc-status" style="font-size: 8px; color: #555; text-align: center; line-height: 1; margin-top: 2px;"></span>
                </div>

                <button type="button" id="f-village-btn" style="height: 34px; background: #e8f5e9; color: #1b5e20; border: 1px solid #a5d6a7; border-radius: 6px; padding: 0 10px; font-size: 11px; font-weight: bold; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 3px;">
                  🏛️ ఊరు
                </button>
              </div>

               <!-- Row 5: Compact Submit Button (Center aligned, Fit width) -->
              <div style="margin-top: 10px; display: flex; justify-content: center;">
                <button type="submit" style="width: auto; padding: 8px 18px; background: #2e7d32; color: #ffffff; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 5px rgba(46,125,50,0.25); white-space: nowrap;">
                  📢 Submit కూలీల కోసం
                </button>
              </div>

        </form>

        <!-- Accepted Labours Section -->
        <div style="margin-top: 12px; border-top: 1.5px dashed #c8e6c9; padding-top: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
  <h4 style="margin: 0; font-size: 12px; color: #1b5e20;">👥 Confirm అయిన కూలీలు (${myAcceptedJobs.length}):</h4>
  ${myAcceptedJobs.length > 2 ? '<span style="font-size: 10px; color: #2e7d32; font-weight: 600;">👇 scrole చేయండి</span>' : ''}
</div>
<div id="accepted-list" class="custom-scroll" style="display: flex; flex-direction: column; gap: 6px; max-height: 135px !important; overflow-y: scroll !important; -webkit-overflow-scrolling: touch; padding-right: 4px; min-height: 0;">

            ${myAcceptedJobs.length === 0 ? `
              <div style="font-size: 11px; color: #777; text-align: center; padding: 6px;">కూలీలు accept చేయగానే వారి వివరాలు ఇక్కడ కనిపిస్తాయి.</div>
            ` : myAcceptedJobs.map(j => `
              <div style="border: 1px solid #c8e6c9; border-radius: 6px; padding: 8px; background: #f9fbf9;">
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <strong>👷 ${j.labourName}</strong>
                  <span style="color: #2e7d32; font-weight: bold;">₹${j.wage}</span>
                </div>
                <div style="font-size: 11px; color: #555; margin-top: 2px;">పని: ${j.crop} (${j.workType})</div>
                <div style="display: flex; gap: 5px; margin-top: 6px;">
                  <a href="tel:${j.labourPhone}" style="flex: 1; text-align: center; background: #e8f5e9; color: #2e7d32; text-decoration: none; border-radius: 4px; padding: 5px; font-size: 11px; font-weight: 600; border: 1px solid #a5d6a7;">📞 కాల్</a>
                  <a href="sms:${j.labourPhone}?body=నమస్తే" style="flex: 1; text-align: center; background: #fffde7; color: #f57f17; text-decoration: none; border-radius: 4px; padding: 5px; font-size: 11px; font-weight: 600; border: 1px solid #fff59d;">✉️ SMS</a>
                  <a href="https://wa.me/91${j.labourPhone}" target="_blank" style="flex: 1.2; text-align: center; background: #e8f8f0; color: #075e54; text-decoration: none; border-radius: 4px; padding: 5px; font-size: 11px; font-weight: 600; border: 1px solid #25d366;">💬 వాట్సాప్</a>
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
    const s = document.getElementById("loc-status");
    if (navigator.geolocation) {
      s.innerText = "GPS వెతుకుతోంది...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          farmCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          s.innerText = `✅ GPS set అయింది (${farmCoords.lat.toFixed(3)}, ${farmCoords.lng.toFixed(3)})`;
        },
        () => { s.innerText = "default GPS set అయింది."; }
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
      distanceKm: "2.8",
      lat: farmCoords.lat,
      lng: farmCoords.lng,
      status: "Open",
      labourName: "",
      labourPhone: ""
    };

    if (window.AgriState) window.AgriState.addJob(newJob);
    e.target.reset();
    renderFarmerWidget();
    if (typeof renderLabourWidget === "function") renderLabourWidget();
    alert("📢 పని కూలీల dashboard లో post చేయబడింది!");
  });
}

window.renderFarmerWidget = renderFarmerWidget;
