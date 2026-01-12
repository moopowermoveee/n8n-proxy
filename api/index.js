export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const response = await fetch(
      'https://pcu.budhosp.com/api/appsheet-n8n',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify(req.body),
      }
    );

    const text = await response.text(); // กัน JSON พัง

    res.status(response.status).send(text);

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
