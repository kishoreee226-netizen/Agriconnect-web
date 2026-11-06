// tools/market/market-loader.js
(async function initMarketSubModule() {
  const dir = 'tools/market/';

  if (!document.getElementById('market-style')) {
    const link = document.createElement('link');
    link.id = 'market-style';
    link.rel = 'stylesheet';
    link.href = `${dir}market.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}market.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlText;

      const cardSlot = document.getElementById('slot-tool-market');
      const cardContent = tempDiv.querySelector('.market-card-content');
      if (cardSlot && cardContent) {
        cardSlot.innerHTML = '';
        cardSlot.appendChild(cardContent);
      }

      const modalSlot = document.getElementById('view-market');
      const panelContent = tempDiv.querySelector('.market-modal-panel');
      if (modalSlot && panelContent) {
        modalSlot.innerHTML = '';
        modalSlot.appendChild(panelContent);
      }

      const script = document.createElement('script');
      script.src = `${dir}market.js?v=${Date.now()}`;
      document.body.appendChild(script);
    }
  } catch (err) {
    console.error('Market tool component load failed:', err);
  }
})();
