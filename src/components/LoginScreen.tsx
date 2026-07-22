import React, { useState } from "react";
import {
  Shield,
  Key,
  Fingerprint,
  CheckCircle,
  AlertCircle,
  User,
  Lock
} from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (userRole: string, userName: string) => void;
  initialAttempts?: number;
  onIncrementAttempts?: () => void;
}

const PRESET_USERS = [
  { id: "admin", name: "Dr. Al-Furqan Admin", username: "admin", role: "Administrator", roleDisplay: "Mkurugenzi / Admin", bioId: "ADM-9021-ALF", fingerCode: "fingerprint_index_admin" },
  { id: "fatma", name: "Fatma Ali", username: "famasia", role: "Pharmacist", roleDisplay: "Mfamasia (Pharmacist)", bioId: "FP-3389-FAT", fingerCode: "fingerprint_middle_fatma" }
];

function LoginScreen({ onLoginSuccess, initialAttempts, onIncrementAttempts }: LoginScreenProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Selected preset staff account
  const [selectedUser, setSelectedUser] = useState(PRESET_USERS[0].id);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = PRESET_USERS.find((u) => u.id === selectedUser);

    if (user) {
      onLoginSuccess(user.role, user.name);
    } else {
      setErrorMessage("Taarifa za kuingilia si sahihi.");
      if (onIncrementAttempts) onIncrementAttempts();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 border border-slate-100">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-100 text-emerald-800 rounded-2xl mb-1">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Al-Furqan Herbs Clinic
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Mfumo wa Usimamizi wa Afya na Tiba za Mitishamba
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Chagua Akaunti ya Wafanyakazi:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-600"
            >
              {PRESET_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.roleDisplay}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Nenosiri / Passcode:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-emerald-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4 text-amber-300" />
            <span>Ingia Kwenye Mfumo (Login)</span>
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-4">
          Mfumo wa Al-Furqan — Mfumo wa usalama uliohifadhiwa kwa usimamiaji wa kliniki.
        </div>
      </div>
    </div>
  );
}

export { LoginScreen };
export default LoginScreen;
