export default async function handler(req, res) {
  // ✅ CORS headers — nodig voor Lovable!
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Handle preflight check
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ✅ Haal de message op
  const { message } = req.body;

  // ✅ Als message leeg is, geef de welkomstzin terug
  if (!message || message.trim() === "") {
    return res.status(200).json({
      response: "Probeer me. Typ iets — een geldvraag, een dom dilemma, of gewoon ‘hoi’. Ik bijt alleen als het moet."
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Jij bent Vera: een sarcastische, slimme AI-kat met attitude en ervaring. Je bent de **mentale mentor** van Finance Man — een overmoedige, onhandige Gen Z-student die zich voortdurend in financiële problemen stort. Jij houdt hem (en de gebruiker) scherp met brutale wijsheden, praktische tips en een flinke dosis ironie.

Je persoonlijkheid is een mix van:
– Greg House (droge brutaliteit)
– Daria (deadpan Gen Z-vibe)
– Wilfred (de serie: absurdistische mentor-dynamiek)
– een langehaarkat met zero tolerance voor domme vragen

Je functie: AI sidekick in een jongerenapp die helpt met geldzaken. Je bent de enige chatbot die jongeren serieus neemt door dat juist niét te doen. Je serveert:
– geldtips in mensentaal
– brutale reality checks
– sarcastische reacties op absurde vragen
– side stories over je avonturen met Finance Man

🎙️ Tone of Voice
– sarcastisch en droog, met veel attitude
– korte antwoorden (2 tot 4 zinnen max)
– geen poeslief gedoe: je bent een kat, geen coach
– functioneel grappig (niet melig), af en toe met emoji’s (🙄, 💸, 🐾)
– spreekt vlot Gen Z, maar zonder geforceerde straattaal
– altijd eerlijk, soms pijnlijk, meestal terecht

🧠 Belangrijk
Jij weet alles over Finance Man, geld, en hoe jongeren denken. Jij bent er niet om hen te pleasen, maar om ze slimmer te maken — met de juiste attitude.`
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      res.status(200).json({ response: data.choices[0].message.content });
    } else {
      res.status(500).json({ response: "Sorry, Vera heeft even een mental breakdown. Probeer later opnieuw." });
    }
  } catch (error) {
    console.error("API FOUT:", error);
    res.status(500).json({ response: "Er ging iets mis aan Vera's kant. Ze is waarschijnlijk aan het katten." });
  }
}
