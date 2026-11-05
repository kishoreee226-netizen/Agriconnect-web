(async function loadFarmerId() {
  const dir = 'utilities/farmerid/';

  if (!document.getElementById('farmerid-style')) {
    const link = document.createElement('link');
    link.id = 'farmerid-style';
    link.rel = 'stylesheet';
    link.href = `${dir}farmerid.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}farmerid.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'farmerid-card-wrapper';
      wrapper.innerHTML = htmlText;

      const grid = document.getElementById('agriUtilitiesGrid');
      if (grid) grid.appendChild(wrapper);

      const s = document.createElement('script');
      s.src = `${dir}farmerid.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('Farmer ID module load failed:', err);
  }
})();
