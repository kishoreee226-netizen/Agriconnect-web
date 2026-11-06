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

  // 2. HTML Injection (Direct Slot Injection)
  try {
    const res = await fetch(`${dir}pashu.html?v=${Date.now()}`);
    if (res.ok) {
      const slot = document.getElementById('slot-pashu');
      if (slot) {
        slot.innerHTML = await res.text();
      }

      // 3. JS Injection
      const s = document.createElement('script');
      s.src = `${dir}pashu.js?v=${Date.now()}`;
      document.body.appendChild(s);
    }
  } catch (err) {
    console.error('Pashu module load failed:', err);
  }
})();
