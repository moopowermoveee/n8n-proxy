// api/index.js
const axios = require('axios');

module.exports = async (req, res) => {
  // 1. รับเฉพาะ POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // 2. ใส่ URL ของ n8n ตรงนี้ (หรือจะไปตั้งใน Environment Variable ก็ได้)
  const n8nUrl = process.env.N8N_URL || 'https://budhosp.com/webhook/... (ใส่ URL เต็มของคุณ)';

  try {
    // 3. ส่งต่อข้อมูล + ปลอมตัวเป็น Browser
    const response = await axios.post(n8nUrl, req.body, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/json'
      }
    });

    // 4. แจ้ง AppSheet ว่าสำเร็จ
    res.status(200).json(response.data);
  } catch (error) {
    // 5. แจ้ง Error
    res.status(500).json({ error: error.message });
  }
};