export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const response = await fetch('https://pcu.budhosp.com/api/appsheet-n8n', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // ลองปลอม User-Agent บางครั้ง Cloudflare จะปล่อย
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text(); // 👈 ใช้ text กัน JSON แตก

    return res.status(response.status).send(text);

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
