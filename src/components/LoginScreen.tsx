import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, User, ShieldAlert, KeyRound, Loader2, Fingerprint, CheckCircle2, ShieldCheck } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (username: string, role: string) => void;
  initialAttempts: number;
  onIncrementAttempts: () => void;
}

// Orodha rasmi ya wafanyakazi wa ofisi walioruhusiwa kutumia biometric
const AUTHORIZED_STAFF = [
  { id: "abdu", name: "Abdu Khalifa", username: "abdu.khalifa", role: "Administrator", roleDisplay: "Msimamizi Mkuu", bioId: "FP-8842-KHA", status: "Active" },
  { id: "yusuf", name: "Dr. Yusuf Hamis", username: "daktari", role: "Doctor", roleDisplay: "Daktari (Doctor)", bioId: "FP-4412-YUS", status: "Active" },
  { id: "fatma", name: "Fatma Ali", username: "famasia", role: "Pharmacist", roleDisplay: "Mfamasia (Pharmacist)", bioId: "FP-3389-FAT", status: "Active" },
  { id: "said", name: "Said Kassim", username: "said.lab", role: "Lab Technician", roleDisplay: "Mtaalamu wa Maabara", bioId: "FP-1204-KAS", status: "Active" }
];

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

  // Biometric states
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState("");
  const [scanSuccess, setScanSuccess] = useState(false);
  const [biometricError, setBiometricError] = useState("");

  useEffect(() => {
    // Angalia local storage kwa mtumiaji aliyekumbukwa
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

    // Uhakiki wa nenosiri wa kawaida
    setTimeout(() => {
      const isValidAdmin = username.toLowerCase() === "admin" || username.toLowerCase() === "abdu.khalifa" && password === "123456";
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

  // Uhakiki wa Alama ya Kidole kwa wafanyakazi walioruhusiwa pekee
  const handleBiometricLogin = () => {
    setBiometricError("");
    
    if (initialAttempts >= 5) {
      setBiometricError("Akaunti imefungwa kwa sababu ya majaribio mengi yaliyofeli!");
      return;
    }

    // Mtumiaji lazima achague jina lake kwanza kwenye orodha ya ofisi
    if (!selectedStaffId) {
      setBiometricError("Tafadhali chagua jina lako la kazi (Staff Member) kwanza kwenye orodha ili kuthibitisha alama ya kidole chako.");
      return;
    }

    const staff = AUTHORIZED_STAFF.find(s => s.id === selectedStaffId);
    if (!staff) {
      setBiometricError("Mfanyakazi huyu hajatambuliwa kwenye mfumo wa biometric!");
      return;
    }

    setBiometricScanning(true);
    setBiometricStatus("Weka na ushikilie kidole chako kwenye kisomaji cha Biometric...");
    setScanSuccess(false);

    // Simulation ya process ya kuhakiki na database ya ofisi
    setTimeout(() => {
      setBiometricStatus(`Kusoma vipimo vya biometric vya ${staff.name}...`);
      
      setTimeout(() => {
        setBiometricStatus(`Inalinganisha alama ya kidole na Hash Key ${staff.bioId}...`);
        
        setTimeout(() => {
          setBiometricScanning(false);
          setScanSuccess(true);
          setBiometricStatus("Imethibitishwa kikamilifu! Usalama umeruhusiwa.");
          
          // Mafanikio ya kuingia
          setTimeout(() => {
            onLoginSuccess(staff.username, staff.roleDisplay);
          }, 600);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-100 z-[9999] flex justify-center items-center p-4 overflow-y-auto">
      {/* Soft decorative ambient circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D6145A]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#D6145A]/5 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 grid grid-cols-1 md:grid-cols-12 overflow-hidden relative min-h-[580px]">
        
        {/* Left Section: Core Credentials Form (7 columns) */}
        <div className="md:col-span-7 p-8 flex flex-col justify-between">
          <div>
            {/* Logo and title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#D6145A]/10 flex items-center justify-center text-[#D6145A] font-black text-xl shadow-sm">
                AF
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">AL-FURQAN HERB'S</h2>
                <p className="text-[10px] text-[#D6145A] font-extrabold tracking-wider uppercase">Hospital Information System</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-black text-slate-800 leading-none mb-1">Hello!</h3>
              <p className="text-slate-500 font-medium text-xs">Karibu tena! Ingia ili kusimamia taarifa za wagonjwa na matibabu.</p>
            </div>

            {error && (
              <div className="bg-rose-50 border-l-4 border-[#D6145A] p-3 mb-4 rounded-xl flex items-start gap-2 text-xs text-[#D6145A] font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {resetSuccess && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 mb-4 rounded-xl flex items-start gap-2 text-xs text-emerald-800 font-semibold">
                <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{resetSuccess}</div>
              </div>
            )}

            {!showForgot ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Select Role */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Nafasi ya Kazi (Select Role)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#D6145A] transition-colors"
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

                {/* Username Input */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Jina la Mtumiaji (Username)
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-3 pl-11 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#D6145A]/20 focus:border-[#D6145A] transition-all"
                      placeholder="Mano: admin au daktari"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Neno la Siri (Password)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-[11px] text-[#D6145A] hover:underline font-bold"
                    >
                      Umesahau Nywila?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 pl-11 pr-11 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#D6145A]/20 focus:border-[#D6145A] transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Attempts */}
                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-200 text-[#D6145A] focus:ring-[#D6145A] cursor-pointer accent-[#D6145A]"
                    />
                    <span className="text-[11px] font-bold text-slate-500">Nikumbuke (Remember Me)</span>
                  </label>
                  <span className="text-[11px] font-extrabold text-slate-400">Jaribio: {initialAttempts}/5</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || biometricScanning || initialAttempts >= 5}
                  className="w-full p-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Inafungua Mfumo...</span>
                    </>
                  ) : (
                    <span>Fungua Mfumo Salama (Secure Login)</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Rejesha Neno la Siri</h3>
                <p className="text-xs text-slate-500 text-center mb-2">
                  Weka barua pepe yako uliyosajiliwa. Tutatuma kiunganishi cha dharura.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                    Barua Pepe (Email)
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#D6145A]/20"
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
                    className="w-1/2 p-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50"
                  >
                    Rudi Nyuma
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-1/2 p-2.5 bg-[#D6145A] text-white text-xs font-bold rounded-xl hover:bg-[#b00f48]"
                  >
                    {loading ? "Inatuma..." : "Tuma Ombi"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center flex justify-between items-center">
            <span className="text-[9px] text-slate-400 font-bold font-mono">
              IP: 192.168.1.102 • Device Node Secured
            </span>
            <span className="text-[9px] text-slate-400 font-bold font-mono">
              SSL/TLS Active
            </span>
          </div>
        </div>

        {/* Right Section: Interactive Biometric Fingerprint Login Hub (5 columns) */}
        <div className="md:col-span-5 bg-slate-50 border-l border-slate-100 p-8 flex flex-col justify-between items-center text-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(#D6145A_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />

          <div className="w-full">
            <div className="flex justify-center mb-1">
              <span className="bg-[#D6145A]/10 text-[#D6145A] text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Authorized Biometric node
              </span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-1">KUINGIA KWA ALAMA YA KIDOLE</h4>
            <p className="text-[11px] text-slate-500 font-medium max-w-[220px] mx-auto leading-relaxed">
              Kuhakikisha ni mfanyakazi halali pekee wa ofisini anayeruhusiwa kuingia.
            </p>
          </div>

          {/* Interactive Staff selector specifically answering "mbona inajisajili yenyewe nikiweka kidole chochote" */}
          <div className="w-full mt-4 space-y-3 z-10">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 text-left">
                Chagua Mfanyakazi wa Ofisi
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => {
                  setSelectedStaffId(e.target.value);
                  setBiometricError("");
                  setScanSuccess(false);
                  setBiometricStatus("");
                }}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#D6145A] transition-colors shadow-sm"
              >
                <option value="">-- Chagua Mfanyakazi --</option>
                {AUTHORIZED_STAFF.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    🔑 {staff.name} ({staff.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Micro Badge for selected user */}
            {selectedStaffId && (
              <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl flex items-center justify-between text-left">
                <div>
                  <p className="text-[10px] font-extrabold text-emerald-800">Mtumiaji Aliyesajiliwa</p>
                  <p className="text-[9px] font-semibold text-emerald-600">Alama ya Kidole: {AUTHORIZED_STAFF.find(s => s.id === selectedStaffId)?.bioId}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-2" />
              </div>
            )}
          </div>

          {/* Biometric fingerprint scanner box styled matching the request in D6145A */}
          <div className="my-5 relative flex flex-col items-center">
            
            {/* Fingerprint Squircle Button */}
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={loading || biometricScanning}
              className={`w-36 h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 relative group cursor-pointer ${
                biometricScanning 
                  ? "bg-[#D6145A] shadow-[0_20px_50px_rgba(214,20,90,0.4)] scale-95" 
                  : scanSuccess 
                  ? "bg-emerald-500 shadow-[0_20px_50px_rgba(16,185,129,0.3)] scale-100"
                  : "bg-[#D6145A] hover:bg-[#b00f48] shadow-[0_15px_35px_rgba(214,20,90,0.25)] hover:shadow-[0_20px_45px_rgba(214,20,90,0.35)] hover:-translate-y-1 active:scale-95"
              }`}
            >
              {/* Scan sweep line */}
              {biometricScanning && (
                <>
                  <span className="absolute inset-0 rounded-3xl border-2 border-white/40 animate-ping" />
                  <span className="absolute inset-2 rounded-2xl border border-white/20 animate-pulse" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/80 shadow-[0_0_10px_#fff] animate-[bounce_1.5s_infinite]" />
                </>
              )}

              {/* White Fingerprint Icon */}
              <Fingerprint className={`w-16 h-16 text-white transition-transform duration-300 ${
                biometricScanning ? "scale-90 animate-pulse" : "group-hover:scale-110"
              }`} />
            </button>

            <span className="text-[10px] font-black text-slate-600 mt-3 tracking-wider uppercase select-none">
              with fingerprint
            </span>

            {/* Scanner status light */}
            <div className="flex items-center gap-2 mt-3 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${
                biometricScanning 
                  ? "bg-amber-400 animate-ping" 
                  : scanSuccess
                  ? "bg-emerald-500"
                  : "bg-[#D6145A]"
              }`} />
              <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">
                {biometricScanning ? "SCANNING..." : scanSuccess ? "PASSED!" : "READY"}
              </span>
            </div>
          </div>

          {/* Status Display Area */}
          <div className="w-full px-4 min-h-[50px] flex items-center justify-center">
            {biometricError ? (
              <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                <p className="text-[10px] font-bold text-[#D6145A] leading-tight">
                  ⚠️ {biometricError}
                </p>
              </div>
            ) : biometricStatus ? (
              <div className="bg-slate-100 px-3 py-2 rounded-xl">
                <p className="text-[10px] font-extrabold text-slate-700 leading-snug animate-pulse">
                  {biometricStatus}
                </p>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 font-bold max-w-[180px] leading-relaxed">
                Chagua mfanyakazi kwanza, kisha gusa au ushikilie kitufe cha biometric cha rangi ya <span className="text-[#D6145A]">#D6145A</span> ili kutekeleza uhakiki wa alama ya kidole chako.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
