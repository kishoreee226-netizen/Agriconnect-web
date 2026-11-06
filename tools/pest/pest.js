// tools/pest/pest.js
const pestDatabase = {
  chilli: [
    {
      cropTag: 'మిర్చి',
      tagBadge: 'badge-pink',
      name: 'నల్ల తామర పురుగు (Black Thrips)',
      symptoms: 'ఆకులు పైకి ముడుచుకుపోవడం, పూత రాలడం, పూతలో నల్లటి పురుగులు కదలడం.',
      organic: 'వేప నూనె (10,000 PPM) 2 మి.లీ లేదా జీవామృతం 4 రోజులకోసారి పిచికారీ.',
      chemical: 'స్పైనోథోరం (డెలిగేట్) 0.9 మి.లీ లేదా ఎసిఫేట్ 1.5 గ్రా లీటరు నీటికి కలపండి.'
    },
    {
      cropTag: 'మిర్చి',
      tagBadge: 'badge-pink',
      name: 'బూడిద తెగులు (Powdery Mildew)',
      symptoms: 'ఆకుల అడుగున తెల్లటి బూడిద లాంటి పొర ఏర్పడి ఆకులు రాలడం.',
      organic: 'పుల్లటి మజ్జిగ 100 మి.లీ ఇంగువ 2 గ్రాములు లీటరు నీటిలో చల్లడం.',
      chemical: 'అజోక్సిస్ట్రోబిన్ 1.0 మి.లీ లేదా మైక్లోబ్యుటానిల్ 1.0 గ్రా లీటరు నీటికి.'
    }
  ],
  paddy: [
    {
      cropTag: 'వరి',
      tagBadge: 'badge-amber',
      name: 'అగ్గి తెగులు / బెంకి (Blast)',
      symptoms: 'ఆకులపై నూలు కండె ఆకారపు మచ్చలు, మెడ విరుపు తెగులు.',
      organic: 'పుల్లటి మజ్జిగ 100 మి.లీ + ఇంగువ 2 గ్రాములు లీటరు నీటిలో చల్లడం.',
      chemical: 'ట్రైసైక్లాజోల్ 75% WP (0.6 గ్రా/లీటర్) పిచికారీ చేయాలి.'
    },
    {
      cropTag: 'వరి',
      tagBadge: 'badge-amber',
      name: 'కాండం తొలిచే పురుగు (Stem Borer)',
      symptoms: 'పిలక దశలో ఎండిన మోనోలు (చావు పిలకలు), ఈనె దశలో తెల్ల కంకులు.',
      organic: 'ట్రైకోగ్రామా పరాన్నజీవి కార్డులు ఎకరాకు 2 వాడటం.',
      chemical: 'క్లోరాంట్రానిలిప్రోల్ (కొరాజన్) 0.4 మి.లీ లీటరు నీటికి కలపండి.'
    }
  ],
  cotton: [
    {
      cropTag: 'పత్తి',
      tagBadge: 'badge-blue',
      name: 'గులాబీ రంగు కాయ తొలిచే పురుగు (Pink Bollworm)',
      symptoms: 'పూలు రోసెట్ ఆకారంలో మారడం, కాయలకు రంధ్రాలు పడటం.',
      organic: 'ఎకరాకు 8 లింగాకర్షక బుట్టలు (Pheromone Traps) అమర్చండి.',
      chemical: 'ప్రొఫెనోఫాస్ 2 మి.లీ లేదా ఎమామెక్టిన్ బెంజోయేట్ 0.5 గ్రా/లీ.'
    }
  ],
  maize: [
    {
      cropTag: 'మొక్కజొన్న',
      tagBadge: 'badge-orange',
      name: 'కత్తెర పురుగు (Fall Armyworm)',
      symptoms: 'సుడులలో రంధ్రాలు, రంపపు పొట్టు లాంటి మల విసర్జన కనబడటం.',
      organic: 'సుడులలో ఇసుక + బూడిద మిశ్రమం వేయడం.',
      chemical: 'ఎమామెక్టిన్ బెంజోయేట్ 0.4 గ్రా లేదా కొరాజన్ 0.4 మి.లీ సుడిలో పడేలా పిచికారీ.'
    }
  ]
};

window.filterPestDetails = function(crop = 'chilli') {
  const cardsContainer = document.getElementById('pestCardsList');
  if (!cardsContainer) return;

  while (cardsContainer.firstChild) {
    cardsContainer.removeChild(cardsContainer.firstChild);
  }

  const data = pestDatabase[crop] || pestDatabase['chilli'];

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'demo-card-item';

    const header = document.createElement('div');
    header.className = 'flex-align-gap mb-4';
    const tag = document.createElement('span');
    tag.className = `badge-tag ${item.tagBadge}`;
    tag.innerText = item.cropTag;
    const name = document.createElement('b');
    name.innerText = item.name;
    header.appendChild(tag);
    header.appendChild(name);

    const sym = document.createElement('div');
    sym.className = 'card-location-text';
    sym.innerText = `లక్షణాలు: ${item.symptoms}`;

    const org = document.createElement('div');
    org.className = 'treatment-organic';
    org.innerText = `🌿 సహజ నివారణ: ${item.organic}`;

    const chem = document.createElement('div');
    chem.className = 'treatment-chemical';
    chem.innerText = `🧪 మందు మోతాదు: ${item.chemical}`;

    card.appendChild(header);
    card.appendChild(sym);
    card.appendChild(org);
    card.appendChild(chem);
    cardsContainer.appendChild(card);
  });
};
