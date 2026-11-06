// tools/tools-loader.js
(async function initTools() {
  const dir = 'tools/';

  // 1. CSS Injection
  if (!document.getElementById('tools-style')) {
    const link = document.createElement('link');
    link.id = 'tools-style';
    link.rel = 'stylesheet';
    link.href = `${dir}tools.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection
  try {
    const res = await fetch(`${dir}tools.html?v=${Date.now()}`);
    if (res.ok) {
      const container = document.getElementById('slot-agri-tools') || document.getElementById('tools-container');
      if (container) {
        container.innerHTML = await res.text();
      }

      // 3. Sub-Loaders Injection (8 Tools)
      const toolModules = [
        'market', 'measure', 'calendar', 'fertilizer',
        'pest', 'diary', 'crop_doctor', 'schemes'
      ];

      toolModules.forEach(tool => {
        const script = document.createElement('script');
        script.src = `${dir}${tool}/${tool}-loader.js?v=${Date.now()}`;
        document.body.appendChild(script);
      });
    }
  } catch (err) {
    console.error('Tools module load failed:', err);
  }
})();

// Global Modal Handlers
window.showToolModal = function(toolKey) {
  const modal = document.getElementById('agriToolModal');
  const panels = document.querySelectorAll('.tool-view-panel');
  panels.forEach(p => p.style.display = 'none');

  const targetView = document.getElementById(`modal-view-${toolKey}`) || document.getElementById(`view-${toolKey}`);
  if (targetView) targetView.style.display = 'block';

  const titleMap = {
    'market': '🌾 లైవ్ మార్కెట్ ధరలు',
    'measure': '📐 పొలం కొలత (GPS)',
    'calendar': '🗓️ రైతు క్యాలెండర్ & పంచాంగం',
    'fertilizer': '🧪 ఎరువులు & విత్తనాల మోతాదు',
    'pest': '🔬 పంట తెగుళ్లు & నివారణ',
    'diary': '📝 ఖర్చులు & కూలీల డైరీ',
    'crop_doctor': '🩺 క్రాప్ డాక్టర్ (AI స్కాన్)',
    'schemes': '🏛️ ప్రభుత్వ పథకాలు & సబ్సిడీ'
  };

  const headerTitle = document.getElementById('agriModalHeaderTitle');
  if (headerTitle && titleMap[toolKey]) {
    headerTitle.innerText = titleMap[toolKey];
  }

  if (modal) modal.classList.add('active');
};

window.hideToolModal = function() {
  const modal = document.getElementById('agriToolModal');
  if (modal) modal.classList.remove('active');
};
