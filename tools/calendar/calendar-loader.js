// tools/calendar/calendar-loader.js
(async function initCalendarSubModule() {
  const dir = 'tools/calendar/';

  if (!document.getElementById('calendar-style')) {
    const link = document.createElement('link');
    link.id = 'calendar-style';
    link.rel = 'stylesheet';
    link.href = `${dir}calendar.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  try {
    const res = await fetch(`${dir}calendar.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlText;

      const cardSlot = document.getElementById('slot-tool-calendar');
      const cardContent = tempDiv.querySelector('.calendar-card-content');
      if (cardSlot && cardContent) {
        cardSlot.innerHTML = '';
        cardSlot.appendChild(cardContent);
      }

      const modalSlot = document.getElementById('view-calendar');
      const panelContent = tempDiv.querySelector('.calendar-modal-panel');
      if (modalSlot && panelContent) {
        modalSlot.innerHTML = '';
        modalSlot.appendChild(panelContent);
      }

      const script = document.createElement('script');
      script.src = `${dir}calendar.js?v=${Date.now()}`;
      document.body.appendChild(script);
    }
  } catch (err) {
    console.error('Calendar tool component load failed:', err);
  }
})();
