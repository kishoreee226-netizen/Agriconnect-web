(async function loadPashu() {
  const dir = 'utilities/pashu/';

  if (!document.getElementById('pashu-style')) {
    const link = document.createElement('link');
    link.id = 'pashu-style';
    link.rel = 'stylesheet';
    link.href = `${dir}pashu.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}pashu.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'pashu-card-wrapper';
      wrapper.innerHTML = htmlText;

      const grid = document.getElementById('agriUtilitiesGrid');
      if (grid) grid.appendChild(wrapper);

      const s = document.createElement('script');
      s.src = `${dir}pashu.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('Pashu module load failed:', err);
  }
})();
