// api/vera.js
export default async function handler(req, res) {
  // CORS-headers om cross-origin calls toe te staan
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Alleen POST toegestaan
  if (req.method !== 'POST') {
    return res.status(405).send('Only POST allowed');
  }

  // Probeer de JSON body te parsen
  let body;
  try {
    body = typeof req.body === 'object'
      ? req.body
      : JSON.parse(await new Promise(r => {
          let d=''; req.on('data',c=>d+=c); req.on('end',()=>r(d));
        }));
  } catch (e) {
    console.error('Invalid JSON:', e);
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  console.log('✅ Echo endpoint got body:', body);

  // Echo back what we got
  const { message } = body;
  if (!message) {
    return res.status(400).json({ error: 'Missing "message" field' });
  }

  return res.status(200).json({ response: `Echo: ${message}` });
}
