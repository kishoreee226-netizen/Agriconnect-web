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

  // 2. HTML Injection
  try {
    const res = await fetch(`${dir}organic.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'organic-card-wrapper';
      wrapper.innerHTML = htmlText;

      // Slot Injection
      const slot = document.getElementById('slot-organic');
      if (slot) slot.appendChild(wrapper);

      // 3. JS Injection
      const script = document.createElement('script');
      script.src = `${dir}organic.js?v=${Date.now()}`;
      document.body.appendChild(script);
    }
  } catch (err) {
    console.error('Organic module load failed:', err);
  }
})();
