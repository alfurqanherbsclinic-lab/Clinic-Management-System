import React, { useState } from "react";
import { 
  Stethoscope, 
  Activity, 
  FileText, 
  Pill, 
  Calendar, 
  CheckCircle2, 
  Printer, 
  Search, 
  User, 
  Clock, 
  AlertCircle,
  Sparkles,
  Plus,
  Send
} from "lucide-react";
import { Patient, DoctorConsultation } from "../types";

interface DoctorModuleProps {
  patients: Patient[];
  activeSubTab?: "consultation" | "diagnosis" | "prescription" | "followup";
}

export function DoctorModule({ patients, activeSubTab = "consultation" }: DoctorModuleProps) {
  const [subTab, setSubTab] = useState<"consultation" | "diagnosis" | "prescription" | "followup">(activeSubTab);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [bloodPressure, setBloodPressure] = useState("120/80");
  const [temperature, setTemperature] = useState("36.6");
  const [pulse, setPulse] = useState("72");
  const [symptoms, setSymptoms] = useState("Ametaja maumivu ya kichwa na mgongo kwa siku 3.");
  const [diagnosis, setDiagnosis] = useState("Homa ya Mfumo wa Chakula (Typhoid Fever) na Fatigue");
  const [prescriptions, setPrescriptions] = useState<Array<{ drugName: string; dosage: string; durationDays: number; notes: string }>>([
    { drugName: "Amoxicillin 500mg", dosage: "Mara 3 kwa siku (1x3)", durationDays: 7, notes: "Baada ya chakula" },
    { drugName: "Habat Soda Oil 100ml", dosage: "Kijiko 1 asubuhi na jioni", durationDays: 14, notes: "Nyongeza ya kinga" }
  ]);
  const [newDrug, setNewDrug] = useState("");
  const [newDosage, setNewDosage] = useState("Mara 3 kwa siku");
  const [newDuration, setNewDuration] = useState("7");
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [savedRecords, setSavedRecords] = useState<DoctorConsultation[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleAddDrug = () => {
    if (!newDrug.trim()) return;
    setPrescriptions(prev => [
      ...prev,
      {
        drugName: newDrug,
        dosage: newDosage,
        durationDays: parseInt(newDuration) || 7,
        notes: "Imeagizwa na Daktari"
      }
    ]);
    setNewDrug("");
  };

  const handleRemoveDrug = (index: number) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveConsultation = () => {
    if (!selectedPatient) return;
    const newRecord: DoctorConsultation = {
      id: "DOC-" + Date.now().toString().slice(-6),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      date: new Date().toISOString().split("T")[0],
      doctorName: "Dr. Khalifa Rehani",
      vitals: {
        bp: bloodPressure,
        temperature: temperature,
        pulse: pulse,
        weight: selectedPatient.weight || 70,
        height: selectedPatient.height || 1.7,
        bmi: selectedPatient.bmi || 24.2
      },
      symptoms,
      diagnosis,
      prescriptions,
      followUpDate,
      status: "Completed"
    };

    setSavedRecords(prev => [newRecord, ...prev]);
    setSuccessMessage(`Taarifa za matibabu ya ${selectedPatient.name} zimehifadhiwa vyema!`);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.phone.includes(searchQuery) || 
    p.cardNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-5 rounded-2xl border-2 border-primary/20 shadow-sm space-y-5">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-black font-display text-primary uppercase flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-[#D6145A]" />
            <span>HUDUMA ZA DAKTARI NA TIBA (CLINICAL CONSULTATION)</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Uchunguzi wa Daktari, Vipimo vya Vitals, Diagnosis & Prescriptions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-full border border-emerald-300">
            Dr. Khalifa Rehani Portal
          </span>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Case File</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-100 pb-2">
        <button
          onClick={() => setSubTab("consultation")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === "consultation" ? "bg-primary text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Activity className="w-4 h-4 text-rose-400" />
          <span>1. Consultation & Vitals</span>
        </button>

        <button
          onClick={() => setSubTab("diagnosis")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === "diagnosis" ? "bg-primary text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <FileText className="w-4 h-4 text-rose-400" />
          <span>2. Diagnosis & Uchunguzi</span>
        </button>

        <button
          onClick={() => setSubTab("prescription")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === "prescription" ? "bg-primary text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Pill className="w-4 h-4 text-rose-400" />
          <span>3. Prescription (Dawa)</span>
        </button>

        <button
          onClick={() => setSubTab("followup")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === "followup" ? "bg-primary text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Calendar className="w-4 h-4 text-rose-400" />
          <span>4. Follow Up & Marejeo</span>
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl text-emerald-900 text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Patient Selector + Clinical Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Patient Search & List Selector */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-primary uppercase">Chagua Mgonjwa Aliyepo:</h3>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded font-mono">
              {patients.length} Wagonjwa
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tafuta jina, namba ya simu au kadi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredPatients.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                  selectedPatient?.id === p.id 
                    ? "bg-white border-[#D6145A] shadow-md" 
                    : "bg-white/80 border-slate-200 hover:border-slate-300"
                }`}
              >
                <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-xs text-primary truncate uppercase">{p.name}</p>
                  <p className="text-[10px] text-secondary font-mono font-bold">{p.cardNumber} • 📱 {p.phone}</p>
                  <p className="text-[9px] text-gray-500 font-semibold">{p.age} Yrs ({p.gender}) • {p.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Clinical Form per sub-tab */}
        <div className="lg:col-span-2 space-y-4">

          {/* Active Patient Selected Banner */}
          {selectedPatient && (
            <div className="bg-gradient-to-r from-primary to-[#184861] text-white p-4 rounded-xl shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={selectedPatient.photoUrl} alt={selectedPatient.name} className="w-12 h-12 rounded-full border-2 border-rose-400 object-cover" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide">{selectedPatient.name}</h3>
                  <p className="text-xs text-rose-200 font-mono font-bold">
                    KADI: {selectedPatient.cardNumber} | MRN: {selectedPatient.mrn} | SIMU: {selectedPatient.phone}
                  </p>
                  <p className="text-[11px] text-slate-200">
                    Umri: {selectedPatient.age} Yrs | Damu: {selectedPatient.bloodGroup} | Uzito: {selectedPatient.weight}kg | Urefu: {selectedPatient.height}m
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 1: Consultation & Vitals */}
          {subTab === "consultation" && (
            <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-black text-primary uppercase flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#D6145A]" />
                Vipimo vya Msingi (Vital Signs)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Presha (BP):</label>
                  <input
                    type="text"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    className="p-2 border-2 border-primary/30 rounded-lg text-xs font-bold font-mono w-full"
                    placeholder="120/80"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Joto (Temperature °C):</label>
                  <input
                    type="text"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="p-2 border-2 border-primary/30 rounded-lg text-xs font-bold font-mono w-full"
                    placeholder="36.6"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Mapigo ya Moyo (Pulse):</label>
                  <input
                    type="text"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="p-2 border-2 border-primary/30 rounded-lg text-xs font-bold font-mono w-full"
                    placeholder="72 bpm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">BMI (Kipimo Cha Uzito):</label>
                  <div className="p-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-black font-mono text-primary">
                    {selectedPatient?.bmi || 24.2} ({selectedPatient?.bmi && selectedPatient.bmi < 25 ? "Normal" : "Overweight"})
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-primary block mb-1">
                  Maelezo ya Mgonjwa / Dalili (Chief Complaints & Symptoms):
                </label>
                <textarea
                  rows={4}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full p-3 border-2 border-primary/30 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-[#D6145A]"
                  placeholder="Andika dalili anazoeleza mgonjwa hapa..."
                />
              </div>
            </div>
          )}

          {/* SubTab 2: Diagnosis */}
          {subTab === "diagnosis" && (
            <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-black text-primary uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D6145A]" />
                Uchunguzi wa Daktari (Clinical Diagnosis)
              </h3>

              <div>
                <label className="text-xs font-bold text-primary block mb-1">
                  Kipimo cha Ugonjwa (Primary Diagnosis):
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-3 border-2 border-primary/30 rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-[#D6145A]"
                  placeholder="Mf. Typhoid, Malaria, BP ya Juu, n.k."
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 font-semibold space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  Mawaidha ya Kiafya na Lishe (Al-Furqan Herbs Protocol):
                </p>
                <p className="text-[11px]">
                  Mgonjwa anashauriwa kunywa maji mengi yasiyo ya baridi, kuepuka mafuta mengi, na kutumia asali safi mara mbili kwa siku.
                </p>
              </div>
            </div>
          )}

          {/* SubTab 3: Prescription */}
          {subTab === "prescription" && (
            <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-black text-primary uppercase flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#D6145A]" />
                Dawa na Matumizi (Prescriptions)
              </h3>

              {/* Add Drug Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-3 rounded-lg border border-slate-200 items-end">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Jina la Dawa:</label>
                  <input
                    type="text"
                    value={newDrug}
                    onChange={(e) => setNewDrug(e.target.value)}
                    placeholder="Mf. Asali ya Nyuki, Habat Soda"
                    className="p-2 border border-slate-300 rounded text-xs font-semibold w-full"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Dose / Mzunguko:</label>
                  <select
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="p-2 border border-slate-300 rounded text-xs font-semibold w-full bg-white"
                  >
                    <option value="Mara 3 kwa siku (1x3)">Mara 3 kwa siku (1x3)</option>
                    <option value="Mara 2 kwa siku (1x2)">Mara 2 kwa siku (1x2)</option>
                    <option value="Mara 1 kwa siku (1x1)">Mara 1 kwa siku (1x1)</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddDrug}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Ongeza
                </button>
              </div>

              {/* Prescriptions List Table */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-primary font-bold uppercase">
                    <tr>
                      <th className="p-2.5">Dawa</th>
                      <th className="p-2.5">Matumizi</th>
                      <th className="p-2.5">Siku</th>
                      <th className="p-2.5 text-right">Kitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prescriptions.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-extrabold text-primary">{item.drugName}</td>
                        <td className="p-2.5 text-slate-700">{item.dosage}</td>
                        <td className="p-2.5 font-mono font-bold text-secondary">{item.durationDays} Days</td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => handleRemoveDrug(idx)}
                            className="text-rose-600 font-bold hover:underline text-[11px]"
                          >
                            Ondoa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SubTab 4: Follow Up */}
          {subTab === "followup" && (
            <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-black text-primary uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D6145A]" />
                Ratiba ya Tarehe ya Marejeo (Follow Up Schedule)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">Tarehe ya Mgonjwa Kurejea Clinic:</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="p-2.5 border-2 border-primary/30 rounded-lg text-xs font-bold font-mono w-full"
                  />
                </div>

                <div className="flex items-end">
                  <p className="text-xs text-gray-600 font-semibold leading-tight">
                    🔔 Mgonjwa atatumiwa SMS ya kumbukumbu siku 1 kabla kupitia mfumo wa Oasis SMS.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSaveConsultation}
            className="w-full py-3.5 bg-[#D6145A] hover:bg-[#b00f48] text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>HIFADHI TARIFA ZOTE ZA DAKTARI NA TUMA SMS YA SHUKRANI</span>
          </button>

        </div>

      </div>

      {/* Saved Consultations Log */}
      {savedRecords.length > 0 && (
        <div className="mt-6 border-t border-slate-200 pt-4 space-y-3">
          <h3 className="text-xs font-black text-primary uppercase">
            Rekodi za Matibabu Zilizohifadhiwa Hivi Karibuni ({savedRecords.length})
          </h3>
          <div className="space-y-2">
            {savedRecords.map((rec) => (
              <div key={rec.id} className="p-3 bg-slate-50 border rounded-lg text-xs flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-primary uppercase">{rec.patientName}</span>
                  <span className="text-gray-500 ml-2 font-mono">({rec.date})</span>
                  <p className="text-slate-600 font-semibold mt-0.5">Diagnosis: {rec.diagnosis}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default DoctorModule;
