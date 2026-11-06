(async function loadMandi() {
  const dir = 'utilities/mandi/';

  // 1. CSS Injection
  if (!document.getElementById('mandi-style')) {
    const link = document.createElement('link');
    link.id = 'mandi-style';
    link.rel = 'stylesheet';
    link.href = `${dir}mandi.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection (Direct Slot Injection)
  try {
    const res = await fetch(`${dir}mandi.html?v=${Date.now()}`);
    if (res.ok) {
      const slot = document.getElementById('slot-mandi');
      if (slot) {
        slot.innerHTML = await res.text();
      }

      // 3. JS Injection
      const s = document.createElement('script');
      s.src = `${dir}mandi.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('Mandi module load failed:', err);
  }
})();
