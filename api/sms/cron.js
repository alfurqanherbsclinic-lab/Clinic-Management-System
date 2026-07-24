export default async function handler(req, res) {
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

    const projectId = "alfurqan-clinic";
    const dbId = "(default)";
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/patient_reminders`;

    let docs = [];
    try {
      const fsRes = await fetch(firestoreUrl);
      if (fsRes.ok) {
        const fsData = await fsRes.json();
        docs = fsData.documents || [];
      }
    } catch (e) {
      console.log("Firestore fetch error:", e.message);
    }

    const reminders = docs.map(docItem => {
      const fields = docItem.fields || {};
      return {
        id: docItem.name ? docItem.name.split('/').pop() : '1',
        jinaMgonjwa: fields.jinaMgonjwa?.stringValue || 'Mgonjwa',
        nambaSimu: fields.nambaSimu?.stringValue || '',
        dawaAlizopewa: fields.dawaAlizopewa?.stringValue || '',
        maelezoYaDawa: fields.maelezoYaDawa?.stringValue || '',
        haliYaUkumbusho: fields.haliYaUkumbusho?.stringValue || 'HAI',
        tareheIliyowashwa: fields.tareheIliyowashwa?.stringValue || ''
      };
    }).filter(r => r.haliYaUkumbusho === 'HAI' && r.nambaSimu);

    const phoneMap = new Map();
    reminders.forEach(r => {
      const cleanPhone = r.nambaSimu.replace(/[^\d]/g, '');
      if (!cleanPhone) return;
      if (!phoneMap.has(cleanPhone)) {
        phoneMap.set(cleanPhone, r);
      }
    });

    const activeList = Array.from(phoneMap.values());
    const targetSlot = (slot || 'auto').toLowerCase();
    const results = [];

    for (const patient of activeList) {
      let phone = patient.nambaSimu.replace(/[^\d]/g, '');
      if (phone.startsWith('0')) {
        phone = '255' + phone.substring(1);
      }

      let slotName = 'Ukumbusho';
      if (targetSlot === 'subhi' || targetSlot === 'asubuhi') slotName = 'Subhi';
      else if (targetSlot === 'mchana') slotName = 'Mchana';
      else if (targetSlot === 'jioni') slotName = 'Jioni';

      const msg = `Assalam Alaykum / Habari Ndg ${patient.jinaMgonjwa.toUpperCase()}, huu ni ukumbusho wa Al-Furqan Herbs Clinic wa kunywa dawa zako: ${patient.dawaAlizopewa}. ${patient.maelezoYaDawa ? 'Maelezo: ' + patient.maelezoYaDawa + '.' : ''} Awamu: ${slotName}. Afya bora ni mtaji wako!`;

      try {
        const smsRes = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oasisKey}`
          },
          body: JSON.stringify({
            to: phone,
            recipient: phone,
            message: msg,
            text: msg,
            sender: senderName,
            from: senderName,
            sender_id: senderName
          })
        });

        const smsData = await smsRes.json().catch(() => ({}));
        results.push({
          patient: patient.jinaMgonjwa,
          phone: phone,
          slot: slotName,
          status: smsRes.ok ? 'success' : 'failed',
          response: smsData
        });
      } catch (err) {
        results.push({
          patient: patient.jinaMgonjwa,
          phone: phone,
          slot: slotName,
          status: 'failed',
          error: err.message
        });
      }
    }

    return res.status(200).json({
      status: 'success',
      totalActive: activeList.length,
      dispatchedCount: results.filter(r => r.status === 'success').length,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
}
