(async function loadKcc() {
  const dir = 'utilities/kcc/';

  if (!document.getElementById('kcc-style')) {
    const link = document.createElement('link');
    link.id = 'kcc-style';
    link.rel = 'stylesheet';
    link.href = `${dir}kcc.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}kcc.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'kcc-card-wrapper';
      wrapper.innerHTML = htmlText;

      const grid = document.getElementById('agriUtilitiesGrid');
      if (grid) grid.appendChild(wrapper);

      const s = document.createElement('script');
      s.src = `${dir}kcc.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('KCC module load failed:', err);
  }
})();
