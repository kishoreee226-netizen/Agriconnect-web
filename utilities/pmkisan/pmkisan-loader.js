(async function loadPmkisan() {
  const dir = 'utilities/pmkisan/';

  // 1. CSS Injection
  if (!document.getElementById('pmkisan-style')) {
    const link = document.createElement('link');
    link.id = 'pmkisan-style';
    link.rel = 'stylesheet';
    link.href = `${dir}pmkisan.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML & Slot Injection (Direct Slot Injection)
  try {
    const res = await fetch(`${dir}pmkisan.html?v=${Date.now()}`);
    if (res.ok) {
      const slot = document.getElementById('slot-pmkisan');
      if (slot) {
        slot.innerHTML = await res.text();
      }

      // 3. JS Injection
      const s = document.createElement('script');
      s.src = `${dir}pmkisan.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('PM-Kisan module load failed:', err);
  }
})();
