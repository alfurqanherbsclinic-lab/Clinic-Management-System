export default async function handler(req, res) {

  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');


  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }


  try {

    const {
      slot,
      apiKey,
      baseUrl,
      sender
    } = req.query || {};


    // ==============================
    // OASIS SETTINGS
    // ==============================

    const oasisKey =
      apiKey ||
      req.body?.apiKey ||
      process.env.OASIS_API_KEY ||
      'e97eb6eb-02cd-41e9-913a-ff1e76b6e4b8';


    const senderName =
      sender ||
      req.body?.sender ||
      'AHC MKONONI';


    const apiEndpoint =
      baseUrl ||
      process.env.OASIS_URL ||
      'https://bulksms.oasistech.co.tz/api/sms';



    // ==============================
    // FIRESTORE
    // ==============================

    const projectId =
      "circular-simplicity-kdw77";


    const firestoreUrl =
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/patient_reminders`;


    const historyUrl =
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/sms_history`;



    let reminders = [];



    // Fetch Patients

    const fsResponse = await fetch(firestoreUrl);


    if(fsResponse.ok){

      const data = await fsResponse.json();


      const docs = data.documents || [];



      for(const doc of docs){


        const f = doc.fields || {};


        reminders.push({

          id: doc.name,

          jinaMgonjwa:
            f.jinaMgonjwa?.stringValue || "Mgonjwa",


          nambaSimu:
            f.nambaSimu?.stringValue || "",


          dawaAlizopewa:
            f.dawaAlizopewa?.stringValue || "Dawa",


          maelezoYaDawa:
            f.maelezoYaDawa?.stringValue ||
            f.maelezoYaZiada?.stringValue ||
            "",


          haliYaUkumbusho:
            f.haliYaUkumbusho?.stringValue || "ACTIVE",


          mudaAsubuhi:
            f.mudaAsubuhi?.stringValue || "08:00",


          mudaMchana:
            f.mudaMchana?.stringValue || "14:00",


          mudaJioni:
            f.mudaJioni?.stringValue || "20:00"

        });


      }

    }



    // ==============================
    // CHECK CURRENT TIME
    // ==============================


    const now = new Date();

const currentTime = now.toLocaleTimeString(
  'en-GB',
  {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Africa/Dar_es_Salaam'
  }
);

console.log("Muda wa Tanzania:", currentTime);



    let targetSlot =
      (slot || "").toLowerCase();



    if(!targetSlot){

      if(currentTime === "08:00")
        targetSlot="asubuhi";


      else if(currentTime === "14:00")
        targetSlot="mchana";


      else if(currentTime === "20:00")
        targetSlot="jioni";


      else
        targetSlot="";

    }



    if(!targetSlot){

      return res.status(200).json({

        status:"waiting",

        message:
        "Hakuna ratiba ya kutuma SMS kwa muda huu",

        currentTime

      });

    }



    // ==============================
    // FILTER ACTIVE PATIENTS
    // ==============================


    const activePatients =
      reminders.filter(patient=>{


        if(patient.haliYaUkumbusho !== "ACTIVE")
          return false;


        if(!patient.nambaSimu)
          return false;



        if(targetSlot==="asubuhi")
          return patient.mudaAsubuhi === currentTime;


        if(targetSlot==="mchana")
          return patient.mudaMchana === currentTime;


        if(targetSlot==="jioni")
          return patient.mudaJioni === currentTime;



        return false;


      });



    const results=[];



    // ==============================
    // SEND SMS
    // ==============================


    for(const patient of activePatients){


      let phone =
      patient.nambaSimu.replace(/[^\d]/g,"");



      if(phone.startsWith("0")){

        phone =
        "255"+phone.substring(1);

      }



      let slotName =
      targetSlot==="asubuhi"
      ? "Asubuhi"
      :
      targetSlot==="mchana"
      ? "Mchana"
      :
      "Jioni";



      const message =

`Assalam Alaykum / Habari ${patient.jinaMgonjwa.toUpperCase()}.

Huu ni ukumbusho kutoka Al-Furqan Herb's Clinic.

Tafadhali kunywa dawa zako:
${patient.dawaAlizopewa}

${patient.maelezoYaDawa ?
"Maelezo: "+patient.maelezoYaDawa :
""}

Awamu: ${slotName}

Afya bora ni mtaji wako.`;




      try{


        const smsResponse =
        await fetch(apiEndpoint,{


          method:"POST",


          headers:{

            "Content-Type":"application/json",

            "Authorization":
            `Bearer ${oasisKey}`

          },


          body:JSON.stringify({

            to:phone,

            recipient:phone,

            message,

            text:message,

            sender:senderName,

            from:senderName,

            sender_id:senderName


          })


        });



        const smsData =
        await smsResponse.json()
        .catch(()=>({}));




        results.push({

          patient:
          patient.jinaMgonjwa,

          phone,

          slot:slotName,

          status:
          smsResponse.ok
          ?
          "success"
          :
          "failed",

          response:smsData

        });



        // Save History

        await fetch(historyUrl,{

          method:"POST",

          headers:{
          "Content-Type":"application/json"
          },


          body:JSON.stringify({

            fields:{


              jinaMgonjwa:{
              stringValue:
              patient.jinaMgonjwa
              },


              simu:{
              stringValue:phone
              },


              ujumbe:{
              stringValue:message
              },


              slot:{
              stringValue:slotName
              },


              tarehe:{
              stringValue:
              new Date().toISOString()
              },


              status:{
              stringValue:
              "SENT"
              }


            }


          })


        });



      }catch(error){


        results.push({

          patient:
          patient.jinaMgonjwa,

          phone,

          status:"failed",

          error:error.message

        });


      }



    }




    return res.status(200).json({

      status:"completed",

      currentTime,

      slot:targetSlot,

      totalPatients:
      activePatients.length,


      sent:
      results.filter(
        r=>r.status==="success"
      ).length,


      results


    });



  }

  catch(error){


    return res.status(500).json({

      status:"error",

      message:error.message

    });


  }

              }
