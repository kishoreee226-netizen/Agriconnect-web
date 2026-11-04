// utilities/warehouse/warehouse-loader.js
(async function loadWarehouse() {
  const dir = 'utilities/warehouse/';

  // 1. CSS Injection
  if (!document.getElementById('warehouse-style')) {
    const link = document.createElement('link');
    link.id = 'warehouse-style';
    link.rel = 'stylesheet';
    link.href = `${dir}warehouse.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection
  try {
    const res = await fetch(`${dir}warehouse.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'warehouse-card-wrapper';
      wrapper.innerHTML = htmlText;

      const grid = document.getElementById('agriUtilitiesGrid');
      if (grid) grid.appendChild(wrapper);
    }
  } catch (err) {
    console.error('Warehouse HTML load failed:', err);
  }

  // 3. JS Injection
  const script = document.createElement('script');
  script.src = `${dir}warehouse.js?v=${Date.now()}`;
  document.body.appendChild(script);
})();
