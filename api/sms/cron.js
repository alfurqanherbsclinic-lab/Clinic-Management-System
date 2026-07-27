export default async function handler(req, res) {

res.setHeader('Access-Control-Allow-Origin','*');
res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');


if(req.method==="OPTIONS"){
 return res.status(200).end();
}


try{


const {
slot,
apiKey,
baseUrl,
sender
}=req.query || {};



const oasisKey =
apiKey ||
process.env.OASIS_API_KEY ||
"e97eb6eb-02cd-41e9-913a-ff1e76b6e4b8";


const senderName =
sender ||
"AHC MKONONI";


const apiEndpoint =
baseUrl ||
"https://bulksms.oasistech.co.tz/api/sms";



const projectId =
"circular-simplicity-kdw77";


const firestoreUrl =
`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/patient_reminders`;



const historyUrl =
`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/sms_history`;





// ==========================
// FIRESTORE READ
// ==========================


let reminders=[];


const fsResponse =
await fetch(firestoreUrl);


if(!fsResponse.ok){

const errorText = await fsResponse.text();

return res.status(500).json({

error:"Firestore haijasomeka",

statusCode: fsResponse.status,

details:errorText

});

}



const fsData =
await fsResponse.json();


const docs =
fsData.documents || [];



console.log(
"Firestore patients:",
docs.length
);



for(const doc of docs){


const f =
doc.fields || {};


reminders.push({


id:doc.name,


jinaMgonjwa:
f.jinaMgonjwa?.stringValue || "Mgonjwa",


nambaSimu:
f.nambaSimu?.stringValue || "",


dawaAlizopewa:
f.dawaAlizopewa?.stringValue || "Dawa",


maelezoYaDawa:
f.maelezoYaDawa?.stringValue || "",


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





// ==========================
// TIME TANZANIA
// ==========================


const now =
new Date();


const currentTime =
now.toLocaleTimeString(
'en-GB',
{
hour:'2-digit',
minute:'2-digit',
hour12:false,
timeZone:'Africa/Dar_es_Salaam'
});


console.log(
"Muda Tanzania:",
currentTime
);




// dakika ya sasa

function timeToMinutes(time){

const parts =
time.split(":");

return Number(parts[0])*60 +
Number(parts[1]);

}



const nowMinutes =
timeToMinutes(currentTime);





let targetSlot =
(slot || "").toLowerCase();





if(!targetSlot){


if(
Math.abs(
nowMinutes -
timeToMinutes("08:00")
)<=1
)

targetSlot="asubuhi";



else if(
Math.abs(
nowMinutes -
timeToMinutes("14:00")
)<=1
)

targetSlot="mchana";



else if(
Math.abs(
nowMinutes -
timeToMinutes("20:00")
)<=1
)

targetSlot="jioni";


}






if(!targetSlot){


return res.status(200).json({

status:"waiting",

currentTime,

message:
"Hakuna muda wa kutuma SMS"


});


}





// ==========================
// FILTER PATIENTS
// ==========================



const activePatients =
reminders.filter(patient=>{


if(
patient.haliYaUkumbusho
.toUpperCase()
!=="ACTIVE"
)

return false;



if(!patient.nambaSimu)
return false;



let patientTime;



if(targetSlot==="asubuhi")
patientTime=patient.mudaAsubuhi;


if(targetSlot==="mchana")
patientTime=patient.mudaMchana;


if(targetSlot==="jioni")
patientTime=patient.mudaJioni;



if(!patientTime)
return false;



return (
Math.abs(
nowMinutes -
timeToMinutes(patientTime)
)<=1
);



});





console.log(
"Wagonjwa wa kutumwa:",
activePatients.length
);





const results=[];





// ==========================
// SEND SMS
// ==========================


for(const patient of activePatients){



let phone =
patient.nambaSimu
.replace(/\D/g,'');



if(phone.startsWith("0")){

phone =
"255"+phone.substring(1);

}




let slotName =
targetSlot==="asubuhi"
?"Asubuhi"
:
targetSlot==="mchana"
?"Mchana"
:
"Jioni";




const message =

`Assalam Alaykum / Habari ${patient.jinaMgonjwa.toUpperCase()}.

Huu ni ukumbusho kutoka Al-Furqan Herb's Clinic.

Kunywa dawa zako:
${patient.dawaAlizopewa}

${patient.maelezoYaDawa}

Awamu:
${slotName}

Afya bora ni mtaji wako.`;





try{


const sms =
await fetch(
apiEndpoint,
{

method:"POST",

headers:{

"Content-Type":
"application/json",

"Authorization":
`Bearer ${oasisKey}`

},


body:JSON.stringify({

to:phone,

recipient:phone,

message,

sender:senderName

})


});




const smsResult =
await sms.json()
.catch(()=>({}));



results.push({

patient:
patient.jinaMgonjwa,

phone,

status:
sms.ok
?"success"
:"failed",

response:smsResult


});




}catch(e){


results.push({

patient:
patient.jinaMgonjwa,

status:"failed",

error:e.message


});


}


}





return res.status(200).json({

status:"completed",

currentTime,

slot:targetSlot,

firestorePatients:
reminders.length,

totalPatients:
activePatients.length,

sent:
results.filter(
x=>x.status==="success"
).length,

results


});




}catch(error){


return res.status(500).json({

status:"error",

message:error.message

});


}


}
