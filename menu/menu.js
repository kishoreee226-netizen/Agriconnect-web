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
      <h5>🌾 AgriConnect - స్మార్ట్ వ్యవసాయ వేదిక</h5>
      <p>AgriConnect అనేది రైతులను, వ్యవసాయ కూలీలను, ట్రాక్టర్ యజమానులను మరియు మార్కెట్ ధరలను ఒకే డిజిటల్ వేదికపైకి తీసుకువచ్చే ఆధునిక వ్యవస్థ.</p>
      <ul>
        <li>రైతుల పంటల సమస్యలకు తక్షణ AI విశ్లేషణ మరియు తెలుగు వాయిస్ గైడెన్స్.</li>
        <li>తెలంగాణ & ఆంధ్రప్రదేశ్ మార్కెట్ల లైవ్ యార్డ్ రేట్లు.</li>
        <li>డిజిటల్ సాగు ఖర్చులు & కూలీల హాజరు డైరీ.</li>
        <li>పొలం కొలతలు, ఎరువుల మోతాదు మరియు తాజా సబ్సిడీ పథకాలు.</li>
      </ul>
      <p>వ్యవసాయాన్ని రైతులకు మరింత సులభతరం మరియు లాభసాటిగా మార్చడమే మా ప్రధాన ధ్యేయం.</p>
    `
  },
  why_us: {
    title: "Why Choose Us (మా ప్రత్యేకతలు)",
    html: `
      <h5>⭐ రైతులకు AgriConnect ఎందుకు శ్రేయస్కరం?</h5>
      <ul>
        <li><b>100% ఉచిత సేవలు:</b> అన్ని 8 పవర్ టూల్స్ రైతులకు పూర్తిగా ఉచితం.</li>
        <li><b>తెలుగు వాయిస్ సదుపాయం:</b> చదువురాని రైతులకు కూడా సులభంగా అర్థమయ్యే వాయిస్ అసిస్టెంట్.</li>
        <li><b>లైవ్ అప్‌డేట్స్:</b> మార్కెట్ ధరలు మరియు పథకాల వివరాలు ఎప్పటికప్పుడు ప్రత్యక్షం.</li>
        <li><b>ఆఫ్‌లైన్ రక్షణ:</b> మీ సాగు పెట్టుబడులు, కూలీల లెక్కలు మీ మొబైల్‌లో ఎల్లప్పుడూ భద్రం.</li>
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
