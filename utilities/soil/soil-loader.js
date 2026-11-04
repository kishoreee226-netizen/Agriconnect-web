(async function loadSoil() {
  const dir = 'utilities/soil/';

  if (!document.getElementById('soil-style')) {
    const link = document.createElement('link');
    link.id = 'soil-style';
    link.rel = 'stylesheet';
    link.href = `${dir}soil.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}soil.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'soil-card-wrapper';
      wrapper.innerHTML = htmlText;

      const grid = document.getElementById('agriUtilitiesGrid');
      if (grid) grid.appendChild(wrapper);

      const s = document.createElement('script');
      s.src = `${dir}soil.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('Soil module load failed:', err);
  }
})();
