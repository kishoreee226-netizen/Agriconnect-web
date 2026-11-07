// provider/provider-loader.js
(async function initAgriProviderModule() {
  try {
    const timestamp = Date.now();

    // 1. Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `provider/provider.css?v=${timestamp}`;
    document.head.appendChild(link);

    // 2. Fetch and Inject provider.html into DOM
    const response = await fetch(`provider/provider.html?v=${timestamp}`);
    if (response.ok) {
      const htmlText = await response.text();
      const mount = document.createElement('div');
      mount.id = 'agri-provider-module-mount';
      mount.innerHTML = htmlText;
      document.body.appendChild(mount);
    }

    // 3. Load Provider JS
    const script = document.createElement('script');
    script.src = `provider/provider.js?v=${timestamp}`;
    document.body.appendChild(script);

    console.log("✅ AgriConnect Provider Module Loaded Successfully");
  } catch (err) {
    console.error("❌ Failed to load AgriConnect Provider Module:", err);
  }
})();
