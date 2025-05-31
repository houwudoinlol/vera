// api/vera.js

export default async function handler(req, res) {
  // 1️⃣ CORS-headers om Lovable en elke frontend toe te staan
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).end('Only POST allowed');
  }

  // 2️⃣ Body parsing (Vercel parseert soms niet automatisch)
  let body;
  try {
    if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else {
      // Handmatig uitlezen
      const text = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
        req.on('error', err => reject(err));
      });
      body = JSON.parse(text);
    }
  } catch (err) {
    console.error('Invalid JSON:', err);
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { message } = body;
  if (!message) {
    return res.status(400).json({ error: 'Missing \"message\" field' });
  }

  // 3️⃣ Roep de Assistants-API rechtstreeks aan via fetch
  try {
    const ASSISTANT_ID = 'asst_BCKzcpy9RDonm59QlgNHSB1h'; // jouw Assistant ID
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const endpoint = `https://api.openai.com/v1/assistants/${ASSISTANT_ID}/runs`;

    const apiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input: message })
    });

    if (!apiResponse.ok) {
      const errJson = await apiResponse.json().catch(() => ({}));
      console.error('Assistant HTTP error:', apiResponse.status, errJson);
      return res.status(500).json({ error: 'Assistant call failed' });
    }

    const runResponse = await apiResponse.json();
    const aiMessage =
      runResponse.choices?.[0]?.message?.content?.trim()
      || 'Sorry, Vera kan nu even niet antwoorden.';

    return res.status(200).json({ response: aiMessage });
  } catch (err) {
    console.error('Fetch to Assistant endpoint failed:', err);
    return res.status(500).json({ error: 'Assistant fetch failed' });
  }
}
