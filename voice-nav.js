// ================= VOICE NAVIGATION MODULE =================
let recognitionInstance = null;

function initVoiceNavigation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Browser lo Speech Recognition support ledu.");
    return;
  }

  recognitionInstance = new SpeechRecognition();
  recognitionInstance.continuous = false;
  recognitionInstance.lang = "te-IN"; // Telugu input primary
  recognitionInstance.interimResults = false;

  recognitionInstance.onstart = function () {
    const status = document.getElementById("voice-status-text");
    if (status) status.innerText = "🎙️ Vinapaduthondi... Maatladandi...";
  };

  recognitionInstance.onresult = function (event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    const status = document.getElementById("voice-status-text");
    if (status) status.innerText = `🗣️ Meeru annadi: "${transcript}"`;
    executeVoiceCommand(transcript);
  };

  recognitionInstance.onerror = function (event) {
    const status = document.getElementById("voice-status-text");
    if (status) status.innerText = "⚠️ Voice ardham kaledu, malli prayatninchandi.";
  };
}

function startVoiceCommand() {
  if (!recognitionInstance) {
    initVoiceNavigation();
  }
  if (recognitionInstance) {
    try {
      recognitionInstance.start();
    } catch (e) {
      recognitionInstance.stop();
    }
  }
}

function executeVoiceCommand(cmd) {
  if (cmd.includes("weather") || cmd.includes("vatavaranam") || cmd.includes("వాతావరణం")) {
    if (typeof getLiveLocationWeather === "function") getLiveLocationWeather();
  } else if (cmd.includes("sensor") || cmd.includes("tema") || cmd.includes("సెన్సార్")) {
    if (typeof openSoilSensors === "function") openSoilSensors();
  } else if (cmd.includes("soil") || cmd.includes("pariksha") || cmd.includes("భూసార")) {
    if (typeof openSoilTest === "function") openSoilTest();
  } else if (cmd.includes("rate") || cmd.includes("dhara") || cmd.includes("మండి")) {
    const el = document.getElementById("mandi-rates-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }
}

document.addEventListener("DOMContentLoaded", initVoiceNavigation);
