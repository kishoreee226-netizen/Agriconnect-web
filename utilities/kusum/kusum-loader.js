// utilities/kusum/kusum-loader.js
(async function initKusum() {
  const dir = 'utilities/kusum/';

  // 1. CSS Injection
  if (!document.getElementById('kusum-style')) {
    const link = document.createElement('link');
    link.id = 'kusum-style';
    link.rel = 'stylesheet';
    link.href = `${dir}kusum.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection (Direct Slot Injection)
  try {
    const res = await fetch(`${dir}kusum.html?v=${Date.now()}`);
    if (res.ok) {
      const slot = document.getElementById('slot-kusum');
      if (slot) {
        slot.innerHTML = await res.text();
      }

      // 3. JS Injection
      const script = document.createElement('script');
      script.src = `${dir}kusum.js?v=${Date.now()}`;
      document.body.appendChild(script);
    }
  } catch (err) {
    console.error('Kusum module load failed:', err);
  }
})();
