(async function loadMandi() {
  const dir = 'utilities/mandi/';

  if (!document.getElementById('mandi-style')) {
    const link = document.createElement('link');
    link.id = 'mandi-style';
    link.rel = 'stylesheet';
    link.href = `${dir}mandi.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}mandi.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'mandi-card-wrapper';
      wrapper.innerHTML = htmlText;

      const grid = document.getElementById('agriUtilitiesGrid');
      if (grid) grid.appendChild(wrapper);

      const s = document.createElement('script');
      s.src = `${dir}mandi.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('Mandi module load failed:', err);
  }
})();
