// utilities/dharani/dharani-loader.js
(async function() {
  const dir = 'utilities/dharani/';

  // 1. CSS Injection
  if (!document.getElementById('dharani-style')) {
    const link = document.createElement('link');
    link.id = 'dharani-style';
    link.rel = 'stylesheet';
    link.href = `${dir}dharani.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. Direct HTML Injection (No extra wrapper div)
  try {
    const res = await fetch(`${dir}dharani.html?v=${Date.now()}`);
    if (res.ok) {
      const slot = document.getElementById('slot-dharani');
      if (slot) {
        slot.innerHTML = await res.text();
      }
    }
  } catch (err) {
    console.error('Dharani load failed:', err);
  }

  // 3. JS Injection
  const script = document.createElement('script');
  script.src = `${dir}dharani.js?v=${Date.now()}`;
  document.body.appendChild(script);
})();
