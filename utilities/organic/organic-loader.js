// utilities/organic/organic-loader.js
(async function initOrganic() {
  const dir = 'utilities/organic/';

  // 1. CSS Injection
  if (!document.getElementById('organic-style')) {
    const link = document.createElement('link');
    link.id = 'organic-style';
    link.rel = 'stylesheet';
    link.href = `${dir}organic.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection (Direct Slot Injection)
  try {
    const res = await fetch(`${dir}organic.html?v=${Date.now()}`);
    if (res.ok) {
      const slot = document.getElementById('slot-organic');
      if (slot) {
        slot.innerHTML = await res.text();
      }

      // 3. JS Injection
      const script = document.createElement('script');
      script.src = `${dir}organic.js?v=${Date.now()}`;
      document.body.appendChild(script);
    }
  } catch (err) {
    console.error('Organic module load failed:', err);
  }
})();
