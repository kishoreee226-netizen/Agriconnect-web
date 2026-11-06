// tools/measure/measure.js
window.gridTapPoints = [];
window.gpsPoints = [];
window.gpsWatchId = null;

window.addGridPoint = function(e) {
  const box = document.getElementById('measureCanvasBox');
  const placeholder = document.getElementById('gridPlaceholderText');
  if (placeholder) placeholder.style.display = 'none';

  const rect = box.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const dot = document.createElement('div');
  dot.className = 'map-point-dot';
  dot.style.left = (x - 5) + 'px';
  dot.style.top = (y - 5) + 'px';
  box.appendChild(dot);

  window.gridTapPoints.push({ x, y });

  if (window.gridTapPoints.length >= 3) {
    let area = 0;
    for (let i = 0; i < window.gridTapPoints.length; i++) {
      let j = (i + 1) % window.gridTapPoints.length;
      area += window.gridTapPoints[i].x * window.gridTapPoints[j].y;
      area -= window.gridTapPoints[j].x * window.gridTapPoints[i].y;
    }
    area = Math.abs(area) / 2;
    const acres = (area / 1200).toFixed(2);
    document.getElementById('valAcres').innerText = acres;
    document.getElementById('valGuntas').innerText = (acres * 40).toFixed(1);
    document.getElementById('valCents').innerText = (acres * 100).toFixed(1);
  }
};

window.resetMeasureGrid = function() {
  const box = document.getElementById('measureCanvasBox');
  if (box) {
    const dots = box.querySelectorAll('.map-point-dot');
    dots.forEach(d => d.remove());
    const placeholder = document.getElementById('gridPlaceholderText');
    if (placeholder) placeholder.style.display = 'flex';
  }
  window.gridTapPoints = [];
  window.gpsPoints = [];
  document.getElementById('valAcres').innerText = '0.00';
  document.getElementById('valGuntas').innerText = '0.0';
  document.getElementById('valCents').innerText = '0.0';
};

window.toggleGpsWalk = function() {
  const btn = document.getElementById('gpsBtn');
  const status = document.getElementById('gpsStatus');

  if (window.gpsWatchId) {
    navigator.geolocation.clearWatch(window.gpsWatchId);
    window.gpsWatchId = null;
    btn.innerText = 'GPS స్టార్ట్';
    btn.className = 'btn-gps-active';
    status.innerText = `కొలత పూర్తయింది. నమోదు చేసిన పాయింట్లు: ${window.gpsPoints.length}`;
    return;
  }

  if (!navigator.geolocation) {
    alert("మీ మొబైల్‌లో GPS అందుబాటులో లేదు.");
    return;
  }

  window.gpsPoints = [];
  btn.innerText = 'ఆపు చేయి';
  btn.className = 'btn-gps-stop';
  status.innerText = 'GPS రికార్డింగ్ నడుస్తోంది... పొలం గట్ల వెంట నడవండి.';

  window.gpsWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      window.gpsPoints.push({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      if (window.gpsPoints.length >= 3) {
        let acres = (window.gpsPoints.length * 0.45).toFixed(2);
        document.getElementById('valAcres').innerText = acres;
        document.getElementById('valGuntas').innerText = (acres * 40).toFixed(1);
        document.getElementById('valCents').innerText = (acres * 100).toFixed(1);
      }
    },
    () => {
      alert("GPS లొకేషన్ అనుమతి అవసరం.");
      window.toggleGpsWalk();
    },
    { enableHighAccuracy: true }
  );
};
