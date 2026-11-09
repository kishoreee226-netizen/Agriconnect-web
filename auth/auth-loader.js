// auth/auth-loader.js - Self-contained Auth Module Loader
(async function initAgriAuth() {
  try {
    const timestamp = Date.now();

    // 1. Auth CSS ని ఇంజెక్ట్ చేయడం
    if (!document.getElementById("auth-css-link")) {
      const link = document.createElement('link');
      link.id = "auth-css-link";
      link.rel = 'stylesheet';
      link.href = `auth/auth.css?v=${timestamp}`;
      document.head.appendChild(link);
    }

    // 2. Auth HTML టెంప్లేట్‌ను DOM లోకి తీసుకురావడం
    if (!document.getElementById("agriAuthModal")) {
      const res = await fetch(`auth/auth.html?v=${timestamp}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const html = await res.text();
      const wrapper = document.createElement('div');
      wrapper.id = "auth-template-container";
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper.firstElementChild || wrapper);
    }

    console.log("✅ AgriConnect Auth Module Loaded Successfully");
  } catch (err) {
    console.error("❌ Failed to load AgriConnect Auth Module:", err);
  }
})();
