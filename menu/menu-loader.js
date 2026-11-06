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

  // 2. Fetch & Mount menu.html
  async function mountMenu() {
    try {
      const res = await fetch(`${basePath}menu.html?v=${Date.now()}`);
      if (!res.ok) throw new Error("menu.html fetch failed at " + basePath);

      const html = await res.text();
      const container = document.createElement('div');
      container.id = 'agri-menu-mount-slot';
      container.innerHTML = html;
      document.body.appendChild(container);

      // 3. Load menu.js logic
      const script = document.createElement('script');
      script.src = `${basePath}menu.js?v=${Date.now()}`;
      document.body.appendChild(script);

      console.log("✅ AgriConnect Hamburger Menu Mounted.");
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
