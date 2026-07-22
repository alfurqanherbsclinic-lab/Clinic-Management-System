import React, { useState } from "react";
import {
  UserPlus,
  Users,
  Search,
  Phone,
  FileText,
  Calendar,
  Trash2,
  CheckCircle,
  CreditCard,
  User,
  Activity,
  Heart
} from "lucide-react";
import { Patient } from "../types";

interface PatientsViewProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
}

function PatientsView({ patients, onAddPatient, onDeletePatient }: PatientsViewProps) {
  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [address, setAddress] = useState("");
  const [condition, setCondition] = useState("");

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Notification feedback
  const [showSuccess, setShowSuccess] = useState(false);

  // Generate unique card number (e.g. AFC-8821)
  const generateCardNumber = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `AFC-${randomDigits}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newPatient: Patient = {
      id: `patient-${Date.now()}`,
      cardNumber: generateCardNumber(),
      name,
      phone,
      age: parseInt(age) || 30,
      gender,
      address: address || "Dar es Salaam",
      condition: condition || "Tiba ya Jumla (General Remedy)",
      registrationDate: new Date().toISOString().split("T")[0]
    };

    onAddPatient(newPatient);

    // Clear form
    setName("");
    setPhone("");
    setAge("");
    setAddress("");
    setCondition("");

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.cardNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Registration Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-md p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-gray-900 text-lg">
              Usajili wa Mgonjwa Mpya (Patient Registration)
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Card Auto-Generate
          </span>
        </div>

        {showSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Mgonjwa amesajiliwa kikamilifu kwenye mfumo!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Jina Kamili la Mgonjwa *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mfano: Juma Rashid Bakari"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Namba ya Simu *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Mfano: 0712345678"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Umri (Miaka)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Mfano: 35"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Jinsia</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "Male" | "Female")}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value="Male">Mume (Male)</option>
                <option value="Female">Mwanamke (Female)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Anwani / Mahali Anapoishi</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Mfano: Ilala, Dar es Salaam"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Dokezo la Afya / Hali ya Mgonjwa</label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Mfano: Matatizo ya Tumbo na Nchi"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            <span>Hifadhi Mgonjwa Mpya</span>
          </button>
        </form>
      </div>

      {/* Patients Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-md p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-800" />
            <h2 className="font-extrabold text-gray-900 text-base">
              Orodha ya Wagonjwa Waliosajiliwa ({patients.length})
            </h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tafuta kwa jina, namba au kadi..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs">
            Hakuna mgonjwa aliyepatikana kwa utafutaji huo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="p-3">Namba ya Kadi</th>
                  <th className="p-3">Jina la Mgonjwa</th>
                  <th className="p-3">Simu</th>
                  <th className="p-3">Umri / Jinsia</th>
                  <th className="p-3">Hali / Dokezo</th>
                  <th className="p-3 text-right">Kitendo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-800">{p.cardNumber}</td>
                    <td className="p-3 font-bold text-gray-900">{p.name}</td>
                    <td className="p-3 font-mono text-gray-700">{p.phone}</td>
                    <td className="p-3 text-gray-600">
                      {p.age} Yrs ({p.gender === "Male" ? "Mume" : "Mwanamke"})
                    </td>
                    <td className="p-3 text-gray-600">{p.condition}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeletePatient(p.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Futa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export { PatientsView };
export default PatientsView;
