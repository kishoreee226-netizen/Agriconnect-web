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

// 2. Bottom popup content (About Us & Why Choose Us)
const bottomSheetData = {
  about: {
    title: "About Us (మా గురించి)",
    html: `
      <!-- Company Header & Registration -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
        <h5 style="margin: 0 0 4px 0; color: #166534; font-size: 13.5px; font-weight: 700;">🌱 AgriConnect Technologies</h5>
        <p style="margin: 0; font-size: 12px; line-height: 1.45; color: #334155;">
          తెలంగాణలోని హనుమకొండ/వరంగల్ కేంద్రంగా ఏర్పడిన సరికొత్త డిజిటల్ వ్యవసాయ విప్లవం (UDYAM-TS-31-0063048). రైతులు, వ్యవసాయ కూలీలు, ట్రాక్టర్ యజమానులు మరియు కొనుగోలుదారులను అత్యాధునిక సాంకేతికతతో ఒకే తాటిపైకి తీసుకురావడమే మా ప్రధాన ధ్యేయం.
        </p>
      </div>

      <!-- Core Innovation Banner -->
      <div style="background: #eefbee; border-left: 4px solid #16a34a; padding: 8px 10px; border-radius: 6px; margin-bottom: 10px;">
        <div style="font-weight: 700; color: #1b4332; font-size: 12.5px; margin-bottom: 2px;">🚀 మా ప్రధాన ఆవిష్కరణ (Core Innovation):</div>
        <div style="font-size: 11.5px; line-height: 1.4; color: #1e293b;">
          చదవడం, రాయడం రాని గ్రామీణ రైతులు మరియు వ్యవసాయ కూలీల కోసం <strong>100% తెలుగు వాయిస్ గైడెన్స్ (Voice First AI)</strong> తో నడిచే ప్రపంచంలోనే మొట్టమొదటి హైపర్‌లోకల్ వేదిక.
        </div>
      </div>

      <!-- Merged Clean Points List -->
      <ul style="padding-left: 18px; margin: 0; font-size: 12px; line-height: 1.5; color: #334155;">
        <li style="margin-bottom: 7px;">
          <strong>📍 5-10 కి.మీ హైపర్‌లోకల్ లేబర్ మ్యాపింగ్:</strong> పొలం పరిధిలోని నైపుణ్యం కలిగిన వ్యవసాయ కూలీలను, గ్రూపులను క్షణాల్లో కనుగొనే శాశ్వత పరిష్కారం.
        </li>
        <li style="margin-bottom: 7px;">
          <strong>🤝 రైతు - కూలీ ప్రత్యక్ష సంభాషణ:</strong> దళారులు లేకుండా నేరుగా ఫోన్ నంబర్లకు కాల్ చేసి రోజువారీ పనులు, కూలీ రేట్లను నేరుగా నిర్ణయించుకోవచ్చు.
        </li>
        <li style="margin-bottom: 7px;">
          <strong>🌾 కొనుగోలుదారులకు నేరుగా పంట విక్రయం:</strong> మధ్యవర్తుల మోసాలు లేకుండా పండించిన పంటను నేరుగా ట్రేడర్స్ మరియు బయర్లకు అత్యుత్తమ ధరకు అమ్ముకోవచ్చు.
        </li>
        <li style="margin-bottom: 7px;">
          <strong>🌱 సేంద్రీయ వ్యవసాయం & సలహాలు:</strong> భూసారాన్ని రక్షించే ఆర్గానిక్ పంటలకు ప్రత్యేక మార్కెట్ గుర్తింపు, అలాగే వరి, మిర్చి, పత్తి చీడపీడల నివారణ సూచనలు.
        </li>
        <li style="margin-bottom: 7px;">
          <strong>📊 డిజిటల్ సాగు ఖర్చులు & కూలీల హాజరు:</strong> సాగు ఖర్చులు, లేబర్ హాజరు డైరీ, పొలం కొలతలు మరియు సబ్సిడీ పథకాల సమాచారం ఎల్లప్పుడూ భద్రం.
        </li>
      </ul>
    `
  },
  why_us: {
    title: "Why Choose Us (మా ప్రత్యేకతలు)",
    html: `
      <!-- World's 1st Innovation Badge -->
      <div style="background: #1b4332; color: #ffffff; padding: 10px 12px; border-radius: 8px; margin-bottom: 10px;">
        <span style="background: #facc15; color: #000; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">WORLD'S 1ST INNOVATION</span>
        <h5 style="margin: 5px 0 2px 0; font-size: 13.5px; font-weight: 700; color: #ffffff;">హైపర్‌లోకల్ లేబర్ మ్యాచింగ్ విత్ వాయిస్ గైడెన్స్</h5>
        <p style="margin: 0; font-size: 11px; opacity: 0.95; line-height: 1.35;">
          This is the first time introduced in the world! చదువురాని రైతులకు కూడా సులభంగా అర్థమయ్యే పూర్తి తెలుగు వాయిస్ అసిస్టెంట్.
        </p>
      </div>

      <!-- Merged Advantages List -->
      <ul style="padding-left: 18px; margin: 0; font-size: 12px; line-height: 1.5; color: #334155;">
        <li style="margin-bottom: 7px;">
          <strong>🚫 దళారులు లేని పారదర్శకత (Zero Middlemen):</strong> కూలీల బుకింగ్, ట్రాక్టర్/యంత్రాల అద్దె లేదా పంట విక్రయం ఏదైనా నేరుగా ఫోన్ చేసి డీల్ కుదుర్చుకోవచ్చు.
        </li>
        <li style="margin-bottom: 7px;">
          <strong>🗣️ పూర్తి వాయిస్ నావిగేషన్ (Voice-First AI):</strong> యాప్ వాడటం తెలియకపోయినా, మైక్ బటన్ నొక్కి తెలుగులో మాట్లాడితే చాలు - స్క్రీన్ పై వెంటనే ప్రత్యక్షమవుతుంది.
        </li>
        <li style="margin-bottom: 7px;">
          <strong>🛰️ శాటిలైట్ మానిటరింగ్ & AI విశ్లేషణ:</strong> జియో-లొకేషన్ ఆధారంగా ఉపగ్రహ డేటాతో పంట ఆరోగ్యం, తేమ శాతం మరియు తెగుళ్ల విశ్లేషణ.
        </li>
        <li style="margin-bottom: 7px;">
          <strong>📈 లైవ్ మార్కెట్ యార్డ్ రేట్లు:</strong> వరంగల్ ఏనుమాములతో పాటు తెలంగాణ, ఆంధ్రప్రదేశ్ మార్కెట్ల రోజువారీ క్వింటాల్ లైవ్ రేట్లు ఎప్పటికప్పుడు ప్రత్యక్షం.
        </li>
        <li style="margin-bottom: 7px;">
          <strong>⚡ 100% ఉచిత సేవలు & ఆఫ్లైన్ రక్షణ:</strong> అన్ని 8 స్మార్ట్ పవర్ టూల్స్ రైతులకు పూర్తిగా ఉచితం; సాగు పెట్టుబడులు, కూలీల లెక్కలు మీ మొబైల్‌లో ఎల్లప్పుడూ భద్రం.
        </li>
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

  // Drawer ni close chesi, bottom popup ni open chesthundhi
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
