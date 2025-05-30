// api/vera.js
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Alleen POST
  if (req.method !== 'POST') return res.status(405).end('Only POST allowed');

  // 1) Body handmatig inlezen
  let body;
  try {
    // req.body bestaat alleen als Vercel het al parse't, anders zelf inlezen
    if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else {
      const text = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
        req.on('error', err => reject(err));
      });
      body = JSON.parse(text);
    }
  } catch (e) {
    console.error('Invalid JSON:', e);
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { message } = body;
  if (!message) {
    return res.status(400).json({ error: 'Missing "message" field' });
  }

  // 2) Call OpenAI
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.9,
      messages: [
        {
          role: 'system',
          content: `Jij bent Vera: een sarcastische, slimme AI-kat met attitude en ervaring. ... (jouw volledige prompt hier)`
        },
        { role: 'user', content: message }
      ]
    });

    const aiResponse = completion.choices?.[0]?.message?.content?.trim()
      || "Sorry, ik kan nu niet antwoorden.";
    return res.status(200).json({ response: aiResponse });

  } catch (err) {
    console.error('OpenAI error:', err);
    return res.status(500).json({ error: 'OpenAI call failed' });
  }
}
