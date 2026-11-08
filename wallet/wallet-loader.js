// wallet/wallet-loader.js - Dynamic Module Loader for Smart Wallet
(async function initAgriWalletModule() {
  try {
    const timestamp = Date.now();

    // 1. Scoped CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `wallet/wallet.css?v=${timestamp}`;
    document.head.appendChild(link);

    // 2. Fetch & Mount Templates
    const response = await fetch(`wallet/wallet.html?v=${timestamp}`);
    if (response.ok) {
      const htmlText = await response.text();
      const mount = document.createElement('div');
      mount.id = 'agri-wallet-templates-mount';
      mount.innerHTML = htmlText;
      document.body.appendChild(mount);
    }

    // 3. Engine Script
    const script = document.createElement('script');
    script.src = `wallet/wallet.js?v=${timestamp}`;
    script.onload = () => {
      window.WalletModule?.render();
      console.log("✅ AgriConnect Smart Wallet Module Initialized");
    };
    document.body.appendChild(script);

  } catch (err) {
    console.error("❌ Failed to load Smart Wallet Module:", err);
  }
})();
