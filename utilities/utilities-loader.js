// utilities/utilities-loader.js
(function () {
  // 1. Utilities Container DOM lo inject cheyadam
  let utilBox = document.getElementById('agriUtilitiesBox');
  if (!utilBox) {
    utilBox = document.createElement('section');
    utilBox.id = 'agriUtilitiesBox';
    utilBox.style.cssText = 'padding: 12px 16px; margin-top: 10px;';
    
    utilBox.innerHTML = `
      <div style="font-size: 15px; font-weight: 700; color: #1b5e20; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
        <span>🛠️ రైతు పరికరాలు & సేవలు</span>
      </div>
      <div id="agriUtilitiesGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;"></div>
    `;

    // Tools container kindha inject cheyadam
    const toolsTarget = document.querySelector('.tools-box') || 
                        document.getElementById('toolsContainer') || 
                        document.body;

    if (toolsTarget && toolsTarget.parentNode && toolsTarget !== document.body) {
      toolsTarget.parentNode.insertBefore(utilBox, toolsTarget.nextSibling);
    } else {
      document.body.appendChild(utilBox);
    }
  }

  // 2. Active Utility Features Sub-loaders List
  const activeFeatures = [
    'utilities/dharani/dharani-loader.js'
    // Kothhavi add chesetappudu ikkada link chestham:
    // 'utilities/pmfby/pmfby-loader.js',
    // 'utilities/warehouse/warehouse-loader.js'
  ];

  // 3. Sub-loaders execute cheyadam
  activeFeatures.forEach(src => {
    const s = document.createElement('script');
    s.src = `${src}?v=${Date.now()}`;
    document.body.appendChild(s);
  });
})();
