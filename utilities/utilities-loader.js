// utilities/utilities-loader.js
(async function initUtilities() {
  const dir = 'utilities/';

  // 1. CSS Injection
  if (!document.getElementById('utilities-style')) {
    const link = document.createElement('link');
    link.id = 'utilities-style';
    link.rel = 'stylesheet';
    link.href = `${dir}utilities.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection (Dedicated Slot)
  try {
    const res = await fetch(`${dir}utilities.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const mount = document.getElementById('utilitiesMountSlot');
      if (mount) {
        mount.innerHTML = htmlText.trim();
      }
    }
  } catch (err) {
    console.error('Utilities layout loading failed:', err);
  }

  // 3. Parallel Sub-loaders Calling
  const features = [
    'dharani',
    'pmfby',
    'warehouse',
    'chc',
    'kvk',
    'soil',
    'pmkisan',
    'dealers',
    'pashu',
    'kcc',
    'farmerid',
    'mandi',
    'kusum',
    'organic'
  ];

  // Parallel loading - waterfall delay undadhu, cards ventane load avthayi
  features.forEach((name) => {
    const s = document.createElement('script');
    s.src = `${dir}${name}/${name}-loader.js?v=${Date.now()}`;
    s.async = true;
    s.onerror = () => {
      console.error(`Failed to load module: ${name}`);
    };
    document.body.appendChild(s);
  });
})();
