const https = require('https');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, gl } = req.query;
  const apiKey = process.env.SERP_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'Search not configured' });
  if (!q) return res.status(400).json({ error: 'Missing query' });

  const params = new URLSearchParams({
    api_key: apiKey,
    engine: 'google_shopping',
    q: q,
    hl: 'es',
    gl: gl || 'es',
    num: '6'
  });

  const url = `https://serpapi.com/search.json?${params.toString()}`;

  https.get(url, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        res.status(200).json({
          results: parsed.shopping_results || [],
          error: parsed.error || null
        });
      } catch(e) {
        res.status(500).json({ error: 'Parse error' });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
}
