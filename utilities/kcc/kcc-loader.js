(async function loadKcc() {
  const dir = 'utilities/kcc/';

  // 1. CSS Injection
  if (!document.getElementById('kcc-style')) {
    const link = document.createElement('link');
    link.id = 'kcc-style';
    link.rel = 'stylesheet';
    link.href = `${dir}kcc.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection (Direct Slot Injection)
  try {
    const res = await fetch(`${dir}kcc.html?v=${Date.now()}`);
    if (res.ok) {
      const slot = document.getElementById('slot-kcc');
      if (slot) {
        slot.innerHTML = await res.text();
      }

      // 3. JS Injection
      const s = document.createElement('script');
      s.src = `${dir}kcc.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('KCC module load failed:', err);
  }
})();
