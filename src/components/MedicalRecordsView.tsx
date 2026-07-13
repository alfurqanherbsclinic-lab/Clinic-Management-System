import React, { useState } from "react";
import { FolderOpen, Search, Printer, FileText, Download, ShieldCheck, Filter, FileImage } from "lucide-react";
import { Patient, MedicalRecord } from "../types";

interface MedicalRecordsViewProps {
  patients: Patient[];
  records: MedicalRecord[];
  onAddRecord: (newRecord: MedicalRecord) => void;
}

export default function MedicalRecordsView({ patients, records, onAddRecord }: MedicalRecordsViewProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Form states for new medical record entry
  const [history, setHistory] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [prescription, setPrescription] = useState("");
  const [labResults, setLabResults] = useState("");
  const [radiology, setRadiology] = useState("");
  const [allergies, setAllergies] = useState("");
  const [pastHistory, setPastHistory] = useState("");
  const [familyHistory, setFamilyHistory] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    const newRec: MedicalRecord = {
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
      patientId: selectedPatientId,
      date: new Date().toISOString().split("T")[0],
      history,
      diagnosis,
      symptoms,
      treatment,
      prescription,
      labResults: labResults || "N/A",
      radiology: radiology || "N/A",
      allergies: allergies || "N/A",
      pastHistory: pastHistory || "N/A",
      familyHistory: familyHistory || "N/A",
      clinicalNotes: clinicalNotes || "N/A",
      soapNotes: {
        subjective: subjective || "N/A",
        objective: objective || "N/A",
        assessment: assessment || "N/A",
        plan: plan || "N/A"
      }
    };

    onAddRecord(newRec);
    alert("Kumbukumbu ya EMR imehifadhiwa kikamilifu!");

    // Clear form
    setHistory("");
    setDiagnosis("");
    setSymptoms("");
    setTreatment("");
    setPrescription("");
    setLabResults("");
    setRadiology("");
    setAllergies("");
    setPastHistory("");
    setFamilyHistory("");
    setClinicalNotes("");
    setSubjective("");
    setObjective("");
    setAssessment("");
    setPlan("");
  };

  const getPatientName = (id: string) => {
    const p = patients.find(pat => pat.id === id);
    return p ? p.name : "Unknown Patient";
  };

  const getPatientObj = (id: string) => {
    return patients.find(pat => pat.id === id);
  };

  const filteredRecords = records.filter(rec => {
    const pName = getPatientName(rec.patientId).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = pName.includes(query) || rec.diagnosis.toLowerCase().includes(query);
    
    if (filterType === "all") return matchesSearch;
    if (filterType === rec.patientId) return matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Add EMR Record and List of Historical EMR entries */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Historical records list */}
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-primary/20 pb-3">
              <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-secondary" />
                Daftari la Kumbukumbu Zote (Clinical Records History)
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Search className="w-4 h-4 text-primary opacity-60 shrink-0" />
                <input
                  type="text"
                  placeholder="Tafuta kwa Jina au Ugonjwa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-1.5 border border-primary rounded text-xs font-semibold outline-none w-full sm:w-48"
                />
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => {
                  const patObj = getPatientObj(rec.patientId);
                  return (
                    <div key={rec.id} className="p-4 bg-light-bg rounded-xl border-2 border-primary/20 space-y-3">
                      <div className="flex items-start justify-between border-b border-primary/10 pb-2">
                        <div>
                          <h4 className="text-xs font-bold text-primary uppercase font-display">
                            {patObj?.name} ({patObj?.cardNumber})
                          </h4>
                          <span className="text-[10px] text-gray-500 font-bold font-mono">
                            MRN: {patObj?.mrn} • Tarehe ya Record: {rec.date}
                          </span>
                        </div>
                        <span className="text-[10px] bg-secondary text-white font-bold px-2 py-0.5 rounded uppercase">
                          {rec.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wider">Historia ya Ugonjwa (History)</p>
                          <p className="font-semibold text-primary mt-0.5">{rec.history}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wider">Vipimo na Vipengele (Symptoms)</p>
                          <p className="font-semibold text-primary mt-0.5">{rec.symptoms}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1 border-t border-primary/5">
                        <div>
                          <p className="text-secondary font-bold uppercase text-[9px] tracking-wider">Utambuzi (Diagnosis)</p>
                          <p className="font-bold text-primary mt-0.5">{rec.diagnosis}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wider">Matibabu & Dawa (Treatment & Prescription)</p>
                          <p className="font-semibold text-secondary font-mono mt-0.5 white-space-pre-line">{rec.prescription}</p>
                        </div>
                      </div>

                      {/* SOAP Notes block */}
                      <div className="bg-white p-3 rounded-lg border border-primary/10 text-xs">
                        <p className="text-primary font-bold text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                          Daktari Clinical SOAP Notes
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px] font-medium text-gray-600">
                          <div>
                            <span className="font-bold block text-[9px] text-gray-400">SUBJECTIVE (S):</span>
                            <span>{rec.soapNotes.subjective}</span>
                          </div>
                          <div>
                            <span className="font-bold block text-[9px] text-gray-400">OBJECTIVE (O):</span>
                            <span>{rec.soapNotes.objective}</span>
                          </div>
                          <div>
                            <span className="font-bold block text-[9px] text-gray-400">ASSESSMENT (A):</span>
                            <span>{rec.soapNotes.assessment}</span>
                          </div>
                          <div>
                            <span className="font-bold block text-[9px] text-gray-400">PLAN (P):</span>
                            <span>{rec.soapNotes.plan}</span>
                          </div>
                        </div>
                      </div>

                      {/* Attachments panel simulation */}
                      <div className="flex justify-between items-center text-[10px] bg-primary/5 border border-primary/10 p-2 rounded">
                        <span className="font-bold text-primary flex items-center gap-1.5">
                          <FileImage className="w-3.5 h-3.5 text-secondary" />
                          Viambatisho: CBC_Report_Digital_Signed.pdf (1.2 MB)
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => alert("Faili linapakuliwa kwenye kifaa chako kwa usalama...")}
                            className="font-bold text-secondary hover:underline cursor-pointer"
                          >
                            Download PDF
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500 font-semibold py-6 text-center">Hakuna kumbukumbu za EMR zilizopatikana.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Create New EMR Record Form */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b-2 border-secondary pb-2">
            Andika Kumbukumbu Mpya EMR
          </h3>

          <form onSubmit={handleCreateRecord} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">Mgonjwa (Select Patient) *</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                required
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.cardNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-primary mb-0.5">Mzio (Allergies)</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="p-2 border-2 border-primary rounded text-xs font-medium"
                  placeholder="Mf. Pilipili / Ndimu"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-primary mb-0.5">Historia ya Familia</label>
                <input
                  type="text"
                  value={familyHistory}
                  onChange={(e) => setFamilyHistory(e.target.value)}
                  className="p-2 border-2 border-primary rounded text-xs font-medium"
                  placeholder="Mf. Diabetes / BP"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-primary mb-0.5">Historia ya Mgonjwa *</label>
              <textarea
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                rows={2}
                className="p-2 border-2 border-primary rounded text-xs font-semibold outline-none"
                placeholder="Andika historia ya ugonjwa..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-primary mb-0.5">Dalili (Symptoms) *</label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="p-2 border-2 border-primary rounded text-xs font-semibold"
                  placeholder="Mf. Maumivu ya kichwa"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-primary mb-0.5">Utambuzi (Diagnosis) *</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="p-2 border-2 border-primary rounded text-xs font-semibold"
                  placeholder="Mf. Rheumatism"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-primary mb-0.5">Matibabu (Treatment) *</label>
                <input
                  type="text"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className="p-2 border-2 border-primary rounded text-xs font-semibold"
                  placeholder="Matibabu"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-primary mb-0.5">Kipimo cha Maabara</label>
                <input
                  type="text"
                  value={labResults}
                  onChange={(e) => setLabResults(e.target.value)}
                  className="p-2 border-2 border-primary rounded text-xs font-semibold"
                  placeholder="Uric Acid / CBC"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-primary mb-0.5">Dawa Maalum (Prescription) *</label>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                rows={2}
                className="p-2 border-2 border-primary rounded text-xs font-semibold"
                placeholder="Mf. Habbat Soda kijiko 1 asubuhi x 3"
                required
              />
            </div>

            {/* SOAP Section */}
            <div className="bg-light-bg p-3 rounded-lg border border-primary/20 space-y-2">
              <span className="text-[10px] font-extrabold text-primary uppercase block">Clinical SOAP Inputs</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Subjective"
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  className="p-1.5 border border-primary/30 rounded bg-white text-[11px]"
                />
                <input
                  type="text"
                  placeholder="Objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="p-1.5 border border-primary/30 rounded bg-white text-[11px]"
                />
                <input
                  type="text"
                  placeholder="Assessment"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  className="p-1.5 border border-primary/30 rounded bg-white text-[11px]"
                />
                <input
                  type="text"
                  placeholder="Plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="p-1.5 border border-primary/30 rounded bg-white text-[11px]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-2.5 bg-secondary hover:bg-primary border-2 border-secondary hover:border-primary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              Hifadhi Kwenye EMR Database
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
