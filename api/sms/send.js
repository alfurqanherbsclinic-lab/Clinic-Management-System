export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiKey, from, to, text, baseUrl } = req.body;
    const targetUrl = baseUrl || 'https://api.oasistech.co.tz/v1/sms/send';

    let formattedTo = to;
    if (Array.isArray(to) && to.length > 0) {
      let num = String(to[0]).trim();
      if (num.startsWith('0')) {
        num = '255' + num.substring(1);
      }
      formattedTo = [num];
    } else if (typeof to === 'string') {
      let num = to.trim();
      if (num.startsWith('0')) {
        num = '255' + num.substring(1);
      }
      formattedTo = [num];
    }

    // Muundo mahususi unaotumiwa na gateway nyingi za Oasis Bulk SMS
    const oasisPayload = {
      senderid: from,
      number: formattedTo[0],
      message: text
    };

    console.log("Sending to Oasis (Standard Format):", targetUrl, oasisPayload);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(oasisPayload)
    });

    const responseText = await response.text();
    console.log("Oasis Response Status:", response.status);
    console.log("Oasis Response Text:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Function Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
