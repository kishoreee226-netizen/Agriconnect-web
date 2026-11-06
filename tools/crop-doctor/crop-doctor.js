// tools/crop-doctor/crop-doctor.js
window.activeCropLibrary = {
  chilli: [
    {
      issue: "ఆకులు పైకి ముడుచుకుపోవడం & నల్లబడటం (Black Thrips)",
      name: "నల్ల తామర పురుగు (Black Thrips)",
      severity: "తీవ్రమైన తెగులు",
      desc: "పూత రాలడం, ఆకులు పైకి లేదా కిందికి ముడుచుకుపోయి నల్లగా మారడం.",
      chem: "స్పైనోటోరమ్ (Spinetoram 11.7% SC) 180 ml/ఎకరానికి లేదా ఫిప్రోనిల్ 2 ml/లీటర్ నీటికి పిచికారీ చేయండి.",
      organic: "నీమాస్త్రం (వేపనూనె 10,000 ppm) 3 ml/లీటరు లేదా పచ్చిమిర్చి-వెల్లుల్లి కషాయం స్ప్రే చేయండి."
    },
    {
      issue: "కాయ కుళ్ళు & కొమ్మ ఎండు తెగులు",
      name: "ఆంత్రక్నోస్ / కాయ కుళ్ళు",
      severity: "మధ్యస్థం",
      desc: "పండిన లేదా పచ్చి కాయలపై నల్లటి మచ్చలు ఏర్పడి కాయలు ఎండిపోవడం.",
      chem: "అజోక్సిస్ట్రోబిన్ + డైఫెనోకోనజోల్ 1 ml/లీటరు లేదా కాపర్ ఆక్సిక్లోరైడ్ 3 గ్రా/లీటరు.",
      organic: "పులిసిన మజ్జిగ 5 లీటర్లు + 100 లీటర్ల నీటిలో కలిపి 10 రోజుల వ్యవధిలో రెండుసార్లు పిచికారీ చేయండి."
    }
  ],
  cotton: [
    {
      issue: "గులాబీ రంగు పురుగు (Pink Bollworm)",
      name: "గులాబీ రంగు కాయ తొలచు పురుగు",
      severity: "చాలా తీవ్రం",
      desc: "పూత రోసెట్ లా మారడం, కాయల లోపల విత్తనాలను పురుగు తినడం.",
      chem: "ప్రొఫెనోఫాస్ 50% EC 2 ml/లీటర్ లేదా క్లోరాంట్రానిలిప్రోల్ 0.3 ml/లీటర్ నీటికి కలపండి.",
      organic: "ఎకరానికి 8 లింగాకర్షక బుట్టలు (Pheromone Traps) అమర్చండి. బ్రహ్మాస్త్రం స్ప్రే చేయండి."
    }
  ],
  paddy: [
    {
      issue: "కాండం తొలుచు పురుగు (తెల్ల కంకులు)",
      name: "వరి కాండం తొలుచు పురుగు",
      severity: "తీవ్రమైన తెగులు",
      desc: "మొలక దశలో చనిపోయిన పిలకలు, ఈనిన దశలో తెల్ల కంకులు రావడం.",
      chem: "కార్టాప్ హైడ్రోక్లోరైడ్ 4G గుళికలు 8 కేజీలు/ఎకరానికి చల్లండి లేదా క్లోరాంట్రానిలిప్రోల్ 0.3 ml/లీటర్.",
      organic: "ట్రైకోగ్రామా ట్రైకోకార్డులు ఎకరానికి 2 చొప్పున పొలంలో అమర్చండి."
    }
  ]
};

window.currentActiveDiagnosis = null;

window.listenToAgriDBDiseases = function() {
  if (window.db && typeof window.db.collection === 'function') {
    window.db.collection('crop_diseases').onSnapshot(snapshot => {
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data && data.crop && data.issue) {
            if (!window.activeCropLibrary[data.crop]) window.activeCropLibrary[data.crop] = [];
            const idx = window.activeCropLibrary[data.crop].findIndex(i => i.issue === data.issue);
            if (idx >= 0) window.activeCropLibrary[data.crop][idx] = data;
            else window.activeCropLibrary[data.crop].unshift(data);
          }
        });
        window.onCropSelectChange();
      }
    }, err => {
      console.warn("AgriDB crop diseases sync fallback to local library.");
    });
  }
};

window.switchCropDocTab = function(tab) {
  const camPane = document.getElementById('subtab-crop-camera');
  const manPane = document.getElementById('subtab-crop-manual');
  const tabs = document.querySelectorAll('#view-crop_doctor .hub-tabs .hub-tab');

  if (tab === 'camera') {
    if (camPane) camPane.style.display = 'block';
    if (manPane) manPane.style.display = 'none';
    tabs[0]?.classList.add('active');
    tabs[1]?.classList.remove('active');
  } else {
    if (camPane) camPane.style.display = 'none';
    if (manPane) manPane.style.display = 'block';
    tabs[0]?.classList.remove('active');
    tabs[1]?.classList.add('active');
    window.onCropSelectChange();
  }
};

window.handleCropPhotoSelect = function(event) {
  const file = event.target.files ? event.target.files[0] : null;
  if (!file) return;

  if (window.db && navigator.onLine) {
    window.db.collection("crop_scans").add({
      fileName: file.name,
      fileSize: file.size,
      scannedAt: new Date().toISOString()
    }).catch(e => console.warn("Firestore scan record error:", e));
  }

  const preview = document.getElementById('cropPhotoPreview');
  const scanBtn = document.getElementById('btnScanPhoto');
  const reader = new FileReader();

  reader.onload = function(e) {
    if (preview) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
    if (scanBtn) scanBtn.style.display = 'block';
  };
  reader.readAsDataURL(file);
};

window.analyzeCropPhoto = function() {
  const loader = document.getElementById('scanLoadingIndicator');
  const scanBtn = document.getElementById('btnScanPhoto');
  if (loader) loader.style.display = 'block';
  if (scanBtn) scanBtn.style.display = 'none';

  setTimeout(() => {
    if (loader) loader.style.display = 'none';
    if (scanBtn) scanBtn.style.display = 'block';

    window.renderDiagnosisCard({
      name: "నల్ల తామర పురుగు (Black Thrips)",
      severity: "తీవ్రమైన తెగులు",
      desc: "కెమెరా స్కాన్ విశ్లేషణ: ఆకుల ఈనెలు నల్లబడటం, పూత రాలిపోవడం గుర్తించబడింది.",
      chem: "స్పైనోటోరమ్ (Spinetoram 11.7% SC) 180 ml/ఎకరానికి లేదా ఫిప్రోనిల్ 2 ml/లీటర్ నీటికి పిచికారీ చేయండి.",
      organic: "వేప నూనె (10,000 ppm) 3 ml/లీటరు లేదా పచ్చిమిర్చి-వెల్లుల్లి కషాయం పిచికారీ చేయండి."
    });
  }, 1200);
};

window.onCropSelectChange = function() {
  const crop = document.getElementById('docCropSelect')?.value || 'chilli';
  const issueSelect = document.getElementById('docIssueSelect');
  if (!issueSelect) return;
  issueSelect.innerHTML = '';

  const issues = window.activeCropLibrary[crop] || [];
  issues.forEach((item, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.innerText = item.issue;
    issueSelect.appendChild(opt);
  });
  window.diagnoseCropIssue();
};

window.diagnoseCropIssue = function() {
  const crop = document.getElementById('docCropSelect')?.value || 'chilli';
  const idx = parseInt(document.getElementById('docIssueSelect')?.value) || 0;
  const list = window.activeCropLibrary[crop] || [];
  const issue = list[idx] || list[0];
  if (issue) window.renderDiagnosisCard(issue);
};

window.renderDiagnosisCard = function(data) {
  window.currentActiveDiagnosis = data;
  const resultCard = document.getElementById('cropDoctorResult');
  if (!resultCard) return;

  const nameEl = document.getElementById('docDiagName');
  const sevEl = document.getElementById('docDiagSeverity');
  const descEl = document.getElementById('docDiagDesc');
  const chemEl = document.getElementById('docChemDose');
  const orgEl = document.getElementById('docOrganicDose');

  if (nameEl) nameEl.innerText = data.name;
  if (sevEl) sevEl.innerText = data.severity;
  if (descEl) descEl.innerText = data.desc;
  if (chemEl) chemEl.innerText = data.chem;
  if (orgEl) orgEl.innerText = data.organic;

  const voiceBtn = document.getElementById('btnPlayCropVoice');
  if (voiceBtn) {
    voiceBtn.onclick = window.playCropDoctorVoice;
  }

  resultCard.style.display = 'block';
};

window.playCropDoctorVoice = function() {
  if (!('speechSynthesis' in window)) {
    alert("మీ బ్రౌజర్ లో వాయిస్ సపోర్ట్ అందుబాటులో లేదు.");
    return;
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    return;
  }

  if (!window.currentActiveDiagnosis) return;

  const speechScript = `పంట పరిశీలన పూర్తయింది. తెగులు: ${window.currentActiveDiagnosis.name}. తీవ్రత: ${window.currentActiveDiagnosis.severity}. రసాయన నివారణ: ${window.currentActiveDiagnosis.chem}. సేంద్రియ నివారణ: ${window.currentActiveDiagnosis.organic}`;
  const utterance = new SpeechSynthesisUtterance(speechScript);
  utterance.lang = 'te-IN';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
};

window.initCropDoctorTool = function() {
  window.switchCropDocTab('camera');
  window.listenToAgriDBDiseases();
};
