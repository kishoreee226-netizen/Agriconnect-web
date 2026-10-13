function handleVoiceCommand(text) {
  const query = text.toLowerCase();
  console.log("Input maata:", query);

  // 1. Farmer Job Post Fill Logic
  if (query.includes("కూలీ") || query.includes("చేను") || query.includes("పని") || query.includes("మంది") || query.includes("రైతు")) {
    
    // Inputs ni thecchukovadam
    const cropInput = document.getElementById("f-crop");
    const workInput = document.getElementById("f-work");
    const countInput = document.getElementById("f-count");
    const wageInput = document.getElementById("f-wage");

    // Panta gurthimpu
    if (cropInput) {
      if (query.includes("వరి") || query.includes("వరిచేను")) cropInput.value = "వరి";
      else if (query.includes("పత్తి")) cropInput.value = "పత్తి";
      else if (query.includes("మిర్చి")) cropInput.value = "మిర్చి";
      else if (query.includes("మొక్కజొన్న")) cropInput.value = "మొక్కజొన్న";
    }

    // Pani gurthimpu
    if (workInput) {
      if (query.includes("కోత")) workInput.value = "కోత";
      else if (query.includes("తీయడం") || query.includes("ఏరడం")) workInput.value = "తీత";
      else if (query.includes("నాటు")) workInput.value = "నాట్లు";
      else workInput.value = "పని";
    }

    // Numbers (Coolila sankhya & wage)
    const numbers = text.match(/\d+/g);
    if (numbers) {
      if (numbers.length >= 1 && countInput) countInput.value = numbers[0];
      if (numbers.length >= 2 && wageInput) wageInput.value = numbers[1];
    }

    speakTeluguText("రైతు ఫారంలో వివరాలు నమోదు చేశాము.");
    document.getElementById("farmer-post-container")?.scrollIntoView({ behavior: "smooth" });
  } 
  // 2. Wallet
  else if (query.includes("ఖాతా") || query.includes("పైసలు") || query.includes("డబ్బులు") || query.includes("వాలెట్")) {
    speakTeluguText("మీ వాలెట్ వివరాలు ఇక్కడ ఉన్నాయి.");
    document.getElementById("wallet-container")?.scrollIntoView({ behavior: "smooth" });
  } 
  // 3. Mandi
  else if (query.includes("ధర") || query.includes("రేటు") || query.includes("మార్కెట్") || query.includes("మండి")) {
    speakTeluguText("మార్కెట్ లైవ్ ధరల వివరాలు కింద ఉన్నాయి.");
    document.getElementById("mandi-container")?.scrollIntoView({ behavior: "smooth" });
  } 
  // 4. Default Labour jobs
  else {
    speakTeluguText("మీ మాట విన్నాము.");
    document.getElementById("labour-jobs-container")?.scrollIntoView({ behavior: "smooth" });
  }
}
