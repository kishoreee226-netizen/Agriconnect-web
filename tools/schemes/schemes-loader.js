// tools/schemes/schemes-loader.js
(async function initSchemesSubModule() {
  const dir = 'tools/schemes/';

  if (!document.getElementById('schemes-style')) {
    const link = document.createElement('link');
    link.id = 'schemes-style';
    link.rel = 'stylesheet';
    link.href = `${dir}schemes.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}schemes.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlText;

      const cardSlot = document.getElementById('slot-tool-schemes');
      const cardContent = tempDiv.querySelector('.schemes-card-content');
      if (cardSlot && cardContent) {
        cardSlot.innerHTML = '';
        cardSlot.appendChild(cardContent);
      }

      const modalSlot = document.getElementById('view-schemes');
      const panelContent = tempDiv.querySelector('.schemes-modal-panel');
      if (modalSlot && panelContent) {
        modalSlot.innerHTML = '';
        modalSlot.appendChild(panelContent);
      }

      const script = document.createElement('script');
      script.src = `${dir}schemes.js?v=${Date.now()}`;
      document.body.appendChild(script);
    }
  } catch (err) {
    console.error('Schemes tool component load failed:', err);
  }
})();
