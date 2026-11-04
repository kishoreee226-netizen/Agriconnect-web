(async function loadPmkisan() {
  const dir = 'utilities/pmkisan/';

  if (!document.getElementById('pmkisan-style')) {
    const link = document.createElement('link');
    link.id = 'pmkisan-style';
    link.rel = 'stylesheet';
    link.href = `${dir}pmkisan.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}pmkisan.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'pmkisan-card-wrapper';
      wrapper.innerHTML = htmlText;

      const grid = document.getElementById('agriUtilitiesGrid');
      if (grid) grid.appendChild(wrapper);

      const s = document.createElement('script');
      s.src = `${dir}pmkisan.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('PM-Kisan module load failed:', err);
  }
})();
