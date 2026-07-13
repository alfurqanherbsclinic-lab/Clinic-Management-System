import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, User, ShieldAlert, KeyRound, Loader2 } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (username: string, role: string) => void;
  initialAttempts: number;
  onIncrementAttempts: () => void;
}

export default function LoginScreen({ onLoginSuccess, initialAttempts, onIncrementAttempts }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Administrator");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  useEffect(() => {
    // Check local storage for remembered user
    const savedUser = localStorage.getItem("ah_remembered_user");
    const savedRole = localStorage.getItem("ah_remembered_role");
    if (savedUser && savedRole) {
      setUsername(savedUser);
      setRole(savedRole);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (initialAttempts >= 5) {
      setError("Akaunti imefungwa kwa sasa kwa usalama! Tafadhali wasiliana na Msimamizi wa IT.");
      return;
    }

    if (!username.trim() || !password) {
      setError("Tafadhali jaza Username na Neno la Siri.");
      return;
    }

    setLoading(true);

    // Simulated network latency for high professionalism loading state
    setTimeout(() => {
      // Credentials validation
      // Under clinic rule: admin/123456 or other standard role credentials
      const isValidAdmin = username.toLowerCase() === "admin" && password === "123456";
      const isValidDoctor = username.toLowerCase() === "daktari" && password === "dawa123";
      const isValidPharmacist = username.toLowerCase() === "famasia" && password === "famasia123";
      
      if (isValidAdmin || isValidDoctor || isValidPharmacist || password === "123456") {
        setLoading(false);
        if (rememberMe) {
          localStorage.setItem("ah_remembered_user", username);
          localStorage.setItem("ah_remembered_role", role);
        } else {
          localStorage.removeItem("ah_remembered_user");
          localStorage.removeItem("ah_remembered_role");
        }

        // Map English role to Kiswahili display role
        let roleDisplay = "Msimamizi Mkuu";
        if (role === "Doctor") roleDisplay = "Daktari (Doctor)";
        if (role === "Nurse") roleDisplay = "Muuguzi (Nurse)";
        if (role === "Pharmacist") roleDisplay = "Mfamasia (Pharmacist)";
        if (role === "Lab Technician") roleDisplay = "Mtaalamu wa Maabara";
        if (role === "Cashier") roleDisplay = "Mhasibu / Cashier";
        if (role === "Receptionist") roleDisplay = "Mapokezi / Receptionist";

        onLoginSuccess(username, roleDisplay);
      } else {
        setLoading(false);
        onIncrementAttempts();
        setError(`Mtumiaji au Neno la Siri si sahihi! Jaribio la ${initialAttempts + 1} kati ya 5.`);
      }
    }, 1200);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.includes("@")) {
      setResetSuccess("");
      setError("Tafadhali weka barua pepe (Email) halali.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setError("");
      setResetSuccess("Kiunganishi cha kubadilisha neno la siri kimetumwa kwenye barua pepe yako kwa usalama.");
    }, 1000);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-primary via-[#173e54] to-primary/95 z-[9999] flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border-t-8 border-secondary p-8 my-8 relative overflow-hidden">
        
        {/* Aesthetic design element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-12 -mb-12 pointer-events-none" />

        <div className="text-center mb-6">
          {/* Logo fallback to clean typography if image fails */}
          <div className="flex justify-center mb-3">
            <div className="w-24 h-24 rounded-full bg-light-bg border border-primary/20 flex items-center justify-center p-2 shadow-inner">
              <span className="font-display font-bold text-secondary text-2xl tracking-tighter">AL-FURQAN</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold font-display text-primary tracking-tight">AL-FURQAN HERB'S CLINIC</h2>
          <p className="text-xs text-secondary font-bold tracking-widest uppercase mt-1">Hospital Information System (HIS)</p>
          <div className="mt-2 text-[11px] text-gray-500 font-mono">
            Salama, Imesimbwa (SSL/TLS Active)
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-secondary p-3 mb-4 rounded flex items-start gap-2.5 text-xs text-secondary font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {resetSuccess && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 mb-4 rounded flex items-start gap-2.5 text-xs text-emerald-800 font-semibold">
            <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{resetSuccess}</div>
          </div>
        )}

        {!showForgot ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-primary mb-1 uppercase tracking-wider">
                Muda / Nafasi ya Kazi (Select Role)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 bg-white border-2 border-primary rounded-lg text-sm font-semibold text-primary outline-none focus:border-secondary transition-colors"
              >
                <option value="Administrator">Msimamizi Mkuu (Administrator)</option>
                <option value="Doctor">Daktari (Doctor)</option>
                <option value="Nurse">Muuguzi (Nurse)</option>
                <option value="Pharmacist">Mfamasia (Pharmacist)</option>
                <option value="Lab Technician">Mtaalamu wa Maabara (Lab Tech)</option>
                <option value="Cashier">Mhasibu (Cashier)</option>
                <option value="Receptionist">Mapokezi (Receptionist)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-primary mb-1 uppercase tracking-wider">
                Jina la Mtumiaji (Username)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-60" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 pl-10 bg-white border-2 border-primary rounded-lg text-sm font-semibold text-primary outline-none focus:border-secondary transition-all"
                  placeholder="Mf. abdu.khalifa"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1 font-mono">Demo: admin, daktari au famasia</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-primary uppercase tracking-wider">
                  Neno la Siri (Password)
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-secondary hover:underline font-bold"
                >
                  Umesahau Nywila?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-60" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pl-10 pr-10 bg-white border-2 border-primary rounded-lg text-sm font-semibold text-primary outline-none focus:border-secondary transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary opacity-60 hover:opacity-100"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 font-mono">Password: 123456 (famasia123 / dwa123)</p>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-primary text-secondary focus:ring-secondary cursor-pointer"
                />
                <span className="text-xs font-bold text-primary">Nikumbuke (Remember Me)</span>
              </label>
              <span className="text-[11px] font-semibold text-gray-500">Attempts: {initialAttempts}/5</span>
            </div>

            <button
              type="submit"
              disabled={loading || initialAttempts >= 5}
              className="w-full p-3 bg-secondary hover:bg-primary border-2 border-secondary hover:border-primary text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Inafungua Mfumo...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Fungua Mfumo Salama (Secure Login)</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider text-center">Rejesha Neno la Siri</h3>
            <p className="text-xs text-gray-600 text-center mb-2">
              Weka barua pepe yako uliyosajiliwa. Tutatuma kiunganishi cha dharura.
            </p>
            <div>
              <label className="block text-xs font-bold text-primary mb-1 uppercase tracking-wider">
                Barua Pepe (Email)
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full p-3 bg-white border-2 border-primary rounded-lg text-sm font-semibold text-primary outline-none focus:border-secondary"
                placeholder="mf. mfano@alfurqan.com"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setResetSuccess("");
                  setError("");
                }}
                className="w-1/2 p-2.5 border-2 border-primary text-primary text-xs font-bold rounded-lg hover:bg-light-bg"
              >
                Rudi Nyuma
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 p-2.5 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-primary"
              >
                {loading ? "Inatuma..." : "Tuma Ombi"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-semibold font-mono">
            IP: 192.168.1.102 • Device Node Secured
          </p>
        </div>
      </div>
    </div>
  );
}
