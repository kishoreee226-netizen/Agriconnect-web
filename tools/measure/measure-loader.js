// tools/measure/measure-loader.js
(async function initMeasureSubModule() {
  const dir = 'tools/measure/';

  if (!document.getElementById('measure-style')) {
    const link = document.createElement('link');
    link.id = 'measure-style';
    link.rel = 'stylesheet';
    link.href = `${dir}measure.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}measure.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlText;

      const cardSlot = document.getElementById('slot-tool-measure');
      const cardContent = tempDiv.querySelector('.measure-card-content');
      if (cardSlot && cardContent) {
        cardSlot.innerHTML = '';
        cardSlot.appendChild(cardContent);
      }

      const modalSlot = document.getElementById('view-measure');
      const panelContent = tempDiv.querySelector('.measure-modal-panel');
      if (modalSlot && panelContent) {
        modalSlot.innerHTML = '';
        modalSlot.appendChild(panelContent);
      }

      const script = document.createElement('script');
      script.src = `${dir}measure.js?v=${Date.now()}`;
      document.body.appendChild(script);
    }
  } catch (err) {
    console.error('Measure tool component load failed:', err);
  }
})();
