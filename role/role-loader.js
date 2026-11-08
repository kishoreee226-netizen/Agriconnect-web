// role/role-loader.js - Dynamic Loader for Role Controller Module
(async function initAgriRoleModule() {
  try {
    const timestamp = Date.now();

    // 1. Scoped CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `role/role.css?v=${timestamp}`;
    document.head.appendChild(link);

    // 2. Fetch & Inject HTML Templates
    const response = await fetch(`role/role.html?v=${timestamp}`);
    if (response.ok) {
      const htmlText = await response.text();
      const mount = document.createElement('div');
      mount.id = 'agri-role-templates-mount';
      mount.innerHTML = htmlText;
      document.body.appendChild(mount);
    }

    // 3. Engine Script
    const script = document.createElement('script');
    script.src = `role/role.js?v=${timestamp}`;
    document.body.appendChild(script);

    console.log("✅ AgriConnect Role Controller Module Loaded Successfully");
  } catch (err) {
    console.error("❌ Failed to load Role Module:", err);
  }
})();
