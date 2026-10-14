// voice.js - Voice of Smart Farming Core Assistant

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognitionInstance = null;
let pendingVoiceSubmission = false;

// 1. వాయిస్ కమాండ్ ప్రాసెసింగ్ లాజిక్
function handleVoiceCommand(voiceText) {
  if (!voiceText) return;
  const input = voiceText.toLowerCase().trim();
  console.log("Processing Voice:", input);

  // A. సబ్మిట్ కన్ఫర్మేషన్ (రైతు 'సరే' లేదా 'పోస్ట్ చేయ్' అన్నప్పుడు)
  if (pendingVoiceSubmission) {
    if (input.includes("సరే") || input.includes("చేయ్") || input.includes("పోస్ట్") || input.includes("submit") || input.includes("ఓకే") || input.includes("అవును")) {
      pendingVoiceSubmission = false;
      const submitBtn = document.querySelector("button[onclick*='postJob'], .btn-submit, #submit-job-btn") || 
                        document.querySelector("button:has(.fa-paper-plane)") || 
                        document.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.click();
        speakTeluguText("కూలీల కోసం పని విజయవంతంగా పోస్ట్ చేయబడింది.");
      } else {
        speakTeluguText("వివరాలు సబ్మిట్ చేయబడ్డాయి.");
      }
      return;
    } else if (input.includes("వద్దు") || input.includes("ఆపు") || input.includes("కాదు")) {
      pendingVoiceSubmission = false;
      speakTeluguText("సరే, వివరాలు పోస్ట్ చేయలేదు.");
      return;
    }
  }

  // B. రైతు మోడ్‌లో ఉన్నప్పుడు - ఫారమ్ ఆటోమేటిక్‌గా నింపడం
  if (!window.AppState || window.AppState.currentRole === "FARMER") {
    let crop = "";
    let workType = "";
    let count = "";
    let wage = "";

    // అన్ని రకాల పంటల గుర్తింపు
    const cropKeywords = [
      "వరి", "పత్తి", "మిర్చి", "మిరప", "మొక్కజొన్న", "పసుపు", 
      "వేరుశనగ", "పల్లీ", "కంది", "పెసర", "మినుము", "సోయాబీన్", 
      "మామిడి", "టమాటా", "కూరగాయలు"
    ];
    for (let c of cropKeywords) {
      if (input.includes(c)) {
        crop = c;
        break;
      }
    }
    if (!crop) {
      const genericMatch = input.match(/([^\s]+)\s*(పంట|తోట)/);
      if (genericMatch) crop = genericMatch[1];
    }

    // పని రకం గుర్తింపు
    if (input.includes("కోత")) workType = "కోత";
    else if (input.includes("తీత") || input.includes("ఏరడం")) workType = "తీత";
    else if (input.includes("నాటు") || input.includes("నాట్లు")) workType = "నాట్లు";
    else if (input.includes("కలుపు")) workType = "కలుపు తీత";

    // కూలీల సంఖ్య గుర్తింపు
    const countMatch = input.match(/(\d+)\s*(మంది|గురు|కూలీలు)?/);

    if (countMatch) {
      count = countMatch[1];
    } else {
      if (input.includes("ఒక్కరు") || input.includes("ఒకరు")) count = "1";
      else if (input.includes("ఇద్దరు") || input.includes("రెండు")) count = "2";
      else if (input.includes("ముగ్గురు") || input.includes("మూడు")) count = "3";
      else if (input.includes("నలుగురు") || input.includes("నాలుగు")) count = "4";
      else if (input.includes("ఐదుగురు") || input.includes("ఐదు")) count = "5";
      else if (input.includes("ఆరుగురు") || input.includes("ఆరు")) count = "6";
    }

    // కూలీ మొత్తం (రూపాయలు)
    const wageMatch = input.match(/(\d{3,4})\s*(రూపాయలు|రూ)?/);
    if (wageMatch) {
      wage = wageMatch[1];
    }

    // స్క్రీన్‌పై ఉన్న ఇన్పుట్ బాక్సులను పట్టుకోవడం (ఐడీలు లేదా ప్లేస్‌హోల్డర్స్ ద్వారా)
    const cropInput = document.getElementById("job-crop") || document.getElementById("f-crop") || document.querySelector("input[placeholder*='పంట']");
    const workInput = document.getElementById("job-work") || document.getElementById("f-work") || document.querySelector("input[placeholder*='పని']");
    const countInput = document.getElementById("job-count") || document.getElementById("f-count") || document.querySelector("input[placeholder*='సంఖ్య']");
    const wageInput = document.getElementById("job-wage") || document.getElementById("f-wage") || document.querySelector("input[placeholder*='కూలీ']");

    if (crop && cropInput) cropInput.value = crop;
    if (workType && workInput) workInput.value = workType;
    if (count && countInput) countInput.value = count;
    if (wage && wageInput) wageInput.value = wage;

    // వాయిస్ ఫీడ్‌బ్యాక్ ఇవ్వడం
    if (crop || workType || count || wage) {
      pendingVoiceSubmission = true;
      let reply = "వివరాలు నమోదు చేశాను. ";
      if (crop) reply += crop + " ";
      if (workType) reply += workType + " పనికి ";
      if (count) reply += count + " మంది కూలీలు, ";
      if (wage) reply += "రోజుకు " + wage + " రూపాయలు. ";
      reply += "పోస్ట్ చేయమంటారా?";
      
      speakTeluguText(reply, () => {
        // మాట్లాడటం పూర్తయ్యాక సమాధానం వినడానికి మైక్ ఆన్ అవుతుంది
        startListening();
      });
      return;
    }
  }

  // సాధారణ కమాండ్లకు స్పందన
  if (input.includes("ఖాతా") || input.includes("వాలెట్")) {
    speakTeluguText("మీ వాలెట్ వివరాలు ఇక్కడ ఉన్నాయి.");
    document.getElementById("wallet-container")?.scrollIntoView({ behavior: "smooth" });
  } else if (input.includes("ధర") || input.includes("మార్కెట్") || input.includes("మండి")) {
    speakTeluguText("మార్కెట్ లైవ్ ధరల వివరాలు ఇక్కడ ఉన్నాయి.");
    document.getElementById("mandi-container")?.scrollIntoView({ behavior: "smooth" });
  } else {
    speakTeluguText("మీరు చెప్పింది అర్థం కాలేదు, దయచేసి వివరాలు మళ్లీ స్పష్టంగా చెప్పండి.");
  }
}

// మైక్ ఆన్ చేసే ఫంక్షన్
function startListening() {
  const micBtn = document.getElementById("global-voice-btn");
  if (recognitionInstance) {
    try {
      recognitionInstance.start();
      if (micBtn) micBtn.classList.add("listening");
    } catch (e) {
      // ఇప్పటికే మైక్ వింటుంటే ఎర్రర్ రాకుండా ఇగ్నోర్ చేస్తుంది
    }
  }
}

// 2. వాయిస్ అసిస్టెంట్ ఇనిషియలైజేషన్
function initVoiceAssistant() {
  if (document.getElementById("global-voice-btn")) return;

  const micBtn = document.createElement("button");
  micBtn.id = "global-voice-btn";
  micBtn.className = "floating-mic-btn";
  micBtn.innerHTML = "🎙️";
  micBtn.title = "మాట్లాడండి";
  document.body.appendChild(micBtn);

  if (!SpeechRecognition) {
    micBtn.addEventListener("click", () => {
      alert("మీ బ్రౌజర్‌లో Voice Speech API సపోర్ట్ లేదు. దయచేసి Google Chrome వాడండి.");
    });
    return;
  }

  recognitionInstance = new SpeechRecognition();
  recognitionInstance.lang = "te-IN";
  recognitionInstance.interimResults = false;
  let isListening = false;

  micBtn.addEventListener("click", () => {
    if (!isListening) {
      try {
        recognitionInstance.start();
        micBtn.classList.add("listening");
        isListening = true;
      } catch (err) {
        console.error("Mic start error:", err);
      }
    } else {
      recognitionInstance.stop();
      micBtn.classList.remove("listening");
      isListening = false;
    }
  });

  recognitionInstance.onresult = function(event) {
    micBtn.classList.remove("listening");
    isListening = false;
    const transcript = event.results[event.results.length - 1][0].transcript;
    console.log("Transcribed text:", transcript);

    // సరైన ఫంక్షన్‌ను పిలవడం
    handleVoiceCommand(transcript);
  };

  recognitionInstance.onerror = (event) => {
    micBtn.classList.remove("listening");
    isListening = false;
    console.error("Speech Error:", event.error);
  };

  recognitionInstance.onend = () => {
    micBtn.classList.remove("listening");
    isListening = false;
  };
}

// 3. తెలుగు ఆడియో రెస్పాన్స్ (Text to Speech)
function speakTeluguText(msg, onEndCallback) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel(); // మునుపటి మాటలను క్లియర్ చేయడం
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = "te-IN";
    utterance.rate = 0.95;
    
    if (onEndCallback) {
      utterance.onend = onEndCallback;
    }
    
    window.speechSynthesis.speak(utterance);
  }
}

// 4. ఆటో వాయిస్ టోగుల్ లాజిక్ (రైతు & కూలీ కోసం విడివిడిగా)
window.toggleAutoVoice = function(isEnabled) {
  if (window.AppState) {
    window.AppState.autoVoice = isEnabled;
  }
  
  if (isEnabled) {
    // 1. ఇంకా లాగిన్ కానప్పుడు (పబ్లిక్ ల్యాండింగ్ పేజీ)
    if (!window.AppState || !window.AppState.isLoggedIn) {
      speakTeluguText(
        "నమస్కారం! అగ్రి-కనెక్ట్‌కి స్వాగతం. మీరు రోజూ కూలీ పనులకు వెళ్లేవారైతే కూలీ ఆప్షన్ ఎంచుకోండి. వ్యవసాయం చేసే రైతు సోదరులైతే రైతు ఆప్షన్ ఎంచుకొని మీ మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి."
      );
      return;
    }

    // 2. డైరెక్ట్ కూలీ లాగిన్ అయినప్పుడు
    if (window.AppState.userType === "LABOUR_ONLY") {
      speakTeluguText("కూలీ ఖాతాలోకి స్వాగతం. ఇక్కడ మీకు అందుబాటులో ఉన్న పనులు మరియు మీ వాలెట్ వివరాలు మాత్రమే కనిపిస్తాయి. మీకు ఏ పని వివరాలు కావాలో చెప్పండి.", () => {
        startListening();
      });
      return;
    }

    // 3. రైతు లాగిన్ అయినప్పుడు
    if (window.AppState.userType === "FARMER") {
      if (window.AppState.currentRole === "LABOUR") {
        speakTeluguText("రైతు సోదరా, మీరు ప్రస్తుతం కూలీ మోడ్‌లో ఉన్నారు. అందుబాటులో ఉన్న పనులను చూపిస్తున్నాను.");
      } else {
        speakTeluguText("రైతు డాష్‌బోర్డ్‌కి స్వాగతం. మీకు ఏ పంట పనికి కూలీలు కావాలో చెప్పండి.", () => {
          startListening();
        });
      }
    }
  } else {
    speakTeluguText("ఆటోమేటిక్ వాయిస్ ఆఫ్ చేయబడింది.");
  }
};

// 5. ఆటో వాయిస్ చెక్‌బాక్స్ UI
function renderAutoVoiceToggle() {
  if (document.getElementById("auto-voice-toggle-container")) return;

  const toggleDiv = document.createElement("div");
  toggleDiv.id = "auto-voice-toggle-container";
  toggleDiv.style.cssText = "display:flex; justify-content:center; align-items:center; gap:8px; font-size:13px; font-weight:bold; margin:10px 0; color:#2e7d32;";

  toggleDiv.innerHTML = `
    <label style="cursor:pointer; display:flex; align-items:center; gap:6px; background:#e8f5e9; padding:6px 14px; border-radius:16px; box-shadow:0 1px 4px rgba(0,0,0,0.1);">
      <input type="checkbox" id="auto-voice-check" onchange="toggleAutoVoice(this.checked)" style="width:16px; height:16px; cursor:pointer;">
      🤖 ఆటో వాయిస్ గైడెన్స్ (Auto Voice)
    </label>
  `;

      // AgriConnect ఆకుపచ్చ హెడర్‌ను పక్కాగా గుర్తించే లాజిక్
  const findHeader = () => {
    return document.querySelector(".header") || 
           document.querySelector("header") ||
           Array.from(document.querySelectorAll("div")).find(d => 
             d.textContent && 
             d.textContent.trim().startsWith("AgriConnect") && 
             !d.id.includes("card") && 
             !d.id.includes("toggle")
           );
  };

  const headerElem = findHeader();

  if (headerElem && headerElem.parentNode) {
    headerElem.parentNode.insertBefore(toggleDiv, headerElem.nextSibling);
  } else {
    // వెంటనే దొరక్కపోతే మళ్లీ ట్రై చేసి హెడర్ కిందే వేస్తుంది
    const timer = setInterval(() => {
      const retryHeader = findHeader();
      if (retryHeader && retryHeader.parentNode) {
        retryHeader.parentNode.insertBefore(toggleDiv, retryHeader.nextSibling);
        clearInterval(timer);
      }
    }, 100);
    setTimeout(() => clearInterval(timer), 2000);
  }

// పేజీ లోడ్ అయిన వెంటనే ప్రారంభించడం
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => {
    initVoiceAssistant();
    renderAutoVoiceToggle();
  });
} else {
  initVoiceAssistant();
  renderAutoVoiceToggle();
}
