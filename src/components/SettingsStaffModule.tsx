import React, { useState } from "react";
import { 
  Settings, 
  UserCheck, 
  ShieldCheck, 
  Database, 
  Send, 
  Plus, 
  CheckCircle2, 
  Lock,
  Download,
  RotateCcw
} from "lucide-react";
import { StaffUser, AuditLog } from "../types";

interface SettingsStaffModuleProps {
  activeSubTab?: "settings_config" | "settings_staff" | "settings_logs";
}

const INITIAL_STAFF: StaffUser[] = [
  { id: "STF-01", name: "Dr. Khalifa Rehani", role: "Doctor", phone: "0711223344", email: "khalifa@alfurqan.co.tz", status: "Active" },
  { id: "STF-02", name: "Amina Juma", role: "Nurse", phone: "0755667788", email: "amina@alfurqan.co.tz", status: "Active" },
  { id: "STF-03", name: "Omari Rashidi", role: "Pharmacist", phone: "0788990011", email: "omari@alfurqan.co.tz", status: "Active" }
];

const INITIAL_LOGS: AuditLog[] = [
  { id: "LOG-001", timestamp: "2026-07-23 09:30", user: "Dr. Khalifa Rehani", action: "PATIENT_CONSULTATION", details: "Saved clinical record for patient ALI HASSAN" },
  { id: "LOG-002", timestamp: "2026-07-23 09:45", user: "Omari Rashidi", action: "PHARMACY_SALE", details: "Processed receipt REC-2026-1049" }
];

export function SettingsStaffModule({ activeSubTab = "settings_config" }: SettingsStaffModuleProps) {
  const [subTab, setSubTab] = useState<"settings_config" | "settings_staff" | "settings_logs">(activeSubTab);
  const [staff, setStaff] = useState<StaffUser[]>(INITIAL_STAFF);
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);

  // Oasis SMS settings
  const [oasisApiKey, setOasisApiKey] = useState("OASIS_KEY_2026_LIVE_88912");
  const [oasisSenderId, setOasisSenderId] = useState("AL-FURQAN");

  // New staff form
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState<StaffUser["role"]>("Doctor");
  const [staffPhone, setStaffPhone] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAddStaff = () => {
    if (!staffName.trim()) return;
    const newMember: StaffUser = {
      id: "STF-0" + (staff.length + 1),
      name: staffName,
      role: staffRole,
      phone: staffPhone || "07XXXXXXXX",
      email: staffName.toLowerCase().replace(" ", ".") + "@alfurqan.co.tz",
      status: "Active"
    };
    setStaff(prev => [...prev, newMember]);
    setStaffName("");
    setStaffPhone("");
    setSuccessMsg(`Mtumishi mpya '${newMember.name}' ameongezwa kwenye mfumo!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ staff, logs }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AL_FURQAN_HIS_BACKUP_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessMsg("Backup ya Mfumo imepakuliwa vyema!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border-2 border-primary/20 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-black font-display text-primary uppercase flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-700" />
            <span>MIPANGILIO YA MFUMO & USIMAMIZI WA WAFANYAKAZI</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Oasis SMS Integration, Firebase DB, Roles, Audit Logs na Backup</p>
        </div>
      </div>

      {/* SubTab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <button
          onClick={() => setSubTab("settings_config")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === "settings_config" ? "bg-slate-800 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>1. Oasis SMS & Firebase Config</span>
        </button>

        <button
          onClick={() => setSubTab("settings_staff")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === "settings_staff" ? "bg-slate-800 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>2. Wafanyakazi & Roles</span>
        </button>

        <button
          onClick={() => setSubTab("settings_logs")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === "settings_logs" ? "bg-slate-800 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3. Audit Logs & Backup</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl text-emerald-900 text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SubTab 1: System Config */}
      {subTab === "settings_config" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-3">
            <h3 className="text-xs font-black text-primary uppercase flex items-center gap-2">
              <Send className="w-4 h-4 text-rose-600" />
              Oasis SMS Gateway Configuration:
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Oasis API Key:</label>
              <input
                type="password"
                value={oasisApiKey}
                onChange={(e) => setOasisApiKey(e.target.value)}
                className="w-full p-2 border rounded text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Sender ID / Brand Name:</label>
              <input
                type="text"
                value={oasisSenderId}
                onChange={(e) => setOasisSenderId(e.target.value)}
                className="w-full p-2 border rounded text-xs font-bold"
              />
            </div>

            <div className="p-3 bg-emerald-100 text-emerald-900 rounded text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Status: Oasis Gateway Active & Connected!
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-3">
            <h3 className="text-xs font-black text-primary uppercase flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-600" />
              Firebase Firestore Database Status:
            </h3>

            <p className="text-xs text-gray-600">
              Database synchronized with collections: <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">patients</code>, <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">patient_reminders</code>, <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">broadcasts</code>.
            </p>

            <div className="p-3 bg-sky-100 text-sky-900 rounded text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              Status: Firebase Sync Online!
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Staff */}
      {subTab === "settings_staff" && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
            <h3 className="text-xs font-black text-primary uppercase">Sajili Wafanyakazi WAPYA:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Jina Kamili la Mtumishi"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="p-2 border rounded text-xs font-bold"
              />
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as any)}
                className="p-2 border rounded text-xs font-bold bg-white"
              >
                <option value="Doctor">Doctor (Daktari)</option>
                <option value="Nurse">Nurse (Muuguzi)</option>
                <option value="Pharmacist">Pharmacist (Mfamasia)</option>
                <option value="Lab Tech">Lab Tech (Maabara)</option>
                <option value="Receptionist">Receptionist (Mapokezi)</option>
                <option value="Admin">Admin (Msimamizi)</option>
              </select>
              <input
                type="text"
                placeholder="Namba ya Simu"
                value={staffPhone}
                onChange={(e) => setStaffPhone(e.target.value)}
                className="p-2 border rounded text-xs font-bold"
              />
            </div>
            <button
              onClick={handleAddStaff}
              className="py-2 px-4 bg-slate-800 text-white font-bold text-xs rounded cursor-pointer"
            >
              + Ongeza Mtumishi
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-black text-primary uppercase">Wafanyakazi Waliopo ({staff.length}):</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {staff.map(s => (
                <div key={s.id} className="p-3 bg-white border rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-extrabold text-primary">{s.name}</p>
                    <p className="text-gray-500 font-mono">📱 {s.phone} • {s.email}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-black rounded text-[10px] uppercase">
                    {s.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Backup & Audit Logs */}
      {subTab === "settings_logs" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-primary uppercase">Audit Logs za Mfumo:</h3>
            <button
              onClick={handleBackup}
              className="px-3 py-1.5 bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download System Backup (JSON)</span>
            </button>
          </div>

          <div className="space-y-2">
            {logs.map(l => (
              <div key={l.id} className="p-3 bg-slate-50 border rounded-lg text-xs flex justify-between items-center">
                <div>
                  <span className="font-mono text-gray-400">{l.timestamp}</span> | <span className="font-bold text-primary">{l.user}</span>
                  <p className="text-slate-700 font-semibold">{l.details}</p>
                </div>
                <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                  {l.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default SettingsStaffModule;
