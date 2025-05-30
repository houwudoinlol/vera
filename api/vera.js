export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ✅ Haal de message op (let op: niet prompt maar message!)
  const { message } = req.body;

  // ✅ Roep OpenAI aan
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
            content: "Je bent Vera, een sarcastische AI voor Gen Z. Geef korte, directe geldtips of een brutale roast. Je toon is eerlijk, grappig, en een beetje kattig. Je antwoordt altijd in het Nederlands."
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
