// labour/labour-loader.js - Dynamic Loader for Labour Module
(async function initAgriLabourModule() {
  try {
    const timestamp = Date.now();

    // 1. Load Scoped CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `labour/labour.css?v=${timestamp}`;
    document.head.appendChild(link);

    // 2. Fetch and Inject labour.html Templates into DOM
    const response = await fetch(`labour/labour.html?v=${timestamp}`);
    if (response.ok) {
      const htmlText = await response.text();
      const mount = document.createElement('div');
      mount.id = 'agri-labour-module-mount';
      mount.innerHTML = htmlText;
      document.body.appendChild(mount);
    }

    // 3. Load Labour Core JS Engine
    const script = document.createElement('script');
    script.src = `labour/labour.js?v=${timestamp}`;
    document.body.appendChild(script);

    console.log("✅ AgriConnect Labour Module Loaded Successfully");
  } catch (err) {
    console.error("❌ Failed to load AgriConnect Labour Module:", err);
  }
})();
