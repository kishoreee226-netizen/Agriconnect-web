// auth/auth-loader.js - Self-contained Auth Module Loader
(async function initAgriAuth() {
  try {
    const timestamp = Date.now();

    // 1. Load Auth CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `auth/auth.css?v=${timestamp}`;
    document.head.appendChild(link);

    // 2. Load Auth HTML Template
    const res = await fetch(`auth/auth.html?v=${timestamp}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const html = await res.text();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper.firstElementChild);

    // 3. Load All-in-One Auth Engine & Controller
    const script = document.createElement('script');
    script.src = `auth/auth.js?v=${timestamp}`;
    document.body.appendChild(script);

    console.log("✅ AgriConnect Auth Module Loaded Successfully");
  } catch (err) {
    console.error("❌ Failed to load AgriConnect Auth Module:", err);
  }
})();
