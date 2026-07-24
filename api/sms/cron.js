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
        tareheIliyowashwa: fields.tareheIliyowashwa?.stringValue || '',
        mudaJioni: fields.mudaJioni?.stringValue || '20:00',
        mudaAsubuhi: fields.mudaAsubuhi?.stringValue || '08:00',
        mudaMchana: fields.mudaMchana?.stringValue || '14:00'
      };
    }).filter(r => r.haliYaUkumbusho === 'HAI' && r.nambaSimu);

    const targetSlot = (slot || 'auto').toLowerCase();
    
    // Kuchuja wagonjwa kulingana na slot husika ili isisome 'totalActive: 0'
    const activeList = reminders.filter(r => {
      if (targetSlot === 'subhi' || targetSlot === 'asubuhi') return !!r.mudaAsubuhi;
      if (targetSlot === 'mchana') return !!r.mudaMchana;
      if (targetSlot === 'jioni') return !!r.mudaJioni;
      return true; // Kama ni auto, chukua wote
    });

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
