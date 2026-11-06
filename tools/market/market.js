// tools/market/market.js
let activeMandiDataset = [];

window.updateLiveMandiRates = function() {
  const container = document.getElementById('marketLiveCardsList');
  if (!container) return;

  const defaultMandiRates = [
    {
      crop: 'మిరప (తేజ / రెడ్)',
      category: 'commercial',
      variety: 'మధ్యస్థం / నాణ్యమైనది',
      market: 'వరంగల్',
      state: 'telangana',
      rate: '₹18,500',
      unit: '/ క్వింటాల్',
      trend: 'up',
      change: '+4.5%'
    },
    {
      crop: 'పత్తి (Cotton)',
      category: 'commercial',
      variety: 'మధ్యస్థ రకం',
      market: 'వరంగల్',
      state: 'telangana',
      rate: '₹7,420',
      unit: '/ క్వింటాల్',
      trend: 'down',
      change: '-1.8%'
    },
    {
      crop: 'వరి (RNR 15048)',
      category: 'grains',
      variety: 'సన్న రకం',
      market: 'వరంగల్',
      state: 'telangana',
      rate: '₹2,360',
      unit: '/ క్వింటాల్',
      trend: 'stable',
      change: '0.0%'
    },
    {
      crop: 'మొక్కజొన్న (Maize)',
      category: 'grains',
      variety: 'హైబ్రిడ్ పసుపు',
      market: 'వరంగల్',
      state: 'telangana',
      rate: '₹2,280',
      unit: '/ క్వింటాల్',
      trend: 'down',
      change: '-0.9%'
    },
    {
      crop: 'టమాటా (Tomato)',
      category: 'vegetables',
      variety: 'నాటు రకం',
      market: 'వరంగల్',
      state: 'telangana',
      rate: '₹2,250',
      unit: '/ క్వింటాల్',
      trend: 'stable',
      change: '0.0%'
    },
    {
      crop: 'జామ (Guava)',
      category: 'fruits',
      variety: 'మధ్యస్థం',
      market: 'వరంగల్',
      state: 'telangana',
      rate: '₹6,000',
      unit: '/ క్వింటాల్',
      trend: 'down',
      change: '-14.29%'
    }
  ];

  if (window.db && navigator.onLine) {
    window.db.collection('mandi_rates').orderBy('timestamp', 'desc').limit(25).get()
      .then(snapshot => {
        if (!snapshot.empty) {
          activeMandiDataset = [];
          snapshot.forEach(doc => {
            const d = doc.data();
            activeMandiDataset.push({
              crop: d.cropName || d.crop || 'పంట',
              category: d.category || 'all',
              variety: d.variety || 'లైవ్',
              market: d.market || 'వరంగల్',
              state: d.state || 'telangana',
              rate: d.price ? `₹${Number(d.price).toLocaleString('en-IN')}` : (d.rate || '₹0'),
              unit: d.unit || '/ క్వింటాల్',
              trend: d.trend || 'stable',
              change: d.change || '0%'
            });
          });
        } else {
          activeMandiDataset = defaultMandiRates;
        }
        window.filterMandiList();
      })
      .catch(() => {
        activeMandiDataset = defaultMandiRates;
        window.filterMandiList();
      });
  } else {
    activeMandiDataset = defaultMandiRates;
    window.filterMandiList();
  }
};

window.filterMandiList = function() {
  const container = document.getElementById('marketLiveCardsList');
  if (!container) return;

  const catVal = document.getElementById('mandiCategoryFilter')?.value || 'all';
  const cropVal = document.getElementById('mandiCropFilter')?.value || 'all';
  const stateVal = document.getElementById('mandiStateFilter')?.value || 'all';

  const filtered = activeMandiDataset.filter(item => {
    const matchCat = (catVal === 'all') || (item.category === catVal);
    const matchCrop = (cropVal === 'all') || (item.crop && item.crop.includes(cropVal));
    const matchState = (stateVal === 'all') || (item.state === stateVal);
    return matchCat && matchCrop && matchState;
  });

  renderMandiCardsModern(container, filtered);
};

function renderMandiCardsModern(container, items) {
  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="mandi-empty-msg">
        ఈ ఎంపికకు సంబంధించిన మార్కెట్ ధరలు అందుబాటులో లేవు.
      </div>
    `;
    return;
  }

  items.forEach(item => {
    let trendClass = 'trend-stable';
    let trendIcon = '↔';

    if (item.trend === 'up' || (item.change && item.change.startsWith('+'))) {
      trendClass = 'trend-up';
      trendIcon = '↑';
    } else if (item.trend === 'down' || (item.change && item.change.startsWith('-'))) {
      trendClass = 'trend-down';
      trendIcon = '↓';
    }

    const card = document.createElement('div');
    card.className = 'demo-card-item mb-8';
    card.innerHTML = `
      <div class="mandi-card-header">
        <div class="mandi-crop-title">${item.crop}</div>
        <div class="mandi-price-box">
          <span class="mandi-rate-val">${item.rate} ${item.unit}</span>
          <span class="mandi-trend-pill ${trendClass}">${trendIcon} ${item.change}</span>
        </div>
      </div>
      <div class="mandi-loc-sub">
        <span>📍 ${item.market} యార్డ్ • ${item.variety}</span>
        <span class="mandi-badge-live">ఈ రోజు లైవ్</span>
      </div>
    `;
    container.appendChild(card);
  });
}
