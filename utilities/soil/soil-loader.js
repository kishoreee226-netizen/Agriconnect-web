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

  // 2. HTML Injection
  try {
    const res = await fetch(`${dir}soil.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'soil-card-wrapper';
      wrapper.innerHTML = htmlText;

      // Soil Slot loki inject cheyadam
      const slot = document.getElementById('slot-soil');
      if (slot) slot.appendChild(wrapper);

      // 3. JS Injection (Card attach aina tarvathe run avuthundhi)
      const s = document.createElement('script');
      s.src = `${dir}soil.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('Soil module load failed:', err);
  }
})();
