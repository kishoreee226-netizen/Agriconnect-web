(async function loadPashu() {
  const dir = 'utilities/pashu/';

  // 1. CSS Injection
  if (!document.getElementById('pashu-style')) {
    const link = document.createElement('link');
    link.id = 'pashu-style';
    link.rel = 'stylesheet';
    link.href = `${dir}pashu.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection
  try {
    const res = await fetch(`${dir}pashu.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const wrapper = document.createElement('div');
      wrapper.className = 'pashu-card-wrapper';
      wrapper.innerHTML = htmlText;

      // Slot Injection
      const slot = document.getElementById('slot-pashu');
      if (slot) slot.appendChild(wrapper);

      // 3. JS Injection
      const s = document.createElement('script');
      s.src = `${dir}pashu.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('Pashu module load failed:', err);
  }
})();
