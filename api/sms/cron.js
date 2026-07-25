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

    const projectId = "circular-simplicity-kdw77";
    
    // Tunajaribu kusoma kupitia Firestore REST API ya moja kwa moja kwenye tables tofauti
    const possiblePaths = [
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/patient_reminders`,
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/patients`,
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/Appointments`,
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/wagonjwa`
    ];

    let reminders = [];

    for (const url of possiblePaths) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const documents = data.documents || [];
          
          for (const doc of documents) {
            const fields = doc.fields || {};
            const name = fields.jinaMgonjwa?.stringValue || fields.name?.stringValue || fields.fullName?.stringValue;
            const phone = fields.nambaSimu?.stringValue || fields.phone?.stringValue || fields.phoneNumber?.stringValue;
            const dawa = fields.dawaAlizopewa?.stringValue || fields.medication?.stringValue || '';
            const maelezo = fields.maelezoYaZiada?.stringValue || fields.maelezoYaDawa?.stringValue || '';

            if (phone) {
              reminders.push({
                jinaMgonjwa: name || 'Mgonjwa',
                nambaSimu: String(phone),
                dawaAlizopewa: dawa || 'Dawa',
                maelezoYaDawa: maelezo
              });
            }
          }
        }
      } catch (errPath) {
        console.log("Path error:", errPath);
      }
    }

    // Ondoa namba zinazojirudia
    const uniqueReminders = Array.from(new Set(reminders.map(a => a.nambaSimu)))
      .map(phone => reminders.find(a => a.nambaSimu === phone));

    const activeList = uniqueReminders.filter(r => r && r.nambaSimu && r.nambaSimu.length > 5);
    const targetSlot = (slot || 'jioni').toLowerCase();

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
      totalFound: uniqueReminders.length,
      totalActive: activeList.length,
      dispatchedCount: results.filter(r => r.status === 'success').length,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
}
