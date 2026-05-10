const https = require('https');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, gl } = req.query;
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    return res.status(500).json({ error: 'Search not configured' });
  }

  if (!q) return res.status(400).json({ error: 'Missing query' });

  const params = new URLSearchParams({
    key: apiKey,
    cx: searchEngineId,
    q: q,
    num: '6',
    gl: gl || 'es',
    hl: 'es'
  });

  const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;

  https.get(url, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      try {
        res.status(200).json(JSON.parse(data));
      } catch(e) {
        res.status(500).json({ error: 'Parse error' });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
}
