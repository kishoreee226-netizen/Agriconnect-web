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

  // 2. HTML Injection
  try {
    const res = await fetch(`${dir}chc.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'chc-card-wrapper';
      wrapper.innerHTML = htmlText;

      // Slot Injection
      const slot = document.getElementById('slot-chc');
      if (slot) slot.appendChild(wrapper);
    }
  } catch (err) {
    console.error('CHC HTML load failed:', err);
  }

  // 3. JS Injection
  const script = document.createElement('script');
  script.src = `${dir}chc.js?v=${Date.now()}`;
  document.body.appendChild(script);
})();
