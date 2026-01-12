const crypto = require('crypto');

export default async function handler(req, res) {
  // 1. รับเฉพาะ POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    // ดึงค่าจาก Environment Variables (ต้องไปตั้งค่าใน Vercel ด้วย)
    // หรือถ้าทดสอบ Hardcode ให้แก้ตรงนี้เลย
    const MOPH_USER = process.env.MOPH_USER || '...ใส่ USER...';
    const MOPH_HCODE = process.env.MOPH_HCODE || '...ใส่ HCODE...';
    
    // *** จุดสำคัญที่ต้องระวัง ***
    const secretKeyData = process.env.MOPH_SECRET_KEY || '...ใส่ SECRET KEY...'; // ใน PHP คือ Data
    const secretSaltKey = process.env.MOPH_SECRET_SALT || '...ใส่ SALT...';      // ใน PHP คือ Key

    // --- ส่วนคำนวณ Hash (แปลงจาก PHP) ---
    
    // PHP: hash_hmac('sha256', Data, Key)
    // Node: crypto.createHmac('sha256', Key).update(Data)
    
    const sig = crypto.createHmac('sha256', secretSaltKey) // ใส่ SALT (Key) ตรงนี้
                      .update(secretKeyData)               // ใส่ SECRET KEY (Data) ตรงนี้
                      .digest('hex');

    // แปลงเป็นตัวพิมพ์ใหญ่
    const keyhash = sig.toUpperCase();

    // ------------------------------------

    console.log('Generated Hash:', keyhash);

    // เตรียม Payload
    const mophPayload = {
        'user': MOPH_USER,
        'password_hash': keyhash,
        'hospital_code': MOPH_HCODE
    };

    // ยิง Request ไปหา MOPH
    const response = await fetch(
      'https://cvp1.moph.go.th/token?Action=get_moph_access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify(mophPayload),
      }
    );

    const data = await response.text();
    
    // ส่งผลลัพธ์กลับ
    try {
        res.status(response.status).json(JSON.parse(data));
    } catch (e) {
        res.status(response.status).send(data);
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
