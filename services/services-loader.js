// services/services-loader.js - Central Plug & Play Registry for AgriConnect
window.AgriServicesRegistry = {
  services: new Map(),

  // ఏ సర్వీస్ అయినా తనను తాను ఇక్కడ రిజిస్టర్ చేసుకుంటుంది
  register: function(serviceConfig) {
    if (!serviceConfig.id) return;
    this.services.set(serviceConfig.id, serviceConfig);

    // రైతు స్క్రీన్‌కు, ప్రొవైడర్ స్క్రీన్‌కు ఆటో-నోటిఫికేషన్
    if (window.FarmerModule?.refreshServiceTabs) {
      window.FarmerModule.refreshServiceTabs();
    }
    if (window.ProviderModule?.refreshServiceTabs) {
      window.ProviderModule.refreshServiceTabs();
    }
  },

  getAll: function() {
    return Array.from(this.services.values());
  },

  get: function(id) {
    return this.services.get(id);
  }
};

// ప్లగిన్ల లిస్ట్ - రేపు కొత్త సర్వీస్ (drones, soil_test) వస్తే కేవలం ఈ అరే లో పేరు రాస్తే చాలు!
(function loadRegisteredServices() {
  const activePlugins = ['equipment', 'seeds', 'transport'];

  activePlugins.forEach(pluginId => {
    const script = document.createElement('script');
    script.src = `services/${pluginId}/${pluginId}.js?v=${Date.now()}`;
    script.defer = true;
    document.body.appendChild(script);
  });

  console.log("🚀 AgriServices Dynamic Registry Initialized");
})();
