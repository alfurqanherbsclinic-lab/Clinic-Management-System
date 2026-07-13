import React, { useState } from "react";
import { Activity, Search, Printer, ShieldCheck, HeartPulse, CheckSquare, Plus, FileText } from "lucide-react";
import { Patient, LabRecord } from "../types";

interface LabViewProps {
  patients: Patient[];
  labRecords: LabRecord[];
  onAddLabRecord: (newLab: LabRecord) => void;
  onUpdateLabReview: (id: string, review: string) => void;
}

export default function LabView({ patients, labRecords, onAddLabRecord, onUpdateLabReview }: LabViewProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || "");
  const [testType, setTestType] = useState<LabRecord["testType"]>("CBC");
  
  // Dynamic fields based on testType
  const [cbcWbc, setCbcWbc] = useState("6.2");
  const [cbcRbc, setCbcRbc] = useState("4.5");
  const [cbcHb, setCbcHb] = useState("13.8");
  const [cbcPlatelets, setCbcPlatelets] = useState("240");
  
  const [malariaMps, setMalariaMps] = useState("No malaria parasites seen");
  const [malariaRdt, setMalariaRdt] = useState("Negative");
  
  const [urinePh, setUrinePh] = useState("6.0");
  const [urineProtein, setUrineProtein] = useState("Negative");
  const [urineSugar, setUrineSugar] = useState("Negative");
  
  const [bloodSugarFasting, setBloodSugarFasting] = useState("5.2");
  const [bloodSugarPost, setBloodSugarPost] = useState("7.0");

  const [doctorReviewText, setDoctorReviewText] = useState("");
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  const handleCreateLabRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    const pat = patients.find(p => p.id === selectedPatientId);
    if (!pat) return;

    let testResults: { [key: string]: string } = {};

    if (testType === "CBC") {
      testResults = {
        "White Blood Cells (WBC)": `${cbcWbc} x10^9/L (Normal: 4.0 - 11.0)`,
        "Red Blood Cells (RBC)": `${cbcRbc} x10^12/L (Normal: 4.5 - 5.9)`,
        "Hemoglobin (HB)": `${cbcHb} g/dL (Normal: 13.5 - 17.5)`,
        "Platelets Count": `${cbcPlatelets} x10^9/L (Normal: 150 - 450)`
      };
    } else if (testType === "Malaria") {
      testResults = {
        "Blood Smear for MPS": malariaMps,
        "mRDT Rapid Test": malariaRdt
      };
    } else if (testType === "Urine") {
      testResults = {
        "Urine pH": urinePh,
        "Protein": urineProtein,
        "Glucose / Sugar": urineSugar
      };
    } else if (testType === "Blood Sugar") {
      testResults = {
        "Fasting Blood Sugar": `${bloodSugarFasting} mmol/L (Normal: 3.9 - 5.6)`,
        "Post-Prandial Blood Sugar": `${bloodSugarPost} mmol/L (Normal: < 7.8)`
      };
    } else {
      testResults = {
        "Test Level": "Normal Level (Tested & Verified under Al-Furqan Lab Standards)"
      };
    }

    const newLab: LabRecord = {
      id: `LAB-${Math.floor(100 + Math.random() * 900)}`,
      patientId: selectedPatientId,
      patientName: pat.name,
      testType,
      results: testResults,
      status: "Completed",
      doctorReview: "N/A - Pending Doctor Review",
      reviewer: "Dr. Khalifa Rehani",
      date: new Date().toISOString().split("T")[0]
    };

    onAddLabRecord(newLab);
    alert(`Vipimo vya ${testType} vimehifadhiwa kikamilifu kwenye Database.`);
  };

  const handleSaveReview = (id: string) => {
    onUpdateLabReview(id, doctorReviewText);
    setActiveReviewId(null);
    setDoctorReviewText("");
    alert("Maoni ya daktari yamehifadhiwa kwa usahihi!");
  };

  return (
    <div className="p-6 space-y-6">
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Lab results database list */}
        <div className="xl:col-span-2 bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-primary/20 pb-3">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary animate-pulse" />
              Ripoti za Maabara (Laboratory Records Database)
            </h3>
            <span className="bg-primary text-white text-xs px-2.5 py-0.5 rounded font-mono font-bold">
              Kumbukumbu {labRecords.length} Vipimo
            </span>
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {labRecords.map((lab) => {
              const pat = patients.find(p => p.id === lab.patientId);
              return (
                <div key={lab.id} className="p-4 bg-light-bg rounded-xl border-2 border-primary/10 space-y-3">
                  <div className="flex items-start justify-between border-b border-primary/10 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-primary uppercase font-display">
                        {lab.patientName} ({pat?.cardNumber})
                      </h4>
                      <p className="text-[10px] text-gray-500 font-bold font-mono">
                        Namba ya Kipimo: {lab.id} • Tarehe: {lab.date} • Aina ya Kipimo: <span className="text-secondary font-extrabold">{lab.testType}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="p-1.5 bg-primary hover:bg-secondary text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </button>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-primary/10 space-y-2">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Lab Measurements & Values</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-bold">
                      {Object.entries(lab.results).map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-gray-100 pb-1 text-primary">
                          <span className="opacity-75">{key}:</span>
                          <span className="font-mono text-secondary">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Review signature */}
                  <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/20 text-xs">
                    <p className="text-primary font-bold text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-secondary" />
                      Maoni ya Daktari Bingwa (Chief Pathologist Review)
                    </p>
                    {activeReviewId === lab.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={doctorReviewText}
                          onChange={(e) => setDoctorReviewText(e.target.value)}
                          className="w-full p-2 border border-primary rounded text-xs"
                          placeholder="Andika maoni ya daktari hapa..."
                          rows={2}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleSaveReview(lab.id)}
                            className="px-3 py-1 bg-secondary text-white text-[11px] font-bold rounded cursor-pointer"
                          >
                            Hifadhi
                          </button>
                          <button
                            onClick={() => setActiveReviewId(null)}
                            className="px-3 py-1 bg-gray-300 text-primary text-[11px] font-bold rounded cursor-pointer"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-primary/80 italic">{lab.doctorReview}</p>
                        <button
                          onClick={() => {
                            setActiveReviewId(lab.id);
                            setDoctorReviewText(lab.doctorReview === "N/A - Pending Doctor Review" ? "" : lab.doctorReview);
                          }}
                          className="text-[11px] text-secondary hover:underline font-bold"
                        >
                          Marekebisho / Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Enter New Lab Result Form */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b-2 border-secondary pb-2">
            Ingiza Vipimo Maabara (Input Test Results)
          </h3>

          <form onSubmit={handleCreateLabRecord} className="space-y-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-primary mb-1">Mgonjwa *</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                required
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.cardNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-primary mb-1">Aina ya Kipimo (Test Category)</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as LabRecord["testType"])}
                className="w-full p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
              >
                <option value="CBC">CBC (Complete Blood Count)</option>
                <option value="Malaria">Malaria (MPS & mRDT)</option>
                <option value="Urine">Urine (pH & Chemistry)</option>
                <option value="Blood Sugar">Blood Sugar (Glucose Levels)</option>
              </select>
            </div>

            {/* Dynamic input sections based on category */}
            {testType === "CBC" && (
              <div className="bg-light-bg p-3.5 rounded-lg border border-primary/20 space-y-2.5 text-xs">
                <span className="font-extrabold text-primary uppercase block text-[10px]">CBC Values</span>
                <div className="grid grid-cols-2 gap-2 font-semibold">
                  <div className="flex flex-col">
                    <label>WBC *</label>
                    <input type="text" value={cbcWbc} onChange={(e) => setCbcWbc(e.target.value)} className="p-1.5 border border-primary rounded text-xs bg-white" />
                  </div>
                  <div className="flex flex-col">
                    <label>RBC *</label>
                    <input type="text" value={cbcRbc} onChange={(e) => setCbcRbc(e.target.value)} className="p-1.5 border border-primary rounded text-xs bg-white" />
                  </div>
                  <div className="flex flex-col">
                    <label>Hemoglobin (HB) *</label>
                    <input type="text" value={cbcHb} onChange={(e) => setCbcHb(e.target.value)} className="p-1.5 border border-primary rounded text-xs bg-white" />
                  </div>
                  <div className="flex flex-col">
                    <label>Platelets *</label>
                    <input type="text" value={cbcPlatelets} onChange={(e) => setCbcPlatelets(e.target.value)} className="p-1.5 border border-primary rounded text-xs bg-white" />
                  </div>
                </div>
              </div>
            )}

            {testType === "Malaria" && (
              <div className="bg-light-bg p-3.5 rounded-lg border border-primary/20 space-y-2.5 text-xs">
                <span className="font-extrabold text-primary uppercase block text-[10px]">Malaria Results</span>
                <div className="flex flex-col gap-2 font-semibold">
                  <div>
                    <label>MPS Blood Smear *</label>
                    <select value={malariaMps} onChange={(e) => setMalariaMps(e.target.value)} className="p-1.5 w-full border border-primary rounded text-xs bg-white">
                      <option>No malaria parasites seen</option>
                      <option>+1 Parasites seen</option>
                      <option>+2 Parasites seen</option>
                    </select>
                  </div>
                  <div>
                    <label>mRDT Rapid Test *</label>
                    <select value={malariaRdt} onChange={(e) => setMalariaRdt(e.target.value)} className="p-1.5 w-full border border-primary rounded text-xs bg-white">
                      <option>Negative</option>
                      <option>Positive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {testType === "Urine" && (
              <div className="bg-light-bg p-3.5 rounded-lg border border-primary/20 space-y-2.5 text-xs">
                <span className="font-extrabold text-primary uppercase block text-[10px]">Urine Chemistry</span>
                <div className="grid grid-cols-3 gap-2 font-semibold">
                  <div className="flex flex-col">
                    <label>pH *</label>
                    <input type="text" value={urinePh} onChange={(e) => setUrinePh(e.target.value)} className="p-1.5 border border-primary rounded text-xs bg-white" />
                  </div>
                  <div className="flex flex-col">
                    <label>Protein *</label>
                    <select value={urineProtein} onChange={(e) => setUrineProtein(e.target.value)} className="p-1.5 border border-primary rounded text-[11px] bg-white">
                      <option>Negative</option>
                      <option>Trace</option>
                      <option>+1 Positive</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label>Sugar *</label>
                    <select value={urineSugar} onChange={(e) => setUrineSugar(e.target.value)} className="p-1.5 border border-primary rounded text-[11px] bg-white">
                      <option>Negative</option>
                      <option>+1 Positive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {testType === "Blood Sugar" && (
              <div className="bg-light-bg p-3.5 rounded-lg border border-primary/20 space-y-2.5 text-xs">
                <span className="font-extrabold text-primary uppercase block text-[10px]">Blood Glucose levels</span>
                <div className="grid grid-cols-2 gap-2 font-semibold">
                  <div className="flex flex-col">
                    <label>Fasting *</label>
                    <input type="text" value={bloodSugarFasting} onChange={(e) => setBloodSugarFasting(e.target.value)} className="p-1.5 border border-primary rounded text-xs bg-white" />
                  </div>
                  <div className="flex flex-col">
                    <label>Post-Prandial *</label>
                    <input type="text" value={bloodSugarPost} onChange={(e) => setBloodSugarPost(e.target.value)} className="p-1.5 border border-primary rounded text-xs bg-white" />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full p-3.5 bg-secondary hover:bg-primary border-2 border-secondary hover:border-primary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow"
            >
              Hifadhi Kipimo & Tuma Matokeo (Save Lab Result)
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
