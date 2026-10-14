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
            <input type="number" id="f-count" placeholder="కూలీల సంఖ్య" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
            <input type="number" id="f-wage" placeholder="రోజు కూలీ (₹)" required style="flex: 1; padding: 7px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 12px; outline: none;" />
          </div>

                    <!-- Row 4: Stable Row (GPS click chesina Village button asalu kadaladhu) -->
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; box-sizing: border-box; margin-top: 6px; padding: 0 4px;">
            
            <!-- 1. Date Input (Fixed Width) -->
            <input 
              type="text" 
              id="f-date" 
              placeholder="📅 పని తేదీ" 
              onfocus="(this.type='date'); this.showPicker && this.showPicker();" 
              onblur="if(!this.value) this.type='text';" 
              required 
              style="width: 105px; min-width: 105px; max-width: 105px; height: 34px; padding: 0 4px; border: 1px solid #c8e6c9; border-radius: 6px; font-size: 11px; outline: none; background: #fff; box-sizing: border-box; cursor: pointer; text-align: center;" 
            />
            
            <!-- 2. GPS Button with Absolute Float Status (Width lock chesam kabatti pakkana vatini nettedhu) -->
            <div style="position: relative; width: 95px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0;">
              <button type="button" id="loc-btn" style="width: 100%; height: 34px; background: #f1f8e9; color: #2e7d32; border: 1px dashed #2e7d32; border-radius: 6px; padding: 0 4px; font-size: 10.5px; font-weight: 600; cursor: pointer; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 2px; box-sizing: border-box;">
                📍 పొలం GPS
              </button>
              <span id="loc-status" style="position: absolute; top: 36px; left: 50%; transform: translateX(-50%); font-size: 8px; color: #2e7d32; text-align: center; line-height: 1.1; white-space: nowrap; pointer-events: none;"></span>
            </div>

            <!-- 3. Village Button (Right border margin tho fix ga untundhi) -->
            <button type="button" id="f-village-btn" style="height: 34px; background: #e8f5e9; color: #1b5e20; border: 1px solid #a5d6a7; border-radius: 6px; padding: 0 8px; font-size: 11px; font-weight: bold; cursor: pointer; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 3px; box-sizing: border-box; margin-right: 4px; flex-shrink: 0;">
              🏛️ Hyderabad
            </button>

          </div>


          <!-- Row 5: Compact Submit Button -->
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
            ${myAcceptedJobs.length > 2 ? '<span style="font-size: 10px; color: #2e7d32; font-weight: 600;">👇 scroll చేయండి</span>' : ''}
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

  // Profile data prefill cheyadam
  if (typeof prefillFarmerFormDefaults === "function") {
    prefillFarmerFormDefaults();
  }

  let farmCoords = { lat: 17.9784, lng: 79.5941 };

  document.getElementById("loc-btn")?.addEventListener("click", () => {
    const s = document.getElementById("loc-status");
    if (navigator.geolocation) {
      if (s) s.innerText = "GPS వెతుకుతోంది...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          farmCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (s) s.innerText = `✅ GPS set అయింది (${farmCoords.lat.toFixed(3)}, ${farmCoords.lng.toFixed(3)})`;
        },
        () => { 
          if (s) s.innerText = "default GPS set అయింది."; 
        }
      );
    }
  });

  document.getElementById("farmer-form")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const villageText = document.getElementById("f-village-btn")?.textContent?.replace(/[🏛️🏘️\s]/g, '') || 
                        window.AppState?.userProfile?.village || "సమీప గ్రామం";

    const newJob = {
      id: "JOB-" + Date.now(),
      farmerName: document.getElementById("f-name").value,
      farmerPhone: document.getElementById("f-phone").value,
      crop: document.getElementById("f-crop").value,
      workType: document.getElementById("f-work").value,
      count: document.getElementById("f-count").value,
      wage: document.getElementById("f-wage").value,
      date: document.getElementById("f-date").value,
      village: villageText,
      distanceKm: "2.5",
      lat: farmCoords.lat,
      lng: farmCoords.lng,
      status: "Open",
      labourName: "",
      labourPhone: ""
    };

    // Global AgriState లేదా LocalStorage లో జాబ్ సేవ్ చేయడం
    if (window.AgriState && typeof window.AgriState.addJob === "function") {
      window.AgriState.addJob(newJob);
    } else {
      let savedJobs = [];
      try {
        savedJobs = JSON.parse(localStorage.getItem("agri_jobs") || "[]");
      } catch (err) {}
      savedJobs.unshift(newJob);
      localStorage.setItem("agri_jobs", JSON.stringify(savedJobs));
    }

    // Input fields clear cheyadam (Name, Phone, Village thappinchi)
    document.getElementById("f-crop").value = "";
    document.getElementById("f-work").value = "";
    document.getElementById("f-count").value = "";
    document.getElementById("f-wage").value = "";
    const dateInput = document.getElementById("f-date");
    if (dateInput) {
      dateInput.value = "";
      dateInput.type = "text";
    }

    // Dashboards refresh cheyadam
    renderFarmerWidget();
    if (typeof renderLabourWidget === "function") {
      renderLabourWidget();
    }

    // Voice announcement (Optional)
    if (typeof speakTeluguText === "function") {
      speakTeluguText("పని వివరాలు విజయవంతంగా పోస్ట్ చేయబడ్డాయి.");
    } else {
      alert("📢 పని కూలీల Dashboard లో live గా post చేయబడింది!");
    }
  });
}

window.renderFarmerWidget = renderFarmerWidget;
