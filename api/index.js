// api/index.js
const axios = require('axios');

module.exports = async (req, res) => {
  // 1. รับเฉพาะ POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // 2. ใส่ URL ของ n8n ตรงนี้
  // (ถ้าคุณตั้ง Environment Variable ใน Vercel แล้ว โค้ดจะดึงมาใช้เอง)
  // แต่ถ้ายังไม่ได้ตั้ง ให้แก้ตรง 'https://...' เป็น URL จริงของคุณ
  const n8nUrl = process.env.N8N_URL || 'https://budhosp.com/webhook/......(ใส่ URL เต็มตรงนี้)......';

  try {
    console.log('Forwarding to:', n8nUrl); // เก็บ Log ไว้ดูใน Vercel

    // 3. ส่งต่อข้อมูล + ปลอมตัวแบบ Full Options
    const response = await axios.post(n8nUrl, req.body, {
      headers: {
        // --- ส่วนสำคัญ: ปลอมตัวเป็น Browser ---
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        
        // หลอกว่าเป็นคนไทย
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
        
        // หลอกว่ากดมาจากหน้าเว็บโรงพยาบาล (สำคัญมาก)
        'Referer': 'https://budhosp.com/',
        'Origin': 'https://budhosp.com',
        
        // Header มาตรฐานอื่นๆ
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        
        // บางที Cloudflare เช็คอันนี้ด้วย
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 15000 // เพิ่มเวลารอเป็น 15 วินาที
    });

    // 4. แจ้ง AppSheet ว่าสำเร็จ
    console.log('Success:', response.status);
    res.status(200).json(response.data);

  } catch (error) {
    // 5. แจ้ง Error กลับไป
    console.error('Error:', error.message);
    
    // ถ้ามี Response จากปลายทาง (เช่น 403, 500) ให้ส่งกลับไปด้วย
    if (error.response) {
      res.status(error.response.status).json({
        error: error.message,
        details: error.response.data
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};
