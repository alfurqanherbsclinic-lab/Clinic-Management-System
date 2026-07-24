export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiKey, from, to, text, baseUrl } = req.body || {};

    let targetUrl = 'https://bulksms.oasistech.co.tz/api/sms';
    if (baseUrl && typeof baseUrl === 'string' && baseUrl.startsWith('http')) {
      targetUrl = baseUrl.split('|')[0].replace('[', '').trim();
      if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://bulksms.oasistech.co.tz/api/sms';
      }
    }

    let simu = Array.isArray(to) ? to[0] : to;
    simu = String(simu || '').trim();
    if (simu.startsWith('0')) {
      simu = '255' + simu.substring(1);
    }
    simu = simu.replace('+', '');

    const senderName = from || "AHC MKONONI";
    const payload = {
      to: simu,
      recipient: simu,
      message: text,
      text: text,
      sender: senderName,
      from: senderName,
      sender_id: senderName
    };

    console.log("Inatuma SMS kwenda Oasis:", simu, "Kutoka:", senderName);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    // Hizi zitaandika majibu yote ya Oasis kwenye Vercel Logs
    console.log("Oasis Response Status:", response.status);
    console.log("Oasis Response Data:", JSON.stringify(data));

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("SMS Dispatch Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
