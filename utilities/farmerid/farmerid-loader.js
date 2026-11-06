(async function loadFarmerId() {
  const dir = 'utilities/farmerid/';

  // 1. CSS Injection
  if (!document.getElementById('farmerid-style')) {
    const link = document.createElement('link');
    link.id = 'farmerid-style';
    link.rel = 'stylesheet';
    link.href = `${dir}farmerid.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection (Direct Slot Injection)
  try {
    const res = await fetch(`${dir}farmerid.html?v=${Date.now()}`);
    if (res.ok) {
      const slot = document.getElementById('slot-farmerid');
      if (slot) {
        slot.innerHTML = await res.text();
      }

      // 3. JS Injection
      const s = document.createElement('script');
      s.src = `${dir}farmerid.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('Farmer ID module load failed:', err);
  }
})();
