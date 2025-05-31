// api/vera.js

import { OpenAI } from 'openai';

// Maak hier je OpenAI-client aan met je API-sleutel uit Vercel's env-vars
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  // ===== CORS-headers (zodat Lovable/ieder frontend-domain mag posten) =====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Always reply OK to preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Alleen POST-requests toestaan
  if (req.method !== 'POST') {
    return res.status(405).end('Only POST allowed');
  }

  // ===== Body-manipulatie: handmatig JSON inlezen =====
  let body;
  try {
    // Als Vercel req.body al parsed als object, gebruik dat
    if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else {
      // Anders buffer de inkomende data en parse naar JSON
      const text = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => data += chunk);
        req.on('end', () => resolve(data));
        req.on('error', (err) => reject(err));
      });
      body = JSON.parse(text);
    }
  } catch (err) {
    console.error('Invalid JSON received:', err);
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { message } = body;
  if (!message) {
    return res.status(400).json({ error: 'Missing "message" field' });
  }

  // ===== Roep jouw OpenAI Agent aan =====
  try {
    // Vervang hieronder door jouw exacte Agent ID:
    const agentId = 'asst_BCKzcpy9RDonm59QlgNHSB1h';

    const runResponse = await openai.agent.runs.create({
      agent: agentId,
      input: message
    });

    // De Agent-response zit in runResponse.choices[0].message.content
    const aiMessage = runResponse.choices?.[0]?.message?.content?.trim()
                     || 'Sorry, Vera kan nu niet antwoorden.';

    return res.status(200).json({ response: aiMessage });
  } catch (err) {
    console.error('OpenAI Agent error:', err);
    return res.status(500).json({ error: 'OpenAI Agent call failed' });
  }
}
