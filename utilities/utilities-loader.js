// utilities/utilities-loader.js
(function () {
  // 1. Box container ni injection cheyadam
  const box = document.createElement('div');
  box.id = 'agriUtilitiesBox';
  box.innerHTML = `
    <h3 style="font-size:15px; color:#1b5e20; margin:10px 0;">🛠️ రైతు పరికరాలు & సేవలు</h3>
    <div id="agriUtilitiesGrid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:10px;"></div>
  `;
  document.currentScript.parentNode.insertBefore(box, document.currentScript);

  // 2. Kothavi add chesinappudu kevalam peru matrame rayali (sub-loader lines avasaram ledu)
  const features = ['dharani', 'pmfby', 'warehouse', 'chc_rental', 'kvk_scientist'];

  // 3. Automatic ga anni sub-loaders ni call cheyadam
  features.forEach(name => {
    const s = document.createElement('script');
    s.src = `utilities/${name}/${name}-loader.js?v=${Date.now()}`;
    document.body.appendChild(s);
  });
})();
