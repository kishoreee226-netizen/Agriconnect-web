// tools/diary/diary-loader.js
(async function initDiarySubModule() {
  const dir = 'tools/diary/';

  if (!document.getElementById('diary-style')) {
    const link = document.createElement('link');
    link.id = 'diary-style';
    link.rel = 'stylesheet';
    link.href = `${dir}diary.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}diary.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlText;

      const cardSlot = document.getElementById('slot-tool-diary');
      const cardContent = tempDiv.querySelector('.diary-card-content');
      if (cardSlot && cardContent) {
        cardSlot.innerHTML = '';
        cardSlot.appendChild(cardContent);
      }

      const modalSlot = document.getElementById('view-diary');
      const panelContent = tempDiv.querySelector('.diary-modal-panel');
      if (modalSlot && panelContent) {
        modalSlot.innerHTML = '';
        modalSlot.appendChild(panelContent);
      }

      const script = document.createElement('script');
      script.src = `${dir}diary.js?v=${Date.now()}`;
      document.body.appendChild(script);
    }
  } catch (err) {
    console.error('Diary tool component load failed:', err);
  }
})();
