// ================= APP FUNCTIONAL CONFIGURATION =================
const APP_CONFIG = Object.freeze({
  // Regional & Market Defaults
  defaultMarket: "వరంగల్ మార్కెట్ (Warangal)",
  defaultCoordinates: { lat: 17.9689, lon: 79.5941 },

  // Soil Sensor Alert Limits
  soilThresholds: {
    minMoisture: 35,
    idealMoisture: 50,
    idealPhMin: 6.0,
    idealPhMax: 7.5
  }
});
