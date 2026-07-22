import React, { useState } from "react";
import {
  UserPlus,
  Search,
  Filter,
  Users,
  Trash2,
  Calendar,
  Phone,
  Pill,
  Clock,
  HeartPulse,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle2,
  X,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { Patient } from "../types";

interface PatientsViewProps {
  patients: Patient[];
  onAddPatient: (patient: Omit<Patient, "id" | "registeredDate">) => void;
  onDeletePatient: (id: string) => void;
}

function PatientsView({ patients, onAddPatient, onDeletePatient }: PatientsViewProps) {
  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [condition, setCondition] = useState<Patient["condition"]>("Kisukari (Diabetes)");
  const [medication, setMedication] = useState("");
  const [dosageTime, setDosageTime] = useState("");
  const [nextClinicDate, setNextClinicDate] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConditionFilter, setSelectedConditionFilter] = useState<string>("ALL");
  const [selectedPatientModal, setSelectedPatientModal] = useState<Patient | null>(null);

  // Quick stats
  const totalCount = patients.length;
  const diabetesCount = patients.filter((p) => p.condition.includes("Kisukari")).length;
  const bpCount = patients.filter((p) => p.condition.includes("Shinikizo")).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !medication || !dosageTime) return;

    onAddPatient({
      name,
      phone,
      condition,
      medication,
      dosageTime,
      nextClinicDate: nextClinicDate || "Haijapangwa",
      status: "Active"
    });

    // Reset Form
    setName("");
    setPhone("");
    setMedication("");
    setDosageTime("");
    setNextClinicDate("");
  };

  // Filtered list
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.medication.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedConditionFilter === "ALL" || p.condition === selectedConditionFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Jumla ya Wagonjwa Waliosajiliwa</p>
            <h3 className="text-2xl font-black text-white mt-1">{totalCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Magonjwa ya Kisukari</p>
            <h3 className="text-2xl font-black text-cyan-400 mt-1">{diabetesCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Shinikizo la Damu (BP)</p>
            <h3 className="text-2xl font-black text-rose-400 mt-1">{bpCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Add New Patient Form */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl h-fit space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-700/60">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Sajili Mgonjwa Mpya</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Jina Kamili la Mgonjwa</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mf. Juma Bakari Mwalimu"
                required
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Namba ya Simu (SMS Reminders)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712345678"
                required
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Aina ya Ugonjwa Sugu</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Patient["condition"])}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Kisukari (Diabetes)">Kisukari (Diabetes)</option>
                <option value="Shinikizo la Damu (BP)">Shinikizo la Damu (BP)</option>
                <option value="Kisukari & BP">Kisukari & Shinikizo la Damu</option>
                <option value="Mengineyo">Mengineyo</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Aina ya Dawa Anazotumia</label>
              <input
                type="text"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="mf. Metformin 500mg, Amlodipine 10mg"
                required
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Muda wa Dawa</label>
                <input
                  type="text"
                  value={dosageTime}
                  onChange={(e) => setDosageTime(e.target.value)}
                  placeholder="mf. 08:00 Asubuhi"
                  required
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Siku ya Kliniki</label>
                <input
                  type="date"
                  value={nextClinicDate}
                  onChange={(e) => setNextClinicDate(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Hifadhi Mgonjwa
            </button>
          </form>
        </div>

        {/* Right Side: Registered Patients List & Search */}
        <div className="lg:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Orodha ya Wagonjwa <span className="text-xs bg-slate-700 text-emerald-400 px-2 py-0.5 rounded-full">{filteredPatients.length}</span>
              </h2>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 text-xs bg-slate-900/80 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setSelectedConditionFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    selectedConditionFilter === "ALL" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Wote
                </button>
                <button
                  onClick={() => setSelectedConditionFilter("Kisukari (Diabetes)")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    selectedConditionFilter === "Kisukari (Diabetes)" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Kisukari
                </button>
                <button
                  onClick={() => setSelectedConditionFilter("Shinikizo la Damu (BP)")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    selectedConditionFilter === "Shinikizo la Damu (BP)" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  BP
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tafuta kwa Jina, Namba ya Simu au Dawa..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Patient Cards Grid */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredPatients.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Hakuna mgonjwa aliyepatikana kwa utafutaji wako.
                </div>
              ) : (
                filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white group-hover:text-emerald-400 transition">{p.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          p.condition.includes("Kisukari") ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}>
                          {p.condition}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" /> {p.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Pill className="w-3 h-3 text-emerald-400" /> {p.medication} ({p.dosageTime})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-400" /> Kliniki: {p.nextClinicDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => setSelectedPatientModal(p)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
                      >
                        Taarifa
                      </button>
                      <button
                        onClick={() => onDeletePatient(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Futa Mgonjwa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Details Modal */}
      {selectedPatientModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 text-slate-100 relative">
            <button
              onClick={() => setSelectedPatientModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-lg">
                {selectedPatientModal.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedPatientModal.name}</h3>
                <p className="text-xs text-slate-400">{selectedPatientModal.condition}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl space-y-1">
                <p className="text-slate-400">Namba ya Simu:</p>
                <p className="font-semibold text-white">{selectedPatientModal.phone}</p>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl space-y-1">
                <p className="text-slate-400">Dawa na Dozi:</p>
                <p className="font-semibold text-emerald-400">{selectedPatientModal.medication} — {selectedPatientModal.dosageTime}</p>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl space-y-1">
                <p className="text-slate-400">Siku ya Kliniki Inayofuata:</p>
                <p className="font-semibold text-amber-400">{selectedPatientModal.nextClinicDate}</p>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl space-y-1">
                <p className="text-slate-400">Tarehe ya Kusajiliwa:</p>
                <p className="font-semibold text-slate-200">{selectedPatientModal.registeredDate}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPatientModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-xs text-slate-200 transition"
            >
              Funga (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { PatientsView };
export default PatientsView;
