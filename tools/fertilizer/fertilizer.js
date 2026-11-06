// tools/fertilizer/fertilizer.js
window.switchFertSubTab = function(subTab) {
  const panes = document.querySelectorAll('.fert-subtab-pane');
  panes.forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
  });

  const tabs = document.querySelectorAll('#view-fertilizer .hub-tabs .hub-tab');
  tabs.forEach(t => t.classList.remove('active'));

  if (subTab === 'fert') {
    const p = document.getElementById('subtab-fert');
    if (p) { p.style.display = 'block'; p.classList.add('active'); }
    if (tabs[0]) tabs[0].classList.add('active');
    window.runFertilizerCalc();
  } else if (subTab === 'seed') {
    const p = document.getElementById('subtab-seed');
    if (p) { p.style.display = 'block'; p.classList.add('active'); }
    if (tabs[1]) tabs[1].classList.add('active');
    window.runSeedCalc();
  } else if (subTab === 'spray') {
    const p = document.getElementById('subtab-spray');
    if (p) { p.style.display = 'block'; p.classList.add('active'); }
    if (tabs[2]) tabs[2].classList.add('active');
    window.runSprayCalc();
  }
};

window.runFertilizerCalc = function() {
  const crop = document.getElementById('calcCropSelect')?.value || 'paddy';
  const acres = parseFloat(document.getElementById('calcAcresInput')?.value || 1);
  const dapEl = document.getElementById('dapVal');
  const ureaEl = document.getElementById('ureaVal');
  const potashEl = document.getElementById('potashVal');
  const s1Title = document.getElementById('stage1Title');
  const s1Desc = document.getElementById('stage1Desc');
  const s2Title = document.getElementById('stage2Title');
  const s2Desc = document.getElementById('stage2Desc');
  if (!dapEl) return;

  let dap = 1.0, urea = 2.2, potash = 0.8;

  if (crop === 'paddy') {
    dap = 1.0; urea = 2.2; potash = 0.8;
    if (s1Title) s1Title.innerText = 'దశ 1: నాట్లకు ముందు (Basal)';
    if (s1Desc) s1Desc.innerText = 'పూర్తి DAP + సగం పొటాష్ వేయాలి.';
    if (s2Title) s2Title.innerText = 'దశ 2: 25 రోజుల తర్వాత (Tillering)';
    if (s2Desc) s2Desc.innerText = 'మొదటి విడత యూరియా వేయాలి.';
  } else if (crop === 'cotton') {
    dap = 1.5; urea = 3.0; potash = 1.2;
    if (s1Title) s1Title.innerText = 'దశ 1: విత్తే సమయంలో (Basal)';
    if (s1Desc) s1Desc.innerText = 'DAP మరియు కాంప్లెక్స్ బేసల్ డోస్ వేయాలి.';
    if (s2Title) s2Title.innerText = 'దశ 2: పూత & కాయ దశ (Flowering)';
    if (s2Desc) s2Desc.innerText = 'యూరియా + పొటాష్ 3 విడతలుగా సమపాళ్లలో అందించాలి.';
  } else if (crop === 'chilli') {
    dap = 2.0; urea = 4.0; potash = 2.0;
    if (s1Title) s1Title.innerText = 'దశ 1: నాట్లు వేసిన 15 రోజులకు';
    if (s1Desc) s1Desc.innerText = 'బేసల్ డోస్ ఎరువులు వేయాలి.';
    if (s2Title) s2Title.innerText = 'దశ 2: ప్రతి 20 రోజులకు ఒకసారి';
    if (s2Desc) s2Desc.innerText = 'డ్రిప్ ద్వారా 19:19:19 లేదా యూరియా టాప్ డ్రెస్సింగ్ చేయాలి.';
  } else if (crop === 'maize') {
    dap = 1.2; urea = 2.8; potash = 1.0;
    if (s1Title) s1Title.innerText = 'దశ 1: విత్తే సమయంలో (Basal)';
    if (s1Desc) s1Desc.innerText = 'మొత్తం DAP + 30% యూరియా అందించాలి.';
    if (s2Title) s2Title.innerText = 'దశ 2: మోకాలి ఎత్తు దశ (Knee-high)';
    if (s2Desc) s2Desc.innerText = 'రెండవ విడత యూరియా వేయాలి.';
  }

  dapEl.innerText = (dap * acres).toFixed(1);
  ureaEl.innerText = (urea * acres).toFixed(1);
  potashEl.innerText = (potash * acres).toFixed(1);
};

window.runSeedCalc = function() {
  const crop = document.getElementById('seedCropSelect')?.value || 'paddy';
  const acres = parseFloat(document.getElementById('seedAcresInput')?.value || 1);
  const resVal = document.getElementById('seedResultVal');
  const resDesc = document.getElementById('seedResultDesc');
  if (!resVal) return;

  if (acres <= 0) {
    resVal.innerText = '--';
    if (resDesc) resDesc.innerText = 'ఎకరాల విస్తీర్ణం నమోదు చేయండి.';
    return;
  }

  let amount = '';
  let note = '';

  if (crop === 'paddy') {
    amount = `${(acres * 25).toFixed(1)} - ${(acres * 30).toFixed(1)} కేజీలు`;
    note = 'వరి: సన్న రకాలు 20-25 kg, లావు రకాలు 25-30 kg/ఎకరానికి';
  } else if (crop === 'cotton') {
    const pkts = Math.round(acres * 2);
    amount = `${pkts} ప్యాకెట్లు (సుమారు ${(acres * 0.9).toFixed(1)} kg)`;
    note = 'పత్తి: ఎకరానికి 2 ప్యాకెట్లు (BG-II హైబ్రిడ్ 450 గ్రా/ప్యాకెట్)';
  } else if (crop === 'chilli') {
    amount = `${Math.round(acres * 80)} - ${Math.round(acres * 100)} గ్రాములు`;
    note = 'మిర్చి: నారు పోసే హైబ్రిడ్ విత్తనాలు 80-100 గ్రా/ఎకరానికి';
  } else if (crop === 'maize') {
    amount = `${(acres * 7.5).toFixed(1)} - ${(acres * 8).toFixed(1)} కేజీలు`;
    note = 'మొక్కజొన్న: సింగిల్ క్రాస్ హైబ్రిడ్లు 7.5-8 kg/ఎకరానికి';
  }

  resVal.innerText = amount;
  if (resDesc) resDesc.innerText = note;
};

window.runSprayCalc = function() {
  const tank = parseFloat(document.getElementById('sprayTankSize')?.value || 16);
  const dose = parseFloat(document.getElementById('sprayDosePerLiter')?.value || 0);
  const unit = document.getElementById('sprayUnitSelect')?.value || 'ml';
  const resVal = document.getElementById('sprayResultVal');
  if (!resVal) return;

  if (dose <= 0) {
    resVal.innerText = '--';
    return;
  }

  const total = (tank * dose).toFixed(1);
  resVal.innerText = `${total} ${unit}`;
};
