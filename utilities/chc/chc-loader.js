(async function loadChc() {
  const dir = 'utilities/chc/';

  if (!document.getElementById('chc-style')) {
    const link = document.createElement('link');
    link.id = 'chc-style';
    link.rel = 'stylesheet';
    link.href = `${dir}chc.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}chc.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'chc-card-wrapper';
      wrapper.innerHTML = htmlText;

      const grid = document.getElementById('agriUtilitiesGrid');
      if (grid) grid.appendChild(wrapper);
    }
  } catch (err) {
    console.error('CHC HTML load failed:', err);
  }

  const script = document.createElement('script');
  script.src = `${dir}chc.js?v=${Date.now()}`;
  document.body.appendChild(script);
})();
