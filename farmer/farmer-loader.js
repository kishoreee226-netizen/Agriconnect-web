// farmer/farmer-loader.js
(async function initAgriFarmerModule() {
  try {
    const timestamp = Date.now();

    // 1. Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `farmer/farmer.css?v=${timestamp}`;
    document.head.appendChild(link);

    // 2. Fetch and Inject farmer.html templates into DOM
    const response = await fetch(`farmer/farmer.html?v=${timestamp}`);
    if (response.ok) {
      const htmlText = await response.text();
      const mount = document.createElement('div');
      mount.id = 'agri-farmer-module-mount';
      mount.innerHTML = htmlText;
      document.body.appendChild(mount);
    }

    // 3. Load Farmer JS Engine
    const script = document.createElement('script');
    script.src = `farmer/farmer.js?v=${timestamp}`;
    document.body.appendChild(script);

    console.log("✅ AgriConnect Farmer Module Loaded Successfully");
  } catch (err) {
    console.error("❌ Failed to load AgriConnect Farmer Module:", err);
  }
})();
