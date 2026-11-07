// menu/menu.js

// 1. Drawer open & close handlers
window.openAgriMenu = function() {
  const overlay = document.getElementById('agriMenuOverlay');
  const panel = document.getElementById('agriDrawerPanel');
  if (overlay && panel) {
    overlay.classList.add('active');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open-freeze');
  }
};

window.closeAgriMenu = function() {
  const overlay = document.getElementById('agriMenuOverlay');
  const panel = document.getElementById('agriDrawerPanel');
  if (overlay && panel) {
    overlay.classList.remove('active');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    if (!document.getElementById('agriBottomPopupOverlay')?.classList.contains('active')) {
      document.body.classList.remove('modal-open-freeze');
    }
  }
};

// 2. Bottom popup content (About Us & Why Choose Us matrame)
const bottomSheetData = {
  about: {
    title: "About Us (మా గురించి)",
    html: `
      <h5>🌱 అగ్రికనెక్ట్ టెక్నాలజీస్ (AgriConnect Technologies)</h5>
      <p>అగ్రికనెక్ట్ టెక్నాలజీస్ (UDYAM-TS-31-0063048) అనేది తెలంగాణలోని హనుమకొండ/వరంగల్ కేంద్రంగా ఏర్పడిన సరికొత్త డిజిటల్ వ్యవసాయ విప్లవం. రైతులు, వ్యవసాయ కూలీలు, ట్రాక్టర్ యజమానులు మరియు వ్యాపారులను అత్యాధునిక సాంకేతికతతో ఒకే తాటిపైకి తీసుకురావడమే మా ప్రధాన ధ్యేయం.</p>

      <h5>🚀 మా ప్రధాన ఆవిష్కరణ (Core Innovation)</h5>
      <p>చదవడం, రాయడం రాని గ్రామీణ రైతులు మరియు వ్యవసాయ కూలీల కోసం <b>100% తెలుగు వాయిస్ గైడెన్స్ (Voice First AI)</b> తో నడిచే ప్రపంచంలోనే మొట్టమొదటి హైపర్‌లోకల్ వేదిక.</p>

      <ul>
        <li><b>📍 5-10 కి.మీ హైపర్‌లోకల్ లేబర్ మ్యాపింగ్:</b> పొలం ఉన్న ప్రాంతం నుండి సమీప పరిధిలోని నైపుణ్యం కలిగిన వ్యవసాయ కూలీలను, గ్రూపులను క్షణాల్లో కనుగొనే శాశ్వత పరిష్కారం.</li>
        <li><b>🤝 రైతు - కూలీ ప్రత్యక్ష సంభాషణ:</b> దళారులు లేకుండా నేరుగా కూలీల ఫోన్ నంబర్లకు కాల్ చేసి రోజువారీ పనులు, కూలీ రేట్లను నేరుగా మాట్లాడుకోవచ్చు.</li>
        <li><b>🌾 కొనుగోలుదారులకు నేరుగా పంట విక్రయం:</b> మధ్యవర్తుల మోసాలు లేకుండా పండించిన పంటను నేరుగా ట్రేడర్స్ మరియు బయర్లకు అత్యుత్తమ మార్కెట్ ధర వద్ద విక్రయించవచ్చు.</li>
        <li><b>🌱 సేంద్రీయ వ్యవసాయం & సలహాలు:</b> భూసారాన్ని రక్షించే ఆర్గానిక్ పంటలకు ప్రత్యేక మార్కెట్ గుర్తింపు, అలాగే వరి, మిర్చి, పత్తి పంటలకు ఆశించే చీడపీడల నివారణ సూచనలు.</li>
        <li><b>📊 డిజిటల్ సాగు ఖర్చులు & కూలీల డైరీ:</b> సాగు పెట్టుబడులు, లేబర్ హాజరు డైరీ, పొలం కొలతలు మరియు సబ్సిడీ పథకాల సమాచారం ఎల్లప్పుడూ భద్రం.</li>
        <li><b>🎯 రైతే రాజు - సాంకేతికతే బలం:</b> ఆర్టిఫిషియల్ ఇంటెలిజెన్స్, శాటిలైట్ మానిటరింగ్ మరియు వాయిస్ టెక్నాలజీతో ప్రతి రైతును ఆర్థికంగా బలోపేతం చేయడమే లక్ష్యం.</li>
      </ul>
    `
  },
  why_us: {
    title: "Why Choose Us (మా ప్రత్యేకతలు)",
    html: `
      <h5>⭐ ప్రపంచంలోనే మొట్టమొదటి ఆవిష్కరణ (World's 1st Innovation)</h5>
      <p><b>హైపర్‌లోకల్ లేబర్ మ్యాచింగ్ విత్ వాయిస్ గైడెన్స్:</b> చదువురాని రైతులకు కూడా సులభంగా అర్థమయ్యేలా 5-10 కి.మీ పరిధిలోని కూలీలను తెలుగు వాయిస్ గైడెన్స్ ద్వారా అనుసంధానించే మొట్టమొదటి సాంకేతికత.</p>

      <ul>
        <li><b>🚫 దళారులు లేని పారదర్శకత (Zero Middlemen):</b> కూలీల బుకింగ్, యంత్రాలు/ట్రాక్టర్ల అద్దె లేదా పంట అమ్మకం ఏదైనా నేరుగా ఫోన్ చేసి డీల్ కుదుర్చుకోవచ్చు.</li>
        <li><b>🗣️ పూర్తి వాయిస్ నావిగేషన్ (Voice-First AI):</b> యాప్ వాడటం రాకపోయినా, మైక్ బటన్ నొక్కి తెలుగులో మాట్లాడితే చాలు - అడిగిన ఫీచర్ స్క్రీన్ పై వెంటనే ప్రత్యక్షమవుతుంది.</li>
        <li><b>🛰️ పొలం శాటిలైట్ మానిటరింగ్:</b> మీ పొలం జియో-లొకేషన్ ఆధారంగా ఉపగ్రహ సమాచారంతో పంట ఆరోగ్యాన్ని, తేమ శాతాన్ని ఎప్పటికప్పుడు విశ్లేషించవచ్చు.</li>
        <li><b>📈 లైవ్ మార్కెట్ యార్డ్ రేట్లు:</b> వరంగల్ ఏనుమాములతో పాటు తెలంగాణ, ఆంధ్రప్రదేశ్ మార్కెట్ల రోజువారీ క్వింటాల్ లైవ్ రేట్లను పారదర్శకంగా తెలుసుకోవచ్చు.</li>
        <li><b>⚡ 100% ఉచిత సేవలు & ఆఫ్లైన్ రక్షణ:</b> అన్ని 8 స్మార్ట్ పవర్ టూల్స్ రైతులకు పూర్తిగా ఉచితం; మీ సాగు ఖర్చులు, కూలీల లెక్కలు మీ మొబైల్‌లోనే ఎల్లప్పుడూ భద్రంగా ఉంటాయి.</li>
      </ul>
    `
  }
};

// 3. Open smooth bottom sheet popup
window.openMenuBottomPopup = function(key) {
  const overlay = document.getElementById('agriBottomPopupOverlay');
  const titleEl = document.getElementById('bottomPopupTitle');
  const bodyEl = document.getElementById('bottomPopupBody');

  const data = bottomSheetData[key];
  if (!data || !overlay) return;

  titleEl.innerText = data.title;
  bodyEl.innerHTML = data.html;

 // 3.1 Drawer ni close chesi, bottom popup ni open chesthundhi
  window.closeAgriMenu();
  overlay.classList.add('active');
  document.body.classList.add('modal-open-freeze');
};

window.closeMenuBottomPopup = function(e) {
  const overlay = document.getElementById('agriBottomPopupOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open-freeze');
  }
};

  // Generic Fullscreen App View (Tools & Utilities renditiki idhe panichesthundi)
window.openDirectAppView = function(containerId, title, icon) {
  window.closeAgriMenu();
  const box = document.getElementById(containerId);
  if (!box) return;

  box.classList.add('tools-view-fullscreen');
  document.body.classList.add('modal-open-freeze');

  // Patha header unte remove chesi kotthadi create chesthundi
  let existingHeader = document.getElementById('dynamicAppHeaderBar');
  if (existingHeader) existingHeader.remove();

  const headerBar = document.createElement('div');
  headerBar.id = 'dynamicAppHeaderBar';
  headerBar.className = 'tools-view-header';
  headerBar.innerHTML = `
    <div class="tools-header-left">
      <span class="tools-header-icon">${icon || '🛠️'}</span>
      <span class="tools-header-title">${title || 'Smart App'}</span>
    </div>
    <button type="button" class="tools-view-close-btn" onclick="window.closeDirectAppView('${containerId}')" aria-label="Close">✕</button>
  `;
  box.prepend(headerBar);
};

window.closeDirectAppView = function(containerId) {
  const box = document.getElementById(containerId);
  if (box) {
    box.classList.remove('tools-view-fullscreen');
    document.body.classList.remove('modal-open-freeze');
  }
  const headerBar = document.getElementById('dynamicAppHeaderBar');
  if (headerBar) {
    headerBar.remove();
  }
};
