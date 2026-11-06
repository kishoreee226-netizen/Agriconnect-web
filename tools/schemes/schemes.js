// tools/schemes/schemes.js
const fallbackSchemes = [
  {
    title: "రైతు భరోసా (తెలంగాణ)",
    badge: "ఆర్థిక సాయం",
    desc: "ఎకరానికి ₹7,500 చొప్పున ఏడాదికి రెండు విడతల్లో ₹15,000 పంట పెట్టుబడి సాయం.",
    docReq: "పట్టాదారు పాస్ బుక్, ఆధార్ కార్డు, బ్యాంక్ ఖాతా",
    status: "త్వరలో నిధుల విడుదల"
  },
  {
    title: "TSMIP మైక్రో ఇరిగేషన్ (డ్రిప్ & స్ప్రింక్లర్)",
    badge: "90% - 100% రాయితీ",
    desc: "చిన్న/సన్నకారు రైతులకు 90%, SC/ST రైతులకు 100% సబ్సిడీతో డ్రిప్ యూనిట్లు.",
    docReq: "పాస్ బుక్ జిరాక్స్, ఆధార్, విద్యుత్ సర్వీస్ నంబర్",
    status: "దరఖాస్తులు స్వీకరణ"
  },
  {
    title: "పీఎం కుసుమ్ (PM-KUSUM) సోలార్ పంపులు",
    badge: "సోలార్ పవర్",
    desc: "కరెంట్ కనెక్షన్ లేని వ్యవసాయ బోర్లకు 60% సబ్సిడీతో సోలార్ పంపింగ్ వ్యవస్థలు.",
    docReq: "భూమి రికార్డులు, బోర్ వెల్ ధ్రువీకరణ",
    status: "యాక్టివ్ పోర్టల్"
  }
];

window.initSchemesTool = function() {
  window.listenToRealtimeSchemes();
  window.calcSubsidyEstimate();
};

window.switchSchemesSubTab = function(tab) {
  const alertsPane = document.getElementById('subtab-schemes-alerts');
  const calcPane = document.getElementById('subtab-schemes-calc');
  const tabs = document.querySelectorAll('#view-schemes .hub-tabs .hub-tab');

  if (tab === 'alerts') {
    if (alertsPane) alertsPane.style.display = 'block';
    if (calcPane) calcPane.style.display = 'none';
    tabs[0]?.classList.add('active');
    tabs[1]?.classList.remove('active');
  } else {
    if (alertsPane) alertsPane.style.display = 'none';
    if (calcPane) calcPane.style.display = 'block';
    tabs[0]?.classList.remove('active');
    tabs[1]?.classList.add('active');
    window.calcSubsidyEstimate();
  }
};

window.listenToRealtimeSchemes = function() {
  const container = document.getElementById('schemesListContainer');
  if (!container) return;

  if (window.db && typeof window.db.collection === 'function') {
    window.db.collection('govt_schemes')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        if (!snapshot.empty) {
          const liveList = [];
          snapshot.forEach(doc => liveList.push(doc.data()));
          renderSchemesCards(liveList);
        } else {
          renderSchemesCards(fallbackSchemes);
        }
      }, err => {
        console.warn("AgriDB schemes live stream offline, showing verified guidelines:", err);
        renderSchemesCards(fallbackSchemes);
      });
  } else {
    renderSchemesCards(fallbackSchemes);
  }
};

function renderSchemesCards(list) {
  const container = document.getElementById('schemesListContainer');
  if (!container) return;
  container.innerHTML = '';

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'demo-card-item mb-8';
    card.innerHTML = `
      <div class="scheme-card-header">
        <b class="scheme-card-title">${item.title}</b>
        <span class="badge-tag badge-purple">${item.badge || 'పథకం'}</span>
      </div>
      <div class="scheme-desc-text">${item.desc}</div>
      <div class="card-location-text">📄 కావలసినవి: <b>${item.docReq || 'ఆధార్, పట్టాదారు పాస్ బుక్'}</b></div>
      <div class="scheme-status-lbl">స్థితి: ${item.status || 'యాక్టివ్'}</div>
    `;
    container.appendChild(card);
  });
}

window.calcSubsidyEstimate = function() {
  const cat = document.getElementById('subFarmerCat')?.value || 'small';
  const equip = document.getElementById('subEquipType')?.value || 'drip';
  const acres = parseFloat(document.getElementById('subAcres')?.value) || 1;

  let unitCost = 55000;
  if (equip === 'sprinkler') unitCost = 25000;
  else if (equip === 'tarpaulin') unitCost = 3500;
  else if (equip === 'rotavator') unitCost = 110000;

  const totalCost = unitCost * acres;
  let subsidyRate = 0.90;

  if (cat === 'sc_st') {
    subsidyRate = (equip === 'drip' || equip === 'sprinkler') ? 1.0 : 0.90;
  } else if (cat === 'general') {
    subsidyRate = 0.80;
  }

  const govtShare = totalCost * subsidyRate;
  const farmerShare = totalCost - govtShare;

  const totalEl = document.getElementById('subTotalCost');
  const govtEl = document.getElementById('subGovtShare');
  const farmerEl = document.getElementById('subFarmerShare');
  const badgeEl = document.getElementById('subPercentBadge');

  if (totalEl) totalEl.innerText = `₹${Math.round(totalCost).toLocaleString('en-IN')}`;
  if (govtEl) govtEl.innerText = `₹${Math.round(govtShare).toLocaleString('en-IN')}`;
  if (farmerEl) farmerEl.innerText = `₹${Math.round(farmerShare).toLocaleString('en-IN')}`;

  if (badgeEl) {
    const pct = Math.round(subsidyRate * 100);
    badgeEl.innerHTML = `ప్రభుత్వ సబ్సిడీ: <b>${pct}%</b> | రైతు వాటా: <b>${100 - pct}%</b>`;
  }
};
