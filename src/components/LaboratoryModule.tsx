import React, { useState } from "react";
import { 
  FlaskConical, 
  CheckSquare, 
  Search, 
  Printer, 
  Plus, 
  Clock, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from "lucide-react";
import { Patient, LabTest } from "../types";

interface LaboratoryModuleProps {
  patients: Patient[];
  activeSubTab?: "lab_tests" | "lab_results";
}

const INITIAL_LAB_TESTS: LabTest[] = [
  {
    id: "LAB-101",
    patientId: "AF-001",
    patientName: "ALI HASSAN",
    testName: "Kipimo cha Damu (Full Blood Picture - FBP)",
    category: "Hematology",
    requestDate: new Date().toISOString().split("T")[0],
    status: "Completed",
    result: "Hemoglobin (Hb): 13.5 g/dL, WBC: 6.2 x10^9/L, Platelets: 250 x10^9/L",
    normalRange: "Hb: 12.0 - 16.0 g/dL",
    unit: "g/dL",
    performedBy: "Lab Tech Omari",
    notes: "Kipimo kiko katika viwango vya kawaida.",
    cost: 15000
  },
  {
    id: "LAB-102",
    patientId: "AF-002",
    patientName: "AMINA OMARI",
    testName: "Widal Test (Typhoid Fever)",
    category: "Serology",
    requestDate: new Date().toISOString().split("T")[0],
    status: "Requested",
    result: "",
    normalRange: "Negative (< 1:80)",
    unit: "Titre",
    performedBy: "Pending",
    notes: "Kipimo kimeombwa na Daktari.",
    cost: 10000
  }
];

export function LaboratoryModule({ patients, activeSubTab = "lab_tests" }: LaboratoryModuleProps) {
  const [subTab, setSubTab] = useState<"lab_tests" | "lab_results">(activeSubTab);
  const [labTests, setLabTests] = useState<LabTest[]>(INITIAL_LAB_TESTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || "");
  const [testName, setTestName] = useState("Kipimo cha Typhoid (Widal Test)");
  const [testCategory, setTestCategory] = useState("Serology");
  const [testCost, setTestCost] = useState("10000");

  // For result entry
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [resultInput, setResultInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleRequestTest = () => {
    if (!selectedPatient) return;
    const newTest: LabTest = {
      id: "LAB-" + (labTests.length + 101),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      testName,
      category: testCategory,
      requestDate: new Date().toISOString().split("T")[0],
      status: "Requested",
      cost: parseFloat(testCost) || 10000
    };

    setLabTests(prev => [newTest, ...prev]);
    setSuccessMsg(`Ombi la kipimo cha '${testName}' kwa mgonjwa ${selectedPatient.name} limetumwa Maabara!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleSaveResult = (testId: string) => {
    setLabTests(prev => prev.map(t => {
      if (t.id === testId) {
        return {
          ...t,
          status: "Completed",
          result: resultInput || "Positive (+)",
          notes: notesInput || "Vipimo vimekamilika",
          performedBy: "Lab Tech Al-Furqan"
        };
      }
      return t;
    }));
    setEditingTestId(null);
    setResultInput("");
    setNotesInput("");
    setSuccessMsg("Matokeo ya kipimo yamehifadhiwa vyema!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filteredTests = labTests.filter(t => 
    t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-5 rounded-2xl border-2 border-primary/20 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-black font-display text-primary uppercase flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-purple-600" />
            <span>HUDUMA ZA MAABARA (LABORATORY DIAGNOSTICS)</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Usimamizi wa Vipimo vya Damu, Mkojo, Stool, Widal na Matokeo</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Lab Report</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <button
          onClick={() => setSubTab("lab_tests")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === "lab_tests" ? "bg-purple-700 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>1. Omba Kipimo cha Maabara</span>
        </button>

        <button
          onClick={() => setSubTab("lab_results")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            subTab === "lab_results" ? "bg-purple-700 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>2. Weka & Tazama Matokeo</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl text-emerald-900 text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SubTab 1: Request Lab Test */}
      {subTab === "lab_tests" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-black text-primary uppercase">Fomu ya Kuomba Kipimo:</h3>

            <div>
              <label className="text-xs font-bold text-primary block mb-1">Chagua Mgonjwa:</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-2.5 border-2 border-primary/30 rounded-lg text-xs font-bold bg-white text-primary"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name.toUpperCase()} ({p.cardNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-primary block mb-1">Aina ya Kipimo (Lab Test):</label>
              <select
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full p-2.5 border-2 border-primary/30 rounded-lg text-xs font-bold bg-white text-primary"
              >
                <option value="Kipimo cha Typhoid (Widal Test)">Kipimo cha Typhoid (Widal Test)</option>
                <option value="Kipimo cha Malaria (mRDT / BS)">Kipimo cha Malaria (mRDT / BS)</option>
                <option value="Kipimo cha Damu (Full Blood Picture - FBP)">Kipimo cha Damu (Full Blood Picture - FBP)</option>
                <option value="Kipimo cha Mkojo (Urinalysis)">Kipimo cha Mkojo (Urinalysis)</option>
                <option value="Kipimo cha Sukari (Blood Glucose)">Kipimo cha Sukari (Blood Glucose)</option>
                <option value="Kipimo cha Helico Pylori (H. Pylori Stool/Blood)">Kipimo cha H. Pylori</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-primary block mb-1">Kipengele (Category):</label>
                <input
                  type="text"
                  value={testCategory}
                  onChange={(e) => setTestCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-primary block mb-1">Gharama (TZS):</label>
                <input
                  type="number"
                  value={testCost}
                  onChange={(e) => setTestCost(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-bold font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleRequestTest}
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tuma Ombi Maabara</span>
            </button>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-black text-primary uppercase">Orodha ya VIPIMO Zilizowasilishwa:</h3>
            <div className="space-y-2">
              {labTests.map(t => (
                <div key={t.id} className="p-3 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-primary">{t.testName}</span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded font-mono">
                        {t.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-bold uppercase mt-0.5">👤 {t.patientName}</p>
                    <p className="text-[10px] text-gray-500 font-mono">Tarehe: {t.requestDate} • Gharama: TZS {t.cost.toLocaleString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    t.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800 animate-pulse"
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Lab Results */}
      {subTab === "lab_results" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-primary uppercase">Matokeo ya Vipimo vya Maabara:</h3>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Tafuta mgonjwa au kipimo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredTests.map(t => (
              <div key={t.id} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-black text-sm text-primary uppercase">{t.patientName}</span>
                    <span className="ml-2 font-mono text-xs text-secondary font-bold">({t.testName})</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    t.status === "Completed" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                  }`}>
                    {t.status}
                  </span>
                </div>

                {t.status === "Completed" ? (
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1 text-xs">
                    <p className="font-bold text-emerald-900">🔬 Matokeo: <span className="font-mono text-primary font-extrabold">{t.result}</span></p>
                    <p className="text-gray-600">Maelezo: {t.notes}</p>
                    <p className="text-[10px] text-gray-400 font-mono">Alipima: {t.performedBy}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {editingTestId === t.id ? (
                      <div className="bg-white p-3 rounded-lg border-2 border-purple-400 space-y-2">
                        <label className="text-xs font-bold text-primary block">Ingiza Matokeo ya Vipimo:</label>
                        <input
                          type="text"
                          value={resultInput}
                          onChange={(e) => setResultInput(e.target.value)}
                          placeholder="Mf. Positive (+1:160) - Salmonella Typhi O & H"
                          className="w-full p-2 border border-slate-300 rounded text-xs font-bold font-mono"
                        />
                        <textarea
                          rows={2}
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          placeholder="Maelezo ya ziada kutoka kwa Mtaalamu wa Maabara..."
                          className="w-full p-2 border border-slate-300 rounded text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveResult(t.id)}
                            className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded cursor-pointer"
                          >
                            Hifadhi Matokeo
                          </button>
                          <button
                            onClick={() => setEditingTestId(null)}
                            className="px-3 py-1.5 bg-gray-200 text-gray-800 font-bold text-xs rounded cursor-pointer"
                          >
                            Ghairi
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingTestId(t.id);
                          setResultInput("Positive (+) - Typhi O Titre 1:160");
                        }}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Weka Matokeo ya Kipimo Hiki</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default LaboratoryModule;
