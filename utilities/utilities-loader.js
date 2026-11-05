// utilities/utilities-loader.js
(async function initUtilities() {
  const dir = 'utilities/';
  const thisScript = document.currentScript;

  // 1. CSS Injection
  if (!document.getElementById('utilities-style')) {
    const link = document.createElement('link');
    link.id = 'utilities-style';
    link.rel = 'stylesheet';
    link.href = `${dir}utilities.css?v=${Date.now()}`;
    document.head.appendChild(link);
  }

  // 2. HTML Injection
  try {
    const res = await fetch(`${dir}utilities.html?v=${Date.now()}`);
    if (res.ok) {
      const htmlText = await res.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlText.trim();
      const boxNode = tempDiv.firstElementChild;

      if (thisScript && thisScript.parentNode) {
        thisScript.parentNode.insertBefore(boxNode, thisScript);
      } else {
        document.body.appendChild(boxNode);
      }
    }
  } catch (err) {
    console.error('Utilities layout loading failed:', err);
  }

  // 3. Sub-loaders Calling (Fixed Order Loading)
  const features = [
    'dharani',
    'pmfby',
    'warehouse',
    'chc',
    'kvk',
    'soil',
    'pmkisan',
    'dealers',
    'pashu',
    'kcc',
    'farmerid',
    'mandi',
    'kusum',
    'organic'
  ];

  for (const name of features) {
    await new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = `${dir}${name}/${name}-loader.js?v=${Date.now()}`;
      s.onload = () => resolve();
      s.onerror = () => {
        console.error(`Failed to load module: ${name}`);
        resolve(); // ఒకటి లోడ్ కాకపోయినా నెక్స్ట్ కార్డు ఆగిపోకుండా ముందుకు వెళ్తుంది
      };
      document.body.appendChild(s);
    });
  }
})();
