(async function loadDealers() {
  const dir = 'utilities/dealers/';

  // 1. CSS Injection
  if (!document.getElementById('dealers-style')) {
    const link = document.createElement('link');
    link.id = 'dealers-style';
    link.rel = 'stylesheet';
    link.href = `${dir}dealers.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection (Direct Slot Injection)
  try {
    const res = await fetch(`${dir}dealers.html?v=${Date.now()}`);
    if (res.ok) {
      const slot = document.getElementById('slot-dealers');
      if (slot) {
        slot.innerHTML = await res.text();
      }

      // 3. JS Injection
      const s = document.createElement('script');
      s.src = `${dir}dealers.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('Dealers module load failed:', err);
  }
})();
