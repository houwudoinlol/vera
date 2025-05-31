// api/vera.js

import OpenAI from "openai";

// Let op: je SDK moet versie ≥ 4.31.0 zijn.
// In package.json: "openai": "^4.32.0" (of hoger).
// Vercel moet dan exact die versie installeren (inclusief package-lock.json).

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  // ─── 1) CORS ──────────────────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).end("Only POST allowed");
  }

  // ─── 2) Body parsing (handmatig, want Vercel parse klopt niet altijd) ─
  let body;
  try {
    if (req.body && typeof req.body === "object") {
      body = req.body;
    } else {
      const text = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => resolve(data));
        req.on("error", (err) => reject(err));
      });
      body = JSON.parse(text);
    }
  } catch (err) {
    console.error("Invalid JSON:", err);
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { message } = body;
  if (!message) {
    return res.status(400).json({ error: 'Missing "message" field' });
  }

  // ─── 3) Oproepen van je Assistant via chat.completions ────────────────
  try {
    // Zet hier wél jouw Assistant-ID
    const ASSISTANT_ID = "asst_BCKzcpy9RDonm59QlgNHSB1h";

    // We vullen een standaard chat-completion:
    const completion = await openai.chat.completions.create({
      model: ASSISTANT_ID,
      messages: [
        // altijd minstens één “user” message nodig
        { role: "user", content: message }
      ]
      // (je kunt hier eventueel nog temperature, max_tokens, enz. instellen)
    });

    // De API returnt choices[0].message.content
    const aiMessage =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Sorry, Vera kan nu even niet antwoorden.";

    return res.status(200).json({ response: aiMessage });
  } catch (err) {
    console.error("OpenAI Assistant error:", err);
    return res.status(500).json({ error: "OpenAI Assistant call failed" });
  }
}
