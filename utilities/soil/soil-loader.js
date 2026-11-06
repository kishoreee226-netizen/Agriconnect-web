(async function loadSoil() {
  const dir = 'utilities/soil/';

  // 1. CSS Injection
  if (!document.getElementById('soil-style')) {
    const link = document.createElement('link');
    link.id = 'soil-style';
    link.rel = 'stylesheet';
    link.href = `${dir}soil.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection (Direct Slot Injection)
  try {
    const res = await fetch(`${dir}soil.html?v=${Date.now()}`);
    if (res.ok) {
      const slot = document.getElementById('slot-soil');
      if (slot) {
        slot.innerHTML = await res.text();
      }

      // 3. JS Injection (Card attach aina tarvathe run avuthundhi)
      const s = document.createElement('script');
      s.src = `${dir}soil.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('Soil module load failed:', err);
  }
})();
