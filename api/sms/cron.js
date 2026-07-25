import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
    let firebaseConfig = {};
    try {
      const configModule = await import('../../firebase-applet-config.json');
      firebaseConfig = configModule.default || configModule;
    } catch (err) {
      console.log("Kumbukumbu ya config imesomwa kwa njia mbadala.");
    }

    const { slot, apiKey, baseUrl, sender } = req.query || {};
    const oasisKey = apiKey || req.body?.apiKey || 'e97eb6eb-02cd-41e9-913a-ff1e76b6e4b8';
    const senderName = sender || req.body?.sender || 'AHC MKONONI';
    const apiEndpoint = baseUrl || 'https://bulksms.oasistech.co.tz/api/sms';

    // Njia mbadala ya moja kwa moja kupitia REST API kwa ajili ya kusoma sub-collection ya Firebase
    const projectId = "circular-simplicity-kdw77";
    
    // Tunachota data kwa kutumia njia ya moja kwa moja ya dokumenti zilizopo chini ya patient_reminders
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/patient_reminders`;

    let reminders = [];
    try {
      const fsRes = await fetch(firestoreUrl);
      if (fsRes.ok) {
        const fsData = await fsRes.json();
        const docs = fsData.documents || [];
        
        for (const doc of docs) {
          const docPath = doc.name; // mfano: projects/.../documents/patient_reminders/A2AWpN...
          const fields = doc.fields || {};
          
          // Kama data ipo moja kwa moja hapa
          if (fields.nambaSimu) {
            reminders.push({
              jinaMgonjwa: fields.jinaMgonjwa?.stringValue || 'Mgonjwa',
              nambaSimu: String(fields.nambaSimu?.stringValue || ''),
              dawaAlizopewa: fields.dawaAlizopewa?.stringValue || '',
              maelezoYaDawa: fields.maelezoYaZiada?.stringValue || fields.maelezoYaDawa?.stringValue || ''
            });
          }

          // Kama kuna sub-collection ndani yake (kama ilivyoonekana kwenye picha yako)
          try {
            const subColUrl = `https://firestore.googleapis.com/v1/${docPath}/patient_reminders`;
            const subRes = await fetch(subColUrl);
            if (subRes.ok) {
              const subData = await subRes.json();
              const subDocs = subData.documents || [];
              for (const subDoc of subDocs) {
                const subFields = subDoc.fields || {};
                if (subFields.nambaSimu) {
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
            console.log("Sub-collection check error:", subErr.message);
          }
        }
      }
    } catch (e) {
      console.log("Hitilafu ya kusoma Firestore:", e.message);
    }

    const activeList = reminders.filter(r => r.nambaSimu.length > 5);
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
