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

  // 2. HTML Injection
  try {
    const res = await fetch(`${dir}mandi.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'mandi-card-wrapper';
      wrapper.innerHTML = htmlText;

      // Slot Injection
      const slot = document.getElementById('slot-mandi');
      if (slot) slot.appendChild(wrapper);

      // 3. JS Injection
      const s = document.createElement('script');
      s.src = `${dir}mandi.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('Mandi module load failed:', err);
  }
})();
