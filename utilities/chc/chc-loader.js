// utilities/chc/chc-loader.js
(async function loadChc() {
  const dir = 'utilities/chc/';

  // 1. CSS Injection
  if (!document.getElementById('chc-style')) {
    const link = document.createElement('link');
    link.id = 'chc-style';
    link.rel = 'stylesheet';
    link.href = `${dir}chc.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection (Direct Slot Injection)
  try {
    const res = await fetch(`${dir}chc.html?v=${Date.now()}`);
    if (res.ok) {
      const slot = document.getElementById('slot-chc');
      if (slot) {
        slot.innerHTML = await res.text();
      }
    }
  } catch (err) {
    console.error('CHC HTML load failed:', err);
  }

  // 3. JS Injection
  const script = document.createElement('script');
  script.src = `${dir}chc.js?v=${Date.now()}`;
  document.body.appendChild(script);
})();
