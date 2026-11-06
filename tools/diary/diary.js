// tools/diary/diary.js
window.diaryData = JSON.parse(localStorage.getItem('agri_diary_live')) || {
  kharchu: 0,
  aadhayam: 0,
  list: []
};

window.switchDiarySubTab = function(tab) {
  const ledgerPane = document.getElementById('subtab-ledger');
  const laborPane = document.getElementById('subtab-labor');
  const tabs = document.querySelectorAll('#view-diary .hub-tabs .hub-tab');

  if (tab === 'ledger') {
    ledgerPane?.classList.remove('hidden');
    laborPane?.classList.add('hidden');
    tabs[0]?.classList.add('active');
    tabs[1]?.classList.remove('active');
  } else {
    ledgerPane?.classList.add('hidden');
    laborPane?.classList.remove('hidden');
    tabs[0]?.classList.remove('active');
    tabs[1]?.classList.add('active');
  }
};

window.calcLaborTotal = function() {
  const count = parseFloat(document.getElementById('laborCount')?.value) || 0;
  const rate = parseFloat(document.getElementById('laborRate')?.value) || 0;
  const total = count * rate;
  const preview = document.getElementById('laborTotalPreview');
  if (preview) {
    preview.innerText = `₹${total.toLocaleString('en-IN')}`;
  }
};

window.refreshDiaryUI = function() {
  const kharchuEl = document.getElementById('diaryKharchuVal');
  const aadhayamEl = document.getElementById('diaryAadhayamVal');
  const nikaramEl = document.getElementById('diaryNikaramVal');
  const container = document.getElementById('diaryRecordsContainer');
  if (!kharchuEl || !container) return;

  const nikaram = window.diaryData.aadhayam - window.diaryData.kharchu;
  kharchuEl.innerText = `₹${window.diaryData.kharchu.toLocaleString('en-IN')}`;
  aadhayamEl.innerText = `₹${window.diaryData.aadhayam.toLocaleString('en-IN')}`;
  nikaramEl.innerText = `${nikaram >= 0 ? '+' : '-'} ₹${Math.abs(nikaram).toLocaleString('en-IN')}`;
  nikaramEl.className = `stat-val fs-diary ${nikaram >= 0 ? 'clr-green' : 'clr-red'}`;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  if (window.diaryData.list.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'modal-subtitle text-center mt-12';
    emptyMsg.innerText = 'ఇంకా ఎలాంటి లావాదేవీలు నమోదు కాలేదు. పై ఫారమ్ ద్వారా నమోదు చేయండి.';
    container.appendChild(emptyMsg);
    return;
  }

  window.diaryData.list.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'demo-card-item card-row-between';

    const left = document.createElement('div');
    const desc = document.createElement('b');
    desc.innerText = item.desc;
    const date = document.createElement('div');
    date.className = 'stat-lbl';
    date.innerText = item.date;
    left.appendChild(desc);
    left.appendChild(date);

    const right = document.createElement('div');
    right.className = 'flex-align-gap';
    const amt = document.createElement('b');
    amt.className = item.type === 'kharchu' ? 'clr-red' : 'clr-green';
    amt.innerText = `${item.type === 'kharchu' ? '-' : '+'} ₹${item.amt.toLocaleString('en-IN')}`;

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-text clr-red';
    delBtn.innerText = '✕';
    delBtn.onclick = () => deleteDiaryRecord(idx);

    right.appendChild(amt);
    right.appendChild(delBtn);

    row.appendChild(left);
    row.appendChild(right);
    container.appendChild(row);
  });
};

window.commitDiaryRecord = async function(desc, amt, type, extraMeta = {}) {
  const phone = localStorage.getItem('userPhone') || 'guest_farmer';
  const today = new Date().toLocaleDateString('te-IN', { day: 'numeric', month: 'short' });

  if (type === 'kharchu') window.diaryData.kharchu += amt;
  else window.diaryData.aadhayam += amt;

  const record = {
    desc,
    amt,
    type,
    date: today,
    createdAtIso: new Date().toISOString(),
    ...extraMeta
  };

  window.diaryData.list.unshift(record);
  localStorage.setItem('agri_diary_live', JSON.stringify(window.diaryData));
  window.refreshDiaryUI();

  try {
    if (window.AgriDB?.addDiaryEntry) {
      await window.AgriDB.addDiaryEntry({
        phone: phone,
        desc: desc,
        amount: amt,
        type: type,
        category: extraMeta.category || 'general',
        ...extraMeta
      });
    }
  } catch (err) {
    console.warn("AgriDB cloud sync delayed (offline/network):", err);
  }
};

window.addDiaryRecord = function(type) {
  const descInput = document.getElementById('diaryDesc');
  const amtInput = document.getElementById('diaryAmt');
  const desc = descInput.value.trim();
  const amt = parseFloat(amtInput.value);

  if (!desc || isNaN(amt) || amt <= 0) {
    alert("దయచేసి వివరాలు మరియు సరైన మొత్తాన్ని నమోదు చేయండి.");
    return;
  }

  window.commitDiaryRecord(desc, amt, type, { category: 'manual_entry' });

  descInput.value = '';
  amtInput.value = '';
};

window.deleteDiaryRecord = function(idx) {
  const item = window.diaryData.list[idx];
  if (item.type === 'kharchu') window.diaryData.kharchu -= item.amt;
  else window.diaryData.aadhayam -= item.amt;

  window.diaryData.list.splice(idx, 1);
  localStorage.setItem('agri_diary_live', JSON.stringify(window.diaryData));
  window.refreshDiaryUI();
};

window.saveLaborEntry = async function() {
  const desc = document.getElementById('laborWorkDesc')?.value.trim();
  const count = parseFloat(document.getElementById('laborCount')?.value) || 0;
  const rate = parseFloat(document.getElementById('laborRate')?.value) || 0;
  const totalAmt = count * rate;

  if (!desc || totalAmt <= 0) {
    alert('దయచేసి పని వివరాలు మరియు సరైన కూలీల రేటు నమోదు చేయండి.');
    return;
  }

  const laborDesc = `👷 కూలీ: ${desc} (${count} మంది @ ₹${rate})`;

  await window.commitDiaryRecord(laborDesc, totalAmt, 'kharchu', {
    category: 'labor',
    laborCount: count,
    wageRate: rate
  });

  window.renderLaborHistoryRow({
    desc: laborDesc,
    amt: totalAmt,
    date: new Date().toLocaleDateString('te-IN', { day: 'numeric', month: 'short' })
  });

  document.getElementById('laborWorkDesc').value = '';
  document.getElementById('laborCount').value = '';
  document.getElementById('laborRate').value = '';
  document.getElementById('laborTotalPreview').innerText = '₹0';

  alert('కూలీల లెక్క ఖర్చుల డైరీలో విజయవంతంగా నమోదయింది!');
};

window.renderLaborHistoryRow = function(item) {
  const container = document.getElementById('laborRecordsContainer');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'demo-card-item card-row-between mb-8';

  const left = document.createElement('div');
  const desc = document.createElement('b');
  desc.innerText = item.desc;
  const date = document.createElement('div');
  date.className = 'stat-lbl';
  date.innerText = item.date;
  left.appendChild(desc);
  left.appendChild(date);

  const amt = document.createElement('b');
  amt.className = 'clr-red';
  amt.innerText = `- ₹${item.amt.toLocaleString('en-IN')}`;

  row.appendChild(left);
  row.appendChild(amt);
  container.prepend(row);
};
