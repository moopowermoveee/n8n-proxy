import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const response = await fetch('https://pcu.budhosp.com/api/appsheet-n8n', {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'your-api-key' // ถ้าคุณตั้ง
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
