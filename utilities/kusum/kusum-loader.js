// utilities/kusum/kusum-loader.js
(async function initKusum() {
  const dir = 'utilities/kusum/';

  // 1. CSS Injection
  if (!document.getElementById('kusum-style')) {
    const link = document.createElement('link');
    link.id = 'kusum-style';
    link.rel = 'stylesheet';
    link.href = `${dir}kusum.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection
  try {
    const res = await fetch(`${dir}kusum.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'kusum-card-wrapper';
      wrapper.innerHTML = htmlText;

      // Slot Injection
      const slot = document.getElementById('slot-kusum');
      if (slot) slot.appendChild(wrapper);

      // 3. JS Injection
      const script = document.createElement('script');
      script.src = `${dir}kusum.js?v=${Date.now()}`;
      document.body.appendChild(script);
    }
  } catch (err) {
    console.error('Kusum module load failed:', err);
  }
})();
