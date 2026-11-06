// tools/tools-loader.js
(function initAgriToolsBridge() {
  // పాత్ లొకేషన్ డైనమిక్ గా డిటెక్ట్ చేయడం
  const currentScript = document.currentScript;
  let basePath = 'tools/';
  if (currentScript && currentScript.src) {
    const url = new URL(currentScript.src);
    basePath = url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1);
  }

  // 1. tools.css ని ఇంజెక్ట్ చేయడం
  if (!document.getElementById('agri-tools-base-css')) {
    const cssLink = document.createElement("link");
    cssLink.id = 'agri-tools-base-css';
    cssLink.rel = "stylesheet";
    cssLink.href = `${basePath}tools.css?v=${Date.now()}`;
    document.head.appendChild(cssLink);
  }

  async function mountTools() {
    let containerBox = document.getElementById("agri-tools-box");
    if (!containerBox) {
      console.warn("⚠️ #agri-tools-box నాట్ ఫౌండ్! బాడీ చివర ఆటో-మౌంట్ చేస్తున్నాం...");
      containerBox = document.createElement("div");
      containerBox.id = "agri-tools-box";
      document.body.appendChild(containerBox);
    }

    try {
      // 2. tools.html ఫెచ్ చేయడం
      console.log(`[Tools Loader] Fetching: ${basePath}tools.html`);
      const res = await fetch(`${basePath}tools.html?v=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`tools.html లోడ్ కాలేదు (Status: ${res.status}). పాత్ సరిచూడండి: ${basePath}tools.html`);
      }
      
      const html = await res.text();
      containerBox.innerHTML = html;
      console.log("✅ [Tools Loader] tools.html సక్సెస్‌ఫుల్ గా మౌంట్ అయింది.");

      // 3. 8 సబ్-టూల్స్ లోడర్లను రన్ చేయడం
      const toolSubModules = [
        'market', 'measure', 'calendar', 'fertilizer',
        'pest', 'diary', 'crop-doctor', 'schemes'
      ];

      toolSubModules.forEach(mod => {
        const scriptTag = document.createElement("script");
        scriptTag.src = `${basePath}${mod}/${mod}-loader.js?v=${Date.now()}`;
        scriptTag.onerror = () => console.error(`❌ సబ్-లోడర్ మిస్ అయింది: ${basePath}${mod}/${mod}-loader.js`);
        document.body.appendChild(scriptTag);
      });

    } catch (err) {
      console.error("❌ Tools Loading Failure:", err);
      // స్క్రీన్ మీద క్లియర్ గా ఎర్రర్ చూపించడం (రైతుకి ఖాళీగా కనిపించకుండా)
      containerBox.innerHTML = `
        <div style="padding:15px; background:#fff3cd; color:#856404; border-radius:8px; margin:10px 0; font-size:13px;">
          ⚠️ <b>Smart Agri Tools Load Error:</b> ${err.message}<br/>
          దయచేసి <code>tools/</code> ఫోల్డర్ లో <code>tools.html</code> ఉందో లేదో సరిచూడండి.
        </div>
      `;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountTools);
  } else {
    mountTools();
  }
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

// మోడల్ హ్యాండ్లర్స్
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
