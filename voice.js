// voice.js - Voice of Smart Farming Core Assistant

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function initVoiceAssistant() {
  // Mic button ni auto ga DOM lo inject chesthunnam (HTML lo id mismatch kakunda)
  const micBtn = document.createElement("button");
  micBtn.id = "global-voice-btn";
  micBtn.className = "floating-mic-btn";
  micBtn.innerHTML = "🎙️";
  micBtn.title = "Matladandi";
  document.body.appendChild(micBtn);

  if (!SpeechRecognition) {
    micBtn.addEventListener("click", () => {
      alert("Mee browser lo Voice Speech API support ledu. Google Chrome vaadandi.");
    });
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "te-IN"; // Telugu Language
  recognition.interimResults = false;
  let isListening = false;

  micBtn.addEventListener("click", () => {
    if (!isListening) {
      try {
        recognition.start();
        micBtn.classList.add("listening");
        isListening = true;
      } catch (err) {
        console.error("Mic start error:", err);
      }
    } else {
      recognition.stop();
      micBtn.classList.remove("listening");
      isListening = false;
    }
  });

  recognition.onresult = (event) => {
    micBtn.classList.remove("listening");
    isListening = false;
    const voiceText = event.results[0][0].transcript;
    console.log("Raitu / Kooli matladina maatalu:", voiceText);
    handleVoiceCommand(voiceText);
  };

  recognition.onerror = (event) => {
    micBtn.classList.remove("listening");
    isListening = false;
    console.error("Speech Error:", event.error);
  };

  recognition.onend = () => {
    micBtn.classList.remove("listening");
    isListening = false;
  };
}

// Voice Command Routing Logic
function handleVoiceCommand(text) {
  const query = text.toLowerCase();

  // 1. Koolilu / Farmer related
  if (query.includes("కూలీ") || query.includes("మంది") || query.includes("చేను") || query.includes("పని")) {
    const numbers = text.match(/\d+/g);
    const countInput = document.getElementById("f-count");
    const wageInput = document.getElementById("f-wage");

    if (countInput && numbers && numbers[0]) countInput.value = numbers[0];
    if (wageInput && numbers && numbers[1]) wageInput.value = numbers[1];

    speakTeluguText("Mee pani vivaralu raithu card lo register chesthunnaamu.");
    document.getElementById("farmer-post-container")?.scrollIntoView({ behavior: "smooth" });
  }
  // 2. Wallet balance related
  else if (query.includes("ఖాతా") || query.includes("పైసలు") || query.includes("డబ్బులు") || query.includes("వాలెట్")) {
    speakTeluguText("Mee wallet balance vivaralu screen pai choopinchadame jarigindi.");
    document.getElementById("wallet-container")?.scrollIntoView({ behavior: "smooth" });
  }
  // 3. Mandi / Market prices
  else if (query.includes("ధర") || query.includes("రేటు") || query.includes("మార్కెట్") || query.includes("మండి")) {
    speakTeluguText("Market live dharala vivaralu kinda mandee board lo unnaayi.");
    document.getElementById("mandi-container")?.scrollIntoView({ behavior: "smooth" });
  }
  // 4. Default Kooli Jobs search
  else {
    speakTeluguText("Mee maatanu gurthinchinaamu.");
    document.getElementById("labour-jobs-container")?.scrollIntoView({ behavior: "smooth" });
  }
}

// Telugu Audio Response (Text to Speech)
function speakTeluguText(msg) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = "te-IN";
    window.speechSynthesis.speak(utterance);
  }
}

// Auto init on page load
window.addEventListener("DOMContentLoaded", initVoiceAssistant);
