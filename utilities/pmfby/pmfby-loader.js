// utilities/pmfby/pmfby-loader.js
(async function loadPmfby() {
  const dir = 'utilities/pmfby/';

  // 1. CSS Injection
  if (!document.getElementById('pmfby-style')) {
    const link = document.createElement('link');
    link.id = 'pmfby-style';
    link.rel = 'stylesheet';
    link.href = `${dir}pmfby.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection (Direct Slot Injection)
  try {
    const res = await fetch(`${dir}pmfby.html?v=${Date.now()}`);
    if (res.ok) {
      const slot = document.getElementById('slot-pmfby');
      if (slot) {
        slot.innerHTML = await res.text();
      }
    }
  } catch (err) {
    console.error('PMFBY HTML load failed:', err);
  }

  // 3. JS Injection
  const script = document.createElement('script');
  script.src = `${dir}pmfby.js?v=${Date.now()}`;
  document.body.appendChild(script);
})();
