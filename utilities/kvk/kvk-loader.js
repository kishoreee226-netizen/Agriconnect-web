(async function loadKvk() {
  const dir = 'utilities/kvk/';

  // 1. CSS Injection
  if (!document.getElementById('kvk-style')) {
    const link = document.createElement('link');
    link.id = 'kvk-style';
    link.rel = 'stylesheet';
    link.href = `${dir}kvk.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection (Direct Slot Injection)
  try {
    const res = await fetch(`${dir}kvk.html?v=${Date.now()}`);
    if (res.ok) {
      const slot = document.getElementById('slot-kvk');
      if (slot) {
        slot.innerHTML = await res.text();
      }
    }
  } catch (err) {
    console.error('KVK HTML load failed:', err);
  }

  // 3. JS Injection
  const script = document.createElement('script');
  script.src = `${dir}kvk.js?v=${Date.now()}`;
  document.body.appendChild(script);
})();
