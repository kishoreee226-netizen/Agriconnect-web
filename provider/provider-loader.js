// provider/provider-loader.js
(async function initAgriProviderModule() {
  try {
    const timestamp = Date.now();

    // 1. Load Provider CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `provider/provider.css?v=${timestamp}`;
    document.head.appendChild(link);

    // 2. Load Provider JS Engine
    const script = document.createElement('script');
    script.src = `provider/provider.js?v=${timestamp}`;
    document.body.appendChild(script);

    console.log("✅ AgriConnect Provider Module Loaded Successfully");
  } catch (err) {
    console.error("❌ Failed to load AgriConnect Provider Module:", err);
  }
})();
