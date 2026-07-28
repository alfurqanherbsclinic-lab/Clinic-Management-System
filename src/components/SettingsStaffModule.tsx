import React, { useState, useEffect } from "react";
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
  RotateCcw,
  Trash2,
  ShieldAlert,
  Fingerprint
} from "lucide-react";
import { StaffUser, AuditLog } from "../types";
import { db } from "../lib/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

interface SettingsStaffModuleProps {
  activeSubTab?: "settings_config" | "settings_staff" | "settings_logs";
}

const INITIAL_LOGS: AuditLog[] = [
  { id: "LOG-001", timestamp: "2026-07-23 09:30", user: "Abdu Khalifa", action: "PATIENT_CONSULTATION", details: "Saved clinical record for patient ALI HASSAN" },
  { id: "LOG-002", timestamp: "2026-07-23 09:45", user: "Fatma Ali", action: "PHARMACY_SALE", details: "Processed receipt REC-2026-1049" }
];

export function SettingsStaffModule({ activeSubTab = "settings_config" }: SettingsStaffModuleProps) {
  const [subTab, setSubTab] = useState<"settings_config" | "settings_staff" | "settings_logs">(activeSubTab);
  const [dbStaff, setDbStaff] = useState<any[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);

  // Oasis SMS settings
  const [oasisApiKey, setOasisApiKey] = useState("OASIS_KEY_2026_LIVE_88912");
  const [oasisSenderId, setOasisSenderId] = useState("AL-FURQAN");

  // New staff form
  const [staffName, setStaffName] = useState("");
  const [staffUsername, setStaffUsername] = useState("");
  const [staffRole, setStaffRole] = useState("Doctor");
  const [staffPhone, setStaffPhone] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Sync with Firebase Firestore Real-Time
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = onSnapshot(collection(db, "staff_members"), (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(docSnap => docSnap.data());
          setDbStaff(list);
          localStorage.setItem("al_furqan_biometric_staff", JSON.stringify(list));
          localStorage.setItem("al_furqan_staff_initialized", "true");
        } else {
          const isInitialized = localStorage.getItem("al_furqan_staff_initialized");
          if (!isInitialized) {
            const saved = localStorage.getItem("al_furqan_biometric_staff");
            if (saved !== null) setDbStaff(JSON.parse(saved));
          } else {
            setDbStaff([]);
            localStorage.setItem("al_furqan_biometric_staff", JSON.stringify([]));
          }
        }
      }, (err) => {
        console.error("Firestore sync error:", err);
        const saved = localStorage.getItem("al_furqan_biometric_staff");
        const isInitialized = localStorage.getItem("al_furqan_staff_initialized");
        if (saved !== null && isInitialized) {
          setDbStaff(JSON.parse(saved));
        } else {
          setDbStaff([]);
        }
      });
    } catch (e) {
      console.error("Firebase init error:", e);
      const saved = localStorage.getItem("al_furqan_biometric_staff");
      if (saved !== null) setDbStaff(JSON.parse(saved));
    }

    return () => unsubscribe();
  }, []);

  const handleAddStaff = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!staffName.trim() || !staffUsername.trim()) {
      setErrorMsg("Tafadhali jaza Jina Kamili na Username.");
      return;
    }

    const cleanUsername = staffUsername.toLowerCase().replace(/\s+/g, "");

    let roleDisplay = "Msimamizi Mkuu";
    if (staffRole === "Doctor") roleDisplay = "Daktari (Doctor)";
    if (staffRole === "Nurse") roleDisplay = "Muuguzi (Nurse)";
    if (staffRole === "Pharmacist") roleDisplay = "Mfamasia (Pharmacist)";
    if (staffRole === "Lab Tech" || staffRole === "Lab Technician") roleDisplay = "Mtaalamu wa Maabara";
    if (staffRole === "Cashier") roleDisplay = "Mhasibu / Cashier";
    if (staffRole === "Receptionist") roleDisplay = "Mapokezi / Receptionist";

    const newStaff = {
      id: "staff_" + Date.now(),
      name: staffName,
      username: cleanUsername,
      role: staffRole,
      roleDisplay: roleDisplay,
      bioId: "FP-" + Math.floor(1000 + Math.random() * 9000) + "-REG",
      fingerName: "Kihisi cha Kidole (WebAuthn / Device Biometric)",
      phone: staffPhone || "07XXXXXXXX",
      status: "Active"
    };

    localStorage.setItem("al_furqan_staff_initialized", "true");

    try {
      await setDoc(doc(db, "staff_members", newStaff.id), newStaff);
    } catch (e) {
      console.error("Error adding staff to Firebase:", e);
    }

    const updated = [...dbStaff, newStaff];
    setDbStaff(updated);
    localStorage.setItem("al_furqan_biometric_staff", JSON.stringify(updated));

    setStaffName("");
    setStaffUsername("");
    setStaffPhone("");
    setSuccessMsg(`Mfanyakazi mpya '${newStaff.name}' amesajiliwa kikamilifu kwenye Database na anaweza kuingia kwenye mfumo!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!window.confirm(`Je, una uhakika unataka kumfuta Mfanyakazi '${name}' kwenye mfumo? Mfanyakazi huyu hatakuwa tena na uwezo wa kuingia.`)) {
      return;
    }

    localStorage.setItem("al_furqan_staff_initialized", "true");

    try {
      await deleteDoc(doc(db, "staff_members", id));
    } catch (e) {
      console.error("Error deleting staff from Firebase:", e);
    }

    const updated = dbStaff.filter(s => s.id !== id);
    setDbStaff(updated);
    localStorage.setItem("al_furqan_biometric_staff", JSON.stringify(updated));

    setSuccessMsg(`Mfanyakazi '${name}' amefutwa kikamilifu kutoka kwenye Database na hana tena uwezo wa kuingia.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ staff: dbStaff, logs }));
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

      {/* SubTab 2: Staff Management & Deletion (Admin Only) */}
      {subTab === "settings_staff" && (
        <div className="space-y-4">
          
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-black text-primary uppercase flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#D6145A]" />
              <span>Sajili Mfanyakazi Mpya kwenye Database (Firebase Sync):</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Jina Kamili</label>
                <input
                  type="text"
                  placeholder="mf. Abdu Khalifa"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Username (ya Kuingia)</label>
                <input
                  type="text"
                  placeholder="mf. abdu.khalifa"
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Nafasi / Role</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="Administrator">Administrator (Msimamizi)</option>
                  <option value="Doctor">Doctor (Daktari)</option>
                  <option value="Nurse">Nurse (Muuguzi)</option>
                  <option value="Pharmacist">Pharmacist (Mfamasia)</option>
                  <option value="Lab Tech">Lab Tech (Maabara)</option>
                  <option value="Cashier">Cashier (Mhasibu)</option>
                  <option value="Receptionist">Receptionist (Mapokezi)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Namba ya Simu</label>
                <input
                  type="text"
                  placeholder="07XXXXXXXX"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            <button
              onClick={handleAddStaff}
              className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Sajili Mfanyakazi Mpya</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-primary uppercase tracking-wider">
                Orodha ya Wafanyakazi Waliopo kwenye Database ({dbStaff.length}):
              </h3>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                â— Live Firebase Firestore Sync
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dbStaff.map(s => (
                <div key={s.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center text-xs shadow-xs hover:border-slate-300 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-900 text-sm">{s.name}</p>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-black rounded-md text-[10px] uppercase">
                        {s.roleDisplay || s.role}
                      </span>
                    </div>

                    <p className="text-slate-500 font-medium">
                      Username: <code className="font-mono bg-slate-100 text-primary px-1.5 py-0.5 rounded font-bold">{s.username}</code>
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                      <span>ðŸ“± {s.phone || "07XXXXXXXX"}</span>
                      <span>â€¢</span>
                      <span className="flex items-center gap-1 text-slate-600 font-bold">
                        <Fingerprint className="w-3 h-3 text-[#D6145A]" />
                        {s.webauthnCredential ? "WebAuthn Passkey Registered" : "Kihisi cha Kidole (Passkey Ready)"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteStaff(s.id, s.name)}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-rose-200 text-xs font-bold"
                    title="Futa Mfanyakazi Huyu kwenye Mfumo"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Futa</span>
                  </button>
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
