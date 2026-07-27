// api/sms/cron.js

import admin from "firebase-admin";

// ===============================
// FIREBASE CONNECTION
// ===============================

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();


// ===============================
// SEND SMS FUNCTION (OASIS)
// ===============================

async function sendSMS(phone, message) {

  try {

    const response = await fetch(
      "WEKA_OASIS_SMS_URL_HAPA",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OASIS_API_KEY}`
        },

        body: JSON.stringify({
          phone: phone,
          message: message
        })

      }
    );


    const result = await response.json();

    console.log("SMS RESPONSE:", result);


    return true;


  } catch(error){

    console.log("SMS ERROR:", error);

    return false;

  }

}



// ===============================
// TIME FORMAT
// ===============================

function getCurrentTime(){

  const now = new Date();

  const hour = String(now.getHours()).padStart(2,"0");

  const minute = String(now.getMinutes()).padStart(2,"0");


  return `${hour}:${minute}`;

}


// ===============================
// DATE FORMAT
// ===============================

function getToday(){

 const now = new Date();

 return now.toISOString().split("T")[0];

}



// ===============================
// MAIN CRON HANDLER
// ===============================

export default async function handler(req,res){


try{


const currentTime = getCurrentTime();

const today = getToday();



console.log(
"CHECK TIME:",
currentTime
);



const snapshot =
await db
.collection("patient_reminders")
.get();



console.log(
"TOTAL REMINDERS:",
snapshot.size
);



let sent = 0;



for(const doc of snapshot.docs){


const reminder = doc.data();



const jina =
reminder.jinaMgonjwa || "Mgonjwa";


const simu =
reminder.nambaSimu;



const hali =
(reminder.haliYaUkumbusho || "")
.toUpperCase();



// ===============================
// CHECK STATUS
// ===============================

if(
hali !== "HAI" &&
hali !== "NDIO" &&
hali !== "ACTIVE" &&
hali !== "YES"
){

console.log(
"Skipped:",
jina,
"Status:",
hali
);

continue;

}



// ===============================
// CHECK DATE RANGE
// ===============================


if(
today < reminder.tareheYaKuanza ||
today > reminder.tareheYaKumaliza
){

console.log(
"Out of date:",
jina
);

continue;

}



// ===============================
// CHECK TIME
// ===============================


const muda = [

reminder.mudaAsubuhi,

reminder.mudaMchana,

reminder.mudaJioni

];



if(!muda.includes(currentTime)){

continue;

}



// ===============================
// CHECK PHONE
// ===============================


if(!simu){

console.log(
"Hakuna namba:",
jina
);

continue;

}



// ===============================
// SMS MESSAGE
// ===============================


const message =

`Al-Furqan Herb's Clinic.

Habari ${jina},

Huu ni ukumbusho wako wa kutumia dawa:

${reminder.dawaAlizopewa}

Muda wa kutumia:
${currentTime}

Maelezo:
${reminder.maelezoYaZiada || ""}

Tunawatakia afya njema.`;




// ===============================
// SEND SMS
// ===============================


const smsSent =
await sendSMS(
simu,
message
);



if(smsSent){


sent++;



await doc.ref.update({

lastSentAt:
new Date().toISOString(),

lastSentTime:
currentTime

});


console.log(
"SMS SENT:",
jina
);


}



}



return res.status(200).json({

success:true,

message:
"Cron imekamilika",

sent:sent,

time:currentTime

});



}catch(error){


console.error(error);


return res.status(500).json({

success:false,

error:error.message

});


}


}
