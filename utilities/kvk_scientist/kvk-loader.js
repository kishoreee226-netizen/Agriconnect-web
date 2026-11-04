(async function loadKvk() {
  const dir = 'utilities/kvk_scientist/';

  if (!document.getElementById('kvk-style')) {
    const link = document.createElement('link');
    link.id = 'kvk-style';
    link.rel = 'stylesheet';
    link.href = `${dir}kvk.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}kvk.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'kvk-card-wrapper';
      wrapper.innerHTML = htmlText;

      const grid = document.getElementById('agriUtilitiesGrid');
      if (grid) grid.appendChild(wrapper);
    }
  } catch (err) {
    console.error('KVK HTML load failed:', err);
  }

  const script = document.createElement('script');
  script.src = `${dir}kvk.js?v=${Date.now()}`;
  document.body.appendChild(script);
})();
