export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ✏️ Je bestaande logic (voorbeeld)
  const { message } = req.body;

  // Eenvoudig testantwoord
  const reply = `Je zei: ${message}`;

  res.status(200).json({ response: reply });
}
export default async function handler(req, res) {
  const { prompt } = req.body;

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
          content: "Je bent Vera, een sarcastische AI voor Gen Z. Geef korte, directe geldtips of een brutale roast."
        },
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await response.json();
  res.status(200).json({ response: data.choices[0].message.content });
}
