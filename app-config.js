// ================= APP FUNCTIONAL CONFIGURATION =================
const APP_CONFIG = Object.freeze({
  // Regional & Market Defaults
  defaultMarket: "వరంగల్ మార్కెట్ (Warangal)",
  defaultCoordinates: { lat: 17.9689, lon: 79.5941 }, // Hanamkonda/Warangal GPS
  
  // Real-time Thresholds (Soil Sensors)
  soilThresholds: {
    minMoisture: 35, // 35% kante takkuva unte water alert
    idealMoisture: 50,
    idealPhMin: 6.0,
    idealPhMax: 7.5
  },

  // Fallback Mandi Rates (Firestore network lekapothe app crash avvakunda chupinchadaniki)
  defaultMandiRates: [
    { crop: "వరి (Paddy)", market: "వరంగల్", price: "2,320" },
    { crop: "మిర్చి (Chilli)", market: "వరంగల్", price: "14,500" },
    { crop: "పత్తి (Cotton)", market: "వరంగల్", price: "7,200" }
  ]
});
