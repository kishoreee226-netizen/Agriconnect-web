(async function loadDealers() {
  const dir = 'utilities/dealers/';

  if (!document.getElementById('dealers-style')) {
    const link = document.createElement('link');
    link.id = 'dealers-style';
    link.rel = 'stylesheet';
    link.href = `${dir}dealers.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}dealers.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'dealers-card-wrapper';
      wrapper.innerHTML = htmlText;

      const grid = document.getElementById('agriUtilitiesGrid');
      if (grid) grid.appendChild(wrapper);

      const s = document.createElement('script');
      s.src = `${dir}dealers.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('Dealers module load failed:', err);
  }
})();
