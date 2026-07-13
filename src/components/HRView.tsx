import React, { useState } from "react";
import { UserCheck, ShieldAlert, CheckCircle, Clock, Plus, Trash2, HeartHandshake, Award } from "lucide-react";
import { Staff } from "../types";

interface HRViewProps {
  staffList: Staff[];
  onAddStaff: (newStaff: Staff) => void;
  onUpdateAttendance: (id: string, attendance: Staff["attendance"]) => void;
}

export default function HRView({ staffList, onAddStaff, onUpdateAttendance }: HRViewProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<Staff["role"]>("Doctor");
  const [phone, setPhone] = useState("");
  const [salary, setSalary] = useState("1200000");

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStaff: Staff = {
      id: `STF-${Math.floor(100 + Math.random() * 900)}`,
      name,
      role,
      phone,
      attendance: "Present",
      payrollSalary: parseFloat(salary) || 1000000
    };

    onAddStaff(newStaff);
    alert(`Wafanyakazi ${newStaff.name} amesajiliwa kikamilifu kwenye idara ya rasilimali watu.`);

    // Clear form
    setName("");
    setPhone("");
    setSalary("1200000");
  };

  const getAttendanceBadgeColor = (status: Staff["attendance"]) => {
    switch (status) {
      case "Present": return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Absent": return "bg-red-100 text-red-800 border-red-300";
      case "Late": return "bg-amber-100 text-amber-800 border-amber-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Human Resource Staff & Attendance tracker list */}
        <div className="xl:col-span-2 bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-primary/20 pb-3">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-secondary animate-pulse" />
              Wafanyakazi & Mahudhurio (HIS Staff & Attendance Rota)
            </h3>
            <span className="bg-primary text-white text-xs px-2.5 py-0.5 rounded font-mono font-bold">
              Total {staffList.length} Wafanyakazi
            </span>
          </div>

          <div className="table-responsive">
            <table className="text-left w-full text-xs font-semibold">
              <thead>
                <tr>
                  <th className="p-3">Staff ID & Jina</th>
                  <th className="p-3">Nafasi (Designation)</th>
                  <th className="p-3">Simu ya Mezani</th>
                  <th className="p-3">Mahudhurio Leo (Attendance)</th>
                  <th className="p-3">Mshahara (Salary)</th>
                  <th className="p-3">Badili Mahudhurio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffList.map((stf) => (
                  <tr key={stf.id} className="hover:bg-light-bg/50">
                    <td className="p-3">
                      <div className="font-bold text-primary uppercase">{stf.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{stf.id}</div>
                    </td>
                    <td className="p-3">
                      <span className="inline-block bg-primary/5 text-primary border border-primary/10 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                        {stf.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-gray-600">{stf.phone}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-extrabold border ${getAttendanceBadgeColor(stf.attendance)}`}>
                        {stf.attendance === "Present" ? "Yupo" : stf.attendance === "Late" ? "Amechelewa" : "Hajafika"}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-secondary font-bold">
                      {stf.payrollSalary.toLocaleString()} TZS
                    </td>
                    <td className="p-3">
                      <select
                        value={stf.attendance}
                        onChange={(e) => onUpdateAttendance(stf.id, e.target.value as Staff["attendance"])}
                        className="p-1 border border-primary rounded bg-white text-[11px] font-bold text-primary"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Add New Staff Member & Payroll Summary placeholder */}
        <div className="space-y-4">
          
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b-2 border-secondary pb-2">
              Sajili Mfanyakazi Mpya (Staff Registration)
            </h3>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="flex flex-col text-xs">
                <label className="font-bold text-primary mb-1">Majina Kamili *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg font-semibold"
                  placeholder="Mf. Aisha Bakari"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col">
                  <label className="font-bold text-primary mb-1">Idara / Jukumu</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Staff["role"])}
                    className="p-2.5 border-2 border-primary rounded-lg font-semibold bg-white"
                  >
                    <option value="Doctor">Daktari (Doctor)</option>
                    <option value="Nurse">Muuguzi (Nurse)</option>
                    <option value="Pharmacist">Mfamasia (Pharmacist)</option>
                    <option value="Lab Technician">Mtaalamu wa Maabara</option>
                    <option value="Cashier">Mhasibu (Cashier)</option>
                    <option value="Receptionist">Mapokezi (Receptionist)</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-bold text-primary mb-1">Mshahara (Monthly) *</label>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col text-xs">
                <label className="font-bold text-primary mb-1">Namba ya Simu *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg font-semibold font-mono"
                  placeholder="07XXXXXXXX"
                />
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-secondary hover:bg-primary border-2 border-secondary hover:border-primary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" />
                Hifadhi Mfanyakazi Mpya
              </button>
            </form>
          </div>

          {/* Payroll placeholder tracker */}
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-3.5">
            <h4 className="text-xs font-bold text-primary font-display uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-secondary animate-bounce" />
              Idara ya Mishahara (Payroll Status)
            </h4>
            <div className="space-y-2 text-xs font-semibold text-gray-700">
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span>Gharama ya Mishahara:</span>
                <span className="font-mono text-primary font-extrabold">
                  {staffList.reduce((sum, s) => sum + s.payrollSalary, 0).toLocaleString()} TZS
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span>Mwezi huu wa Malipo:</span>
                <span className="text-emerald-700 font-extrabold uppercase">Imeandaliwa (Ready)</span>
              </div>
              <div className="flex justify-between">
                <span>Njia ya Malipo:</span>
                <span className="text-primary font-bold">Bank Transfer (NMB / CRDB)</span>
              </div>
            </div>
            <button
              onClick={() => alert("Mishahara yote imetumwa kikamilifu kwenye akaunti za benki za wafanyakazi leo.")}
              className="w-full p-2.5 bg-primary hover:bg-secondary text-white font-bold rounded text-[10px] uppercase transition-colors cursor-pointer"
            >
              Tuma Mishahara Sasa (Process Payroll)
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
