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
    const base = baseUrl || 'https://api.oasistech.co.tz/v1/sms/send';

    let formattedTo = to;
    if (Array.isArray(to) && to.length > 0) {
      let num = String(to[0]).trim();
      if (num.startsWith('0')) {
        num = '255' + num.substring(1);
      }
      formattedTo = num;
    } else if (typeof to === 'string') {
      let num = to.trim();
      if (num.startsWith('0')) {
        num = '255' + num.substring(1);
      }
      formattedTo = num;
    }

    // Jaribu kutumia URLSearchParams (Form Urlencoded) ambayo mara nyingi hukubaliwa moja kwa moja na APIs za SMS
    const params = new URLSearchParams();
    params.append('source', from);
    params.append('destination', formattedTo);
    params.append('message', text);

    const targetUrl = `${base}?${params.toString()}`;
    console.log("Sending to Oasis (URL Encoded Get/Post):", targetUrl);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
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
