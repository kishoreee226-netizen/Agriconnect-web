// tools/calendar/calendar.js
window.updateCalendarDate = function() {
  const dateEl = document.getElementById('calCurrentDateText');
  const tithiEl = document.getElementById('calTithiVal');
  const amruthaEl = document.getElementById('calAmruthaVal');
  const varjyamEl = document.getElementById('calVarjyamVal');
  const statusEl = document.getElementById('calStatusVal');
  const sprayRec = document.getElementById('calSprayRec');
  const waterRec = document.getElementById('calWaterRec');

  const now = new Date();
  const dateStr = now.toLocaleDateString('te-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const dayName = now.toLocaleDateString('te-IN', { weekday: 'long' });

  if (dateEl) dateEl.innerText = `📅 ${dateStr} (${dayName})`;
  if (tithiEl) tithiEl.innerText = 'శుక్ల / కృష్ణ పక్షం';
  if (amruthaEl) amruthaEl.innerText = 'ఉ. 08:30 - 10:15';
  if (varjyamEl) varjyamEl.innerText = 'సా. 03:20 - 05:00';
  if (statusEl) statusEl.innerText = 'అనుకూల సమయం';
  if (sprayRec) sprayRec.innerText = 'ఉదయం పూట గాలి వేగం తక్కువగా ఉన్నప్పుడు (ఉ. 7:00 - 10:30) పిచికారీ చేయడం అనుకూలం.';
  if (waterRec) waterRec.innerText = 'నేలలో తగినంత పదును ఉన్నప్పుడు మాత్రమే యూరియా లేదా కాంప్లెక్స్ ఎరువులను చల్లుకోవాలి.';
};
