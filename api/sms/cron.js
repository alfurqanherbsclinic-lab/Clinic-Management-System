// api/sms/cron.js

import admin from "firebase-admin";

// =====================================
// FIREBASE INITIALIZATION
// =====================================

if (!admin.apps.length) {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  if (privateKey) {
    // Hubadilisha alama zote za \n kuwa mstari sahihi wa kiufundi
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    })
  });
}

const db = admin.firestore();

// =====================================
// OASIS SMS FUNCTION
// =====================================

async function sendSMS(phone, message) {
  try {
    const response = await fetch(
      "https://bulksms.oasistech.co.tz/api/sms",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OASIS_API_KEY}`
        },
        body: JSON.stringify({
          to: [phone],
          sender: "AL-FURQAN",
          message: message
        })
      }
    );

    const result = await response.json();

    console.log("OASIS RESPONSE:", result);

    if (response.ok) {
      return true;
    }

    return false;

  } catch (error) {
    console.error("OASIS ERROR:", error);
    return false;
  }
}

// =====================================
// TIME (EAT - East Africa Time / UTC+3)
// =====================================

function getCurrentTime() {
  const now = new Date();
  
  // Hubadilisha kwenda saa za Afrika Mashariki (EAT)
  now.setHours(now.getHours() + 3);

  return (
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0")
  );
}

// =====================================
// DATE
// =====================================

function getToday() {
  const now = new Date();
  now.setHours(now.getHours() + 3);
  return now.toISOString().split("T")[0];
}

// =====================================
// NORMALIZE PHONE
// =====================================

function formatPhone(phone) {
  if (!phone) return null;

  phone = phone.replace(/\s+/g, "");

  if (phone.startsWith("0")) {
    phone = "255" + phone.substring(1);
  }

  return phone;
}

// =====================================
// CRON HANDLER
// =====================================

export default async function handler(req, res) {
  try {
    const currentTime = getCurrentTime();
    const today = getToday();

    console.log("CRON START:", {
      time: currentTime,
      date: today
    });

    const snapshot = await db
      .collection("patient_reminders")
      .get();

    console.log("TOTAL REMINDERS:", snapshot.size);

    let sent = 0;

    for (const doc of snapshot.docs) {
      const reminder = doc.data();

      const jina = reminder.jinaMgonjwa || "Mgonjwa";
      const phone = formatPhone(reminder.nambaSimu);
      const status = String(reminder.haliYaUkumbusho || "").toUpperCase();

      console.log("CHECK:", jina, status);

      // STATUS CHECK
      if (
        status !== "ACTIVE" &&
        status !== "HAI" &&
        status !== "NDIO" &&
        status !== "YES"
      ) {
        continue;
      }

      // DATE CHECK
      if (reminder.tareheYaKuanza && today < reminder.tareheYaKuanza) {
        continue;
      }

      if (reminder.tareheYaKumaliza && today > reminder.tareheYaKumaliza) {
        continue;
      }

      // TIME CHECK
      const times = [
        reminder.mudaAsubuhi,
        reminder.mudaMchana,
        reminder.mudaJioni
      ];

      if (!times.includes(currentTime)) {
        continue;
      }

      // PHONE CHECK
      if (!phone) {
        console.log("Hakuna simu:", jina);
        continue;
      }

      // DUPLICATE CHECK
      if (
        reminder.lastSentTime === currentTime &&
        reminder.lastSentDate === today
      ) {
        console.log("Already sent:", jina);
        continue;
      }

      // MESSAGE
      const message = `Al-Furqan Herb's Clinic

Habari ${jina},

Huu ni ukumbusho wako wa kutumia dawa.

Dawa:
${reminder.dawaAlizopewa || ""}

Muda:
${currentTime}

Maelezo:
${reminder.maelezoYaZiada || ""}

Tunawatakia afya njema.`;

      // SEND SMS
      const result = await sendSMS(phone, message);

      if (result) {
        sent++;

        await doc.ref.update({
          lastSentTime: currentTime,
          lastSentDate: today,
          lastSentAt: new Date().toISOString()
        });

        console.log("SMS SENT:", jina, phone);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Cron imekamilika",
      sent,
      time: currentTime,
      date: today
    });

  } catch (error) {
    console.error("CRON ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

