// menu/menu-loader.js
(function initAgriMenuBridge() {
  // పాత్ లొకేషన్ డైనమిక్ గా డిటెక్ట్ చేయడం
  const currentScript = document.currentScript;
  let basePath = 'menu/';
  if (currentScript && currentScript.src) {
    const url = new URL(currentScript.src);
    basePath = url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1);
  }

  // 1. menu.css ని ఇంజెక్ట్ చేయడం
  if (!document.getElementById('agri-menu-base-css')) {
    const link = document.createElement('link');
    link.id = 'agri-menu-base-css';
    link.rel = 'stylesheet';
    link.href = `${basePath}menu.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. menu.html ని ఫెచ్ చేసి బాడీలోకి మౌంట్ చేయడం
  async function mountMenu() {
    try {
      const res = await fetch(`${basePath}menu.html?v=${Date.now()}`);
      if (!res.ok) throw new Error("menu.html not found at " + basePath);

      const html = await res.text();
      const container = document.createElement('div');
      container.id = 'agri-menu-mount-slot';
      container.innerHTML = html;
      document.body.appendChild(container);

      // 3. menu.js ని లోడ్ చేయడం
      const script = document.createElement('script');
      script.src = `${basePath}menu.js?v=${Date.now()}`;
      document.body.appendChild(script);

      console.log("✅ AgriConnect Hamburger Menu Mounted Successfully.");
    } catch (err) {
      console.error("Menu Component Loading Error:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountMenu);
  } else {
    mountMenu();
  }
})();
