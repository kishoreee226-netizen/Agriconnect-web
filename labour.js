// labour.js - Koolila Dashboard (Duty Switch, Live Availability, Auto-Hide & Booking)

let cachedLabourProfiles = [];
let isFirebaseLabourSubscribed = false;

// Global Filters
let activeSkillFilter = "all";
let activeLabourRangeFilter = "all";
let activeGangFilter = "all";
let activeWageFilter = "all";
let activeTransportFilterOpt = "all";

function initLabourDataListener() {
  if (isFirebaseLabourSubscribed) return;

  if (window.db) {
    isFirebaseLabourSubscribed = true;
    window.db.collection("labour_profiles")
      .onSnapshot((snapshot) => {
        const list = [];
        snapshot.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        cachedLabourProfiles = list;
        renderLabourWidget();
      }, (err) => {
        console.warn("Firestore error:", err);
        renderLabourWidget();
      });
  } else {
    // Local fallback
    const myProf = (typeof getLabourProfile === "function") ? getLabourProfile() : null;
    if (myProf) {
      cachedLabourProfiles = [{ id: "my_profile", ...myProf, status: myProf.isDutyOn ? "Available" : "Offline" }];
    }
    renderLabourWidget();
  }
}

function renderLabourWidget() {
  const container = document.getElementById("labour-jobs-container");
  if (!container) return;

  if (!isFirebaseLabourSubscribed && window.db) {
    initLabourDataListener();
    return;
  }

  const myProf = (typeof getLabourProfile === "function") ? getLabourProfile() : { isDutyOn: true };

  // Rhythu ki kevalam Duty ON lo undi, status "Available" ga unna vallu mathrame kanipistharu!
  const availableLabours = cachedLabourProfiles.filter(l => {
    if (!l.isDutyOn || l.status !== "Available") return false;

    // Filters Matching
    let skillMatch = true;
    if (activeSkillFilter !== "all") {
      const skillsArr = l.skills || [];
      skillMatch = skillsArr.some(s => s.includes(activeSkillFilter));
    }

    let rangeMatch = true;
    const dist = parseFloat(l.distanceKm || "2.0");
    if (activeLabourRangeFilter === "village") rangeMatch = dist <= 2.5;
    else if (activeLabourRangeFilter === "5") rangeMatch = dist <= 5.0;
    else if (activeLabourRangeFilter === "10") rangeMatch = dist <= 10.0;

    let gangMatch = true;
    const count = parseInt(l.gangCount || 1);
    if (activeGangFilter === "small") gangMatch = count <= 5;
    else if (activeGangFilter === "medium") gangMatch = count >= 6 && count <= 10;
    else if (activeGangFilter === "large") gangMatch = count > 10;

    let wageMatch = true;
    const wage = parseFloat(l.wage || 450);
    if (activeWageFilter === "low") wageMatch = wage <= 400;
    else if (activeWageFilter === "mid") wageMatch = wage > 400 && wage <= 600;
    else if (activeWageFilter === "high") wageMatch = wage > 600;

    let transMatch = true;
    if (activeTransportFilterOpt === "own") transMatch = l.ownTransport === true;
    else if (activeTransportFilterOpt === "needed") transMatch = l.ownTransport !== true;

    return skillMatch && rangeMatch && gangMatch && wageMatch && transMatch;
  });

  container.innerHTML = `
    <div class="labour-card">
      
      <!-- Top Control Bar: Duty Switch & Profile Edit Button -->
      <div style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:8px; padding:10px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <span style="font-size:12px; font-weight:bold; color:#2e7d32;">నా డ్యూటీ స్టేటస్:</span>
          <button onclick="toggleLabourDutyStatus()" style="margin-left:6px; padding:4px 10px; border-radius:14px; border:none; font-size:11px; font-weight:bold; cursor:pointer; background:${myProf.isDutyOn ? '#2e7d32' : '#c62828'}; color:#fff;">
            ${myProf.isDutyOn ? '🟢 డ్యూటీ ON (లైవ్)' : '🔴 డ్యూటీ OFF (విశ్రాంతి)'}
          </button>
        </div>
        <button onclick="openLabourProfileModal()" style="background:#0288d1; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">
          ⚙️ పనులు / ప్రొఫైల్ మార్చుకోండి
        </button>
      </div>

      <!-- Filters Section -->
      <div class="labour-filter-bar" style="background:#e1f5fe; padding:10px; border-radius:8px; margin-bottom:12px; border:1px solid #b3e5fc;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:bold; color:#0277bd; white-space:nowrap;">🎯 కూలీల ఫిల్టర్లు:</span>
          
          <div style="display:flex; align-items:center; gap:6px;">
            <select onchange="applyAdvLabourFilter('range', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #81d4fa; font-size:11px; background:#fff; font-weight:600; color:#0277bd; outline:none; max-width:140px;">
              <option value="all" ${activeLabourRangeFilter === 'all' ? 'selected' : ''}>📍 పరిధి (అన్నీ)</option>
              <option value="village" ${activeLabourRangeFilter === 'village' ? 'selected' : ''}>🏡 నా గ్రామం (2.5km)</option>
              <option value="5" ${activeLabourRangeFilter === '5' ? 'selected' : ''}>⚡ 5 కి.మీ లోపు</option>
              <option value="10" ${activeLabourRangeFilter === '10' ? 'selected' : ''}>🚶 10 కి.మీ లోపు</option>
            </select>

            <span style="font-size:11px; background:#0288d1; color:#fff; padding:3px 8px; border-radius:12px; font-weight:bold; white-space:nowrap;">
              ${availableLabours.length} బృందాలు లభ్యం
            </span>
          </div>
        </div>

        <!-- 4 Advance Filters (2x2 Grid) -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
          <select onchange="applyAdvLabourFilter('skill', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #81d4fa; font-size:11px; background:#fff; font-weight:600; color:#0277bd; outline:none;">
            <option value="all" ${activeSkillFilter === 'all' ? 'selected' : ''}>🛠️ అన్ని పనులు</option>
            <option value="నాట్లు" ${activeSkillFilter === 'నాట్లు' ? 'selected' : ''}>🌱 నాట్లు వేయడం</option>
            <option value="కలుపు" ${activeSkillFilter === 'కలుపు' ? 'selected' : ''}>🌿 కలుపు తీత</option>
            <option value="కోత" ${activeSkillFilter === 'కోత' ? 'selected' : ''}>🌾 పంట కోత</option>
            <option value="స్ప్రే" ${activeSkillFilter === 'స్ప్రే' ? 'selected' : ''}>🚜 స్ప్రేయింగ్/మందు</option>
            <option value="పత్తి" ${activeSkillFilter === 'పత్తి' ? 'selected' : ''}>☁️ పత్తి ఏరడం</option>
          </select>

          <select onchange="applyAdvLabourFilter('gang', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #81d4fa; font-size:11px; background:#fff; font-weight:600; color:#0277bd; outline:none;">
            <option value="all" ${activeGangFilter === 'all' ? 'selected' : ''}>👥 బృందం (అన్నీ)</option>
            <option value="small" ${activeGangFilter === 'small' ? 'selected' : ''}>👤 1-5 మంది కూలీలు</option>
            <option value="medium" ${activeGangFilter === 'medium' ? 'selected' : ''}>👥 6-10 మంది బృందం</option>
            <option value="large" ${activeGangFilter === 'large' ? 'selected' : ''}>👨‍👩‍👧‍👦 10+ పెద్ద గ్యాంగ్</option>
          </select>

          <select onchange="applyAdvLabourFilter('wage', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #81d4fa; font-size:11px; background:#fff; font-weight:600; color:#0277bd; outline:none;">
            <option value="all" ${activeWageFilter === 'all' ? 'selected' : ''}>💰 కూలీ రేటు (అన్నీ)</option>
            <option value="low" ${activeWageFilter === 'low' ? 'selected' : ''}>₹400 లోపు</option>
            <option value="mid" ${activeWageFilter === 'mid' ? 'selected' : ''}>₹400 - ₹600</option>
            <option value="high" ${activeWageFilter === 'high' ? 'selected' : ''}>₹600 పైబడి</option>
          </select>

          <select onchange="applyAdvLabourFilter('trans', this.value)" style="padding:4px 6px; border-radius:6px; border:1px solid #81d4fa; font-size:11px; background:#fff; font-weight:600; color:#0277bd; outline:none;">
            <option value="all" ${activeTransportFilterOpt === 'all' ? 'selected' : ''}>🛵 రవాణా (అన్నీ)</option>
            <option value="own" ${activeTransportFilterOpt === 'own' ? 'selected' : ''}>🏍️ సొంత బండి</option>
            <option value="needed" ${activeTransportFilterOpt === 'needed' ? 'selected' : ''}>🛺 రవాణా అవసరం</option>
          </select>
        </div>
      </div>

      <!-- Live Available Labour Cards List -->
      <div class="labour-scroll labour-scroll-container">
        ${availableLabours.length === 0 ? `
          <div style="text-align:center; padding:18px; color:#555; font-size:13px; background:#fff; border-radius:8px; border:1px dashed #90caf9;">
            📢 ప్రస్తుతం ఈ ఫిల్టర్లలో కూలీలు ఎవరూ అందుబాటులో (డ్యూటీ ఆన్ చేసి) లేరు.
          </div>
        ` : availableLabours.map(lab => {
          const skillsListText = (lab.skills || ["వ్యవసాయ పనులు"]).join(", ");
          return `
            <div class="job-card job-item-card" style="margin-bottom:10px;">
              <div class="job-item-top">
                <div style="flex: 1;">
                  <strong class="job-item-title" style="color:#0277bd;">👷 ${lab.name} (బృందం: ${lab.gangCount || 1} మంది)</strong>
                  <div class="job-farmer-meta" style="margin-top:2px;">
                    📍 గ్రామం: <b>${lab.village}</b> \vert{} 🛵 <b>${lab.ownTransport ? 'సొంత బండి ఉంది' : 'రవాణా కావాలి'}</b>
                  </div>
                  <div style="font-size:11px; color:#37474f; margin-top:4px;">
                    🛠️ <b>చేసే పనులు:</b> <span style="color:#00796b;">${skillsListText}</span>
                  </div>
                </div>
                <div class="job-item-pricing">
                  <span class="job-wage-amount">₹${lab.wage || 450}/రోజు</span>
                  <div class="job-distance-tag">🟢 లభ్యం (Live)</div>
                </div>
              </div>

              <!-- Action: Farmer Request Button -->
              <div style="margin-top:8px; display:flex; gap:6px;">
                <button onclick="requestLabour('${lab.id}', '${lab.name}', '${lab.phone}')" style="flex:1; background:#2e7d32; color:#fff; border:none; padding:7px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer;">
                  📩 పనికి పిలవండి (Request)
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

// Rhythu Request Cheyagane Kooli Book avvadam & Hide avvadam
window.requestLabour = function(labourId, labourName, labourPhone) {
  const farmerName = (window.AppState && window.AppState.userProfile) ? window.AppState.userProfile.name : "రైతు";
  
  if (!confirm(`${labourName} బృందాన్ని పనికి పిలవాలనుకుంటున్నారా?`)) return;

  if (window.db && labourId && !labourId.startsWith("my_")) {
    window.db.collection("labour_profiles").doc(labourId).update({
      status: "Booked",
      bookedBy: farmerName,
      bookedAt: Date.now()
    }).then(() => {
      alert(`🎉 ${labourName} కి సమాచారం అందింది! వారు పనికి ఒప్పుకున్నారు. ఇతర రైతులకు ఈ వివరాలు తాత్కాలికంగా దాచబడతాయి.`);
    });
  } else {
    const l = cachedLabourProfiles.find(x => x.id === labourId);
    if (l) {
      l.status = "Booked";
      l.bookedBy = farmerName;
      renderLabourWidget();
      alert(`🎉 ${labourName} పనికి ఒప్పుకున్నారు! వివరాలు సేవ్ అయ్యాయి.`);
    }
  }

  if (typeof speakTeluguText === "function") {
    speakTeluguText(`${labourName} పనికి ఖరారయ్యారు.`);
  }
};

window.applyAdvLabourFilter = function(key, val) {
  if (key === 'range') activeLabourRangeFilter = val;
  if (key === 'skill') activeSkillFilter = val;
  if (key === 'gang') activeGangFilter = val;
  if (key === 'wage') activeWageFilter = val;
  if (key === 'trans') activeTransportFilterOpt = val;
  renderLabourWidget();
};

initLabourDataListener();
window.renderLabourWidget = renderLabourWidget;
