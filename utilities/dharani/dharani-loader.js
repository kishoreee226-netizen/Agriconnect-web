// utilities/dharani/dharani-loader.js
(async function initDharani() {
  const dir = 'utilities/dharani/';

  // 1. CSS Injection
  if (!document.getElementById('dharani-style')) {
    const link = document.createElement('link');
    link.id = 'dharani-style';
    link.rel = 'stylesheet';
    link.href = `${dir}dharani.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection
  try {
    const res = await fetch(`${dir}dharani.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      
      const slot = document.getElementById('slot-dharani');
      if (slot) {
        slot.className = 'dharani-card-wrapper';
        slot.innerHTML = htmlText;
      }
    }
  } catch (err) {
    console.error('Dharani HTML load failed:', err);
  }

  // 3. JS Injection
  const script = document.createElement('script');
  script.src = `${dir}dharani.js?v=${Date.now()}`;
  document.body.appendChild(script);
})();
