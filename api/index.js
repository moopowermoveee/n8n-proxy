// api/test-moph.js
const crypto = require('crypto');
const axios = require('axios');

export default async function handler(req, res) {
    // ตั้งค่าตัวแปร (แนะนำให้ไปตั้งใน Environment Variables ของ Vercel จะปลอดภัยกว่า)
    // แต่ถ้าทดสอบชั่วคราว ใส่ตรงนี้ได้เลย
    const MOPH_USER = 'itmoo-ph';
    const MOPH_HCODE = '77610';
    const MOPH_SECRET_KEY = '@Bowmaylada2528'; 
    const MOPH_SECRET_SALT = '$jwt@moph#';

    try {
        console.log("--- Vercel Function Start ---");

        // 1. สร้าง Hash (Logic เดิม)
        // Node.js: เอา Key (Salt) ขึ้นก่อน Data
        const signature = crypto.createHmac('sha256', MOPH_SECRET_SALT)
                                .update(MOPH_SECRET_KEY)
                                .digest('hex');
        
        const keyhash = signature.toUpperCase();

        // 2. เตรียม Payload
        const tokenPayload = {
            'user': MOPH_USER,
            'password_hash': keyhash,
            'hospital_code': MOPH_HCODE
        };

        // 3. ยิงไป MOPH
        const response = await axios.post(
            'https://cvp1.moph.go.th/token?Action=get_moph_access_token', 
            tokenPayload, 
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000 // 15 วินาที
            }
        );

        // 4. ส่งผลลัพธ์กลับมาที่หน้าเว็บเรา
        res.status(200).json({
            status: "Success",
            moph_response: response.data
        });

    } catch (error) {
        console.error("Error Occurred");
        
        // กรณีมี Error จาก MOPH หรือ Connection
        const errorData = {
            status: "Error",
            message: error.message,
            moph_status: error.response ? error.response.status : "No Response",
            moph_body: error.response ? error.response.data : null
        };

        // ถ้าเจอคำว่า terminated แสดงว่าโดนบล็อก IP
        if (error.response && error.response.data === 'terminated') {
            errorData.explanation = "⚠️ โดนบล็อก IP (Whitelist Required)";
        }

        res.status(500).json(errorData);
    }
}
