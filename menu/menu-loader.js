// menu/menu-loader.js
(function initAgriMenuBridge() {
  const currentScript = document.currentScript;
  let basePath = 'menu/';
  if (currentScript && currentScript.src) {
    const url = new URL(currentScript.src);
    basePath = url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1);
  }

  // 1. Inject menu.css
  if (!document.getElementById('agri-menu-base-css')) {
    const link = document.createElement('link');
    link.id = 'agri-menu-base-css';
    link.rel = 'stylesheet';
    link.href = `${basePath}menu.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. Fetch & Mount menu components
  async function mountMenu() {
    try {
      const res = await fetch(`${basePath}menu.html?v=${Date.now()}`);
      if (!res.ok) throw new Error("menu.html fetch failed at " + basePath);

      const html = await res.text();
      const container = document.createElement('div');
      container.id = 'agri-menu-mount-slot';
      container.innerHTML = html;
      document.body.appendChild(container);

      // 3. Inject Hamburger Button directly into existing Header
      const targetHeader = document.querySelector('header') || 
                           document.querySelector('.header') || 
                           document.querySelector('#app-header') ||
                           document.querySelector('.container');

      if (targetHeader && !document.getElementById('agriMenuTriggerBtn')) {
        const btn = document.createElement('button');
        btn.id = 'agriMenuTriggerBtn';
        btn.type = 'button';
        btn.className = 'header-menu-btn';
        btn.setAttribute('onclick', 'openAgriMenu()');
        btn.setAttribute('aria-label', 'Open Menu');
        btn.innerHTML = '☰';
        
        // Header lopala right side ki button ni append chesthundi
        targetHeader.appendChild(btn);
      }

      // 4. Load menu.js logic
      const script = document.createElement('script');
      script.src = `${basePath}menu.js?v=${Date.now()}`;
      document.body.appendChild(script);

      console.log("✅ AgriConnect Hamburger Button & Drawer Auto-Mounted successfully.");
    } catch (err) {
      console.error("Menu loading error:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountMenu);
  } else {
    mountMenu();
  }
})();
