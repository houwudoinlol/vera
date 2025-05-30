// api/vera.js
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Alleen POST
  if (req.method !== 'POST') {
    return res.status(405).end('Only POST allowed');
  }

  // Body parsen
  let body;
  try {
    body = await req.json();
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { message } = body;
  if (!message) {
    return res.status(400).json({ error: 'Missing "message" field' });
  }

  // OpenAI call
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.9,
      messages: [
        {
          role: 'system',
          content: `Jij bent Vera: een sarcastische, slimme AI-kat met attitude en ervaring…  
          (hier komt jouw volledige system-prompt met tone of voice en persona)`
        },
        { role: 'user', content: message }
      ]
    });

    const aiResponse = completion.choices?.[0]?.message?.content?.trim()
      || 'Sorry, ik kan nu niet antwoorden.';
    return res.status(200).json({ response: aiResponse });

  } catch (err) {
    console.error('OpenAI error:', err);
    return res.status(500).json({ error: 'OpenAI call failed' });
  }
}
