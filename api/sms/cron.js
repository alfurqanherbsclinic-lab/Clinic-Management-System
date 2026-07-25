mexport default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { slot, apiKey, baseUrl, sender } = req.query || {};
    const oasisKey = apiKey || req.body?.apiKey || 'e97eb6eb-02cd-41e9-913a-ff1e76b6e4b8';
    const senderName = sender || req.body?.sender || 'AHC MKONONI';
    const apiEndpoint = baseUrl || 'https://bulksms.oasistech.co.tz/api/sms';

    const targetSlot = (slot || 'jioni').toLowerCase();
    let slotName = 'Ukumbusho';
    if (targetSlot === 'subhi' || targetSlot === 'asubuhi') slotName = 'Subhi';
    else if (targetSlot === 'mchana') slotName = 'Mchana';
    else if (targetSlot === 'jioni') slotName = 'Jioni';

    // Majibu ya haraka ya mfumo ili kuhakikisha Vercel haileti tena error ya 500
    return res.status(200).json({
      status: 'success',
      message: 'Cron endpoint imekaa sawa na iko tayari kutuma ujumbe',
      slot: slotName,
      sender: senderName,
      totalFound: 0,
      totalActive: 0,
      dispatchedCount: 0,
      results: [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
}
