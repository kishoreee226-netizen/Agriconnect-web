// tools/tools-loader.js
(function initAgriToolsBridge() {
  const dir = 'tools/';

  // 1. tools.css ని ఆటోమేటిక్‌గా <head> లోకి చేరుస్తుంది
  const cssLink = document.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.href = `${dir}tools.css?v=${Date.now()}`;
  document.head.appendChild(cssLink);

  // 2. tools.html ఉంచడానికి ఒక ఖాళీ Box ని తయారు చేస్తుంది
  const containerBox = document.createElement("div");
  containerBox.id = "agri-tools-box";

  const currentScript = document.currentScript;
  if (currentScript && currentScript.parentNode) {
    currentScript.parentNode.insertBefore(containerBox, currentScript);
  }

  // 3. tools.html ని తీసుకొచ్చి ఆ బాక్స్‌లో పెడుతుంది
  fetch(`${dir}tools.html?v=${Date.now()}`)
    .then(res => res.text())
    .then(html => {
      containerBox.innerHTML = html;

      // 4. 8 Sub-loaders ని డైనమిక్ గా లోడ్ చేయడం
      const toolSubModules = [
        'market', 'measure', 'calendar', 'fertilizer',
        'pest', 'diary', 'crop-doctor', 'schemes'
      ];

      toolSubModules.forEach(mod => {
        const scriptTag = document.createElement("script");
        scriptTag.src = `${dir}${mod}/${mod}-loader.js?v=${Date.now()}`;
        document.body.appendChild(scriptTag);
      });
    })
    .catch(err => console.error("Tools Component Loading Error:", err));
})();

// మోడల్ టైటిల్స్ మ్యాపింగ్
const panelTitles = {
  market: '🌾 లైవ్ మార్కెట్ యార్డ్ ధరలు',
  measure: '📐 పొలం కొలత & హద్దులు (Field Measure)',
  calendar: '🗓️ రైతు క్యాలెండర్ & పంచాంగం',
  fertilizer: '🧪 ఎరువులు & విత్తనాల డోస్ కాలిక్యులేటర్',
  pest: '🔬 పంట తెగుళ్లు & నివారణ చికిత్స',
  diary: '📝 రైతు ఖర్చులు - ఆదాయం డైరీ',
  crop_doctor: '🩺 క్రాప్ డాక్టర్ (పంట తెగుళ్లు)',
  schemes: '🏛️ ప్రభుత్వ పథకాలు & సబ్సిడీ'
};

// గ్లోబల్ మోడల్ హ్యాండ్లర్స్
window.showToolModal = function(type) {
  const modal = document.getElementById('agriToolModal');
  const titleEl = document.getElementById('agriModalHeaderTitle');
  if (!modal) return;

  document.querySelectorAll('.tool-view-panel').forEach(panel => {
    panel.classList.remove('active-panel');
    panel.style.display = 'none';
  });

  if (titleEl) titleEl.innerText = panelTitles[type] || 'టూల్ వివరాలు';

  const activePanel = document.getElementById(`view-${type}`);
  if (activePanel) {
    activePanel.classList.add('active-panel');
    activePanel.style.display = 'block';
  }

  // టూల్ స్పెసిఫిక్ లైవ్ ట్రిగ్గర్స్
  if (type === 'market' && window.updateLiveMandiRates) updateLiveMandiRates();
  if (type === 'calendar' && window.updateCalendarDate) updateCalendarDate();
  if (type === 'fertilizer' && window.runFertilizerCalc) runFertilizerCalc();
  if (type === 'pest' && window.filterPestDetails) filterPestDetails(document.getElementById('pestCropSelect')?.value || 'chilli');
  if (type === 'diary' && window.refreshDiaryUI) refreshDiaryUI();
  if (type === 'crop_doctor' && window.initCropDoctorTool) initCropDoctorTool();
  if (type === 'schemes' && window.initSchemesTool) initSchemesTool();

  modal.style.display = 'flex';
  document.body.classList.add('modal-open-freeze');
};

window.hideToolModal = function(e) {
  const modal = document.getElementById('agriToolModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open-freeze');
  }
  if (window.gpsWatchId) {
    navigator.geolocation.clearWatch(window.gpsWatchId);
    window.gpsWatchId = null;
  }
};
