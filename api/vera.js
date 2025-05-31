// api/vera.js

import { OpenAI } from 'openai';

// Initialiseer OpenAI met je API-sleutel (env-var in Vercel)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  // ===== CORS-headers =====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    // Preflight-verzoek beantwoorden
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).end('Only POST allowed');
  }

  // ===== Body parsing =====
  let body;
  try {
    if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else {
      const text = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => data += chunk);
        req.on('end', () => resolve(data));
        req.on('error', (err) => reject(err));
      });
      body = JSON.parse(text);
    }
  } catch (err) {
    console.error('Invalid JSON:', err);
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { message } = body;
  if (!message) {
    return res.status(400).json({ error: 'Missing "message" field' });
  }

  try {
    // ===== Roep je Assistant aan =====
    const assistantId = 'asst_BCKzcpy9RDonm59QlgNHSB1h'; // jouw Assistant ID

    const runResponse = await openai.assistants.runs.create({
      assistant: assistantId,
      input: message
    });

    // In de response vind je de tekst in:
    // runResponse.choices[0].message.content
    const aiMessage =
      runResponse.choices?.[0]?.message?.content?.trim()
      || 'Sorry, ik kan nu even niet antwoorden.';

    return res.status(200).json({ response: aiMessage });
  } catch (err) {
    console.error('OpenAI Assistant error:', err);
    return res.status(500).json({ error: 'OpenAI Assistant call failed' });
  }
}
