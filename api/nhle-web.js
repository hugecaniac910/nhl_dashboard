export default async function handler(req, res) {
  const path = req.url.replace('/api/nhle-web', '');
  const url  = `https://api-web.nhle.com${path}`;
  try {
    const response = await fetch(url);
    const data     = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}