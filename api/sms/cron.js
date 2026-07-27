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
    const databaseId = "ai-studio-taaag3patientman-e756b5a4-7e45-4138-aa76-eec9c50dc039";
    
    // Tunatumia Database ID sahihi uliyoiona kwenye Console
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/patient_reminders`;

    let reminders = [];

    try {
      const fsRes = await fetch(firestoreUrl);
      if (fsRes.ok) {
        const fsData = await fsRes.json();
        const docs = fsData.documents || [];
        
        for (const doc of docs) {
          const docName = doc.name;
          const fields = doc.fields || {};
          
          // 1. Kusoma data kama zipo moja kwa moja kwenye Document kuu
          if (fields.nambaSimu || fields.jinaMgonjwa) {
            reminders.push({
              jinaMgonjwa: fields.jinaMgonjwa?.stringValue || 'Mgonjwa',
              nambaSimu: String(fields.nambaSimu?.stringValue || ''),
              dawaAlizopewa: fields.dawaAlizopewa?.stringValue || '',
              maelezoYaDawa: fields.maelezoYaZiada?.stringValue || fields.maelezoYaDawa?.stringValue || ''
            });
          }

          // 2. Kusoma data kama zipo kwenye Sub-collection ya ndani (kama inavyoonekana kwenye picha yako)
          try {
            const subUrl = `https://firestore.googleapis.com/v1/${docName}/patient_reminders`;
            const subRes = await fetch(subUrl);
            if (subRes.ok) {
              const subData = await subRes.json();
              const subDocs = subData.documents || [];
              for (const subDoc of subDocs) {
                const subFields = subDoc.fields || {};
                if (subFields.nambaSimu || subFields.jinaMgonjwa) {
                  reminders.push({
                    jinaMgonjwa: subFields.jinaMgonjwa?.stringValue || 'Mgonjwa',
                    nambaSimu: String(subFields.nambaSimu?.stringValue || ''),
                    dawaAlizopewa: subFields.dawaAlizopewa?.stringValue || '',
                    maelezoYaDawa: subFields.maelezoYaZiada?.stringValue || subFields.maelezoYaDawa?.stringValue || ''
                  });
                }
              }
            }
          } catch (subErr) {
            console.log("Sub-collection error:", subErr.message);
          }
        }
      }
    } catch (err) {
      console.log("Fetch error:", err.message);
    }

    const activeList = reminders.filter(r => r.nambaSimu && r.nambaSimu.length > 5);
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
      totalFound: reminders.length,
      totalActive: activeList.length,
      dispatchedCount: results.filter(r => r.status === 'success').length,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(200).json({ status: 'error', message: error.message });
  }
}

