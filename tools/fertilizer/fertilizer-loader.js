// tools/fertilizer/fertilizer-loader.js
(async function initFertilizerSubModule() {
  const dir = 'tools/fertilizer/';

  if (!document.getElementById('fertilizer-style')) {
    const link = document.createElement('link');
    link.id = 'fertilizer-style';
    link.rel = 'stylesheet';
    link.href = `${dir}fertilizer.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}fertilizer.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlText;

      const cardSlot = document.getElementById('slot-tool-fertilizer');
      const cardContent = tempDiv.querySelector('.fertilizer-card-content');
      if (cardSlot && cardContent) {
        cardSlot.innerHTML = '';
        cardSlot.appendChild(cardContent);
      }

      const modalSlot = document.getElementById('view-fertilizer');
      const panelContent = tempDiv.querySelector('.fertilizer-modal-panel');
      if (modalSlot && panelContent) {
        modalSlot.innerHTML = '';
        modalSlot.appendChild(panelContent);
      }

      const script = document.createElement('script');
      script.src = `${dir}fertilizer.js?v=${Date.now()}`;
      document.body.appendChild(script);
    }
  } catch (err) {
    console.error('Fertilizer tool component load failed:', err);
  }
})();
