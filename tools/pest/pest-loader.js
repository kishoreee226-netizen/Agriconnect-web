// tools/pest/pest-loader.js
(async function initPestSubModule() {
  const dir = 'tools/pest/';

  if (!document.getElementById('pest-style')) {
    const link = document.createElement('link');
    link.id = 'pest-style';
    link.rel = 'stylesheet';
    link.href = `${dir}pest.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}pest.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlText;

      const cardSlot = document.getElementById('slot-tool-pest');
      const cardContent = tempDiv.querySelector('.pest-card-content');
      if (cardSlot && cardContent) {
        cardSlot.innerHTML = '';
        cardSlot.appendChild(cardContent);
      }

      const modalSlot = document.getElementById('view-pest');
      const panelContent = tempDiv.querySelector('.pest-modal-panel');
      if (modalSlot && panelContent) {
        modalSlot.innerHTML = '';
        modalSlot.appendChild(panelContent);
      }

      const script = document.createElement('script');
      script.src = `${dir}pest.js?v=${Date.now()}`;
      document.body.appendChild(script);
    }
  } catch (err) {
    console.error('Pest tool component load failed:', err);
  }
})();
