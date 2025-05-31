// api/vera.js

import OpenAI from "openai";

// Maak zeker dat in package.json:
// "openai": "^4.32.0"
// én dat in Vercel - Settings → Environment Variables -
// OPENAI_API_KEY correct staat (sk-…).

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  // ─── CORS ─────────────────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).end("Only POST allowed");
  }

  // ─── Body parse ────────────────────────────────────────────────────
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
    return res
      .status(400)
      .json({ error: 'Missing "message" field in request body' });
  }

  // ─── Roep jouw “Assistant” als model aan ───────────────────────────
  try {
    const ASSISTANT_ID = "asst_BCKzcpy9RDonm59QlgNHSB1h"; // jouw gekopieerde ID
    const completion = await openai.chat.completions.create({
      model: ASSISTANT_ID,
      messages: [
        { role: "user", content: message }
      ]
      // je kunt eventueel temperature, max_tokens, etc. toevoegen hier
    });

    const aiMessage =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Sorry, ik kan nu even niet antwoorden.";

    return res.status(200).json({ response: aiMessage });
  } catch (err) {
    console.error("OpenAI Assistant error:", err);
    return res.status(500).json({ error: "Assistant call failed" });
  }
}
