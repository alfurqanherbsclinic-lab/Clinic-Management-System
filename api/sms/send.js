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
    
    // Safisha baseUrl isome URL sahihi tu bila kujirudia
    let targetUrl = 'https://bulksms.oasistech.co.tz/api/sms';
    if (baseUrl && baseUrl.startsWith('http')) {
      // Chagua ile URL ya kwanza tu kama zimegongana
      targetUrl = baseUrl.split(']')[0].replace('[', '').trim();
      if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://bulksms.oasistech.co.tz/api/sms';
      }
    }

    let simu = Array.isArray(to) ? to[0] : to;
    simu = String(simu).trim();
    if (simu.startsWith('0')) {
      simu = '255' + simu.substring(1);
    }
    simu = simu.replace('+', '');

    const payload = {
      to: simu,
      message: text,
      sender: from || "AHC MKONONI"
    };

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

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
