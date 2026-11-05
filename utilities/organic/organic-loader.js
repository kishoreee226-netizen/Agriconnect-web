// utilities/organic/organic-loader.js
(async function initOrganicModule() {
  const dir = 'utilities/organic/';
  try {
    // 1. Inject CSS
    if (!document.querySelector(`link[href*="${dir}organic.css"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${dir}organic.css?v=${Date.now()}`;
      document.head.appendChild(link);
    }

    // 2. Fetch & Render HTML
    const res = await fetch(`${dir}organic.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const grid = document.getElementById('agriUtilitiesGrid');
      if (grid) {
        const wrapper = document.createElement('div');
        wrapper.className = 'utility-card-wrapper';
        wrapper.innerHTML = htmlText.trim();
        grid.appendChild(wrapper);

        // 3. Load JS Logic
        const script = document.createElement('script');
        script.src = `${dir}organic.js?v=${Date.now()}`;
        document.body.appendChild(script);
      }
    }
  } catch (err) {
    console.error('Organic module loading failed:', err);
  }
})();
