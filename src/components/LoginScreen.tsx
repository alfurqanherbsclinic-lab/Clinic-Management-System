import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  User,
  Fingerprint,
  QrCode,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Smartphone,
  Hospital,
  UserPlus,
  Phone,
  Building2,
  CheckCircle2,
  Scan,
  RefreshCw,
  Sparkles
} from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (user: { name: string; role: string; bioId: string }) => void;
  initialAttempts: number;
  onIncrementAttempts: () => void;
}

const PREREGISTERED_STAFF = [
  { id: "khalifa", name: "Dkt. Abdukhalifa M. Ally", username: "dktkhalifa", role: "Super Admin / Daktari Mkuu", roleDisplay: "Daktari Mkuu (Chief Doctor)", bioId: "TZ-BIO-8839-KHL", fingerCode: "fingerprint_thumb_khalifa" },
  { id: "asha", name: "Sr. Asha Juma", username: "srasha", role: "Nurse", roleDisplay: "Muuguzi Mkuu (Senior Nurse)", bioId: "NR-1029-ASH", fingerCode: "fingerprint_index_asha" },
  { id: "fatma", name: "Fatma Ali", username: "famasia", role: "Pharmacist", roleDisplay: "Mfamasia (Pharmacist)", bioId: "FP-3389-FAT", fingerCode: "fingerprint_middle_fatma" }
];

function LoginScreen({ onLoginSuccess, initialAttempts, onIncrementAttempts }: LoginScreenProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Auth Methods: "password" | "biometric" | "qr" | "otp"
  const [authMethod, setAuthMethod] = useState<"password" | "biometric" | "qr" | "otp">("password");

  // Login form states
  const [username, setUsername] = useState("dktkhalifa");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Biometric scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [biometricType, setBiometricType] = useState<"fingerprint" | "face">("fingerprint");

  // OTP state
  const [phoneForOtp, setPhoneForOtp] = useState("0712345678");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpCountdown, setOtpCountdown] = useState(60);

  // Registration states
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState("Doctor");
  const [regFacility, setRegFacility] = useState("Kituo cha Afya Mwananyamala");
  const [regLicense, setRegLicense] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // Password submission logic
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const matched = PREREGISTERED_STAFF.find(
      (s) => s.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (matched && password === "123456") {
      onLoginSuccess({
        name: matched.name,
        role: matched.role,
        bioId: matched.bioId
      });
    } else {
      onIncrementAttempts();
      setErrorMessage("Jina la mtumiaji au nenosiri si sahihi! (Jaribu tena au tumia 123456)");
    }
  };

  // Biometric login trigger
  const triggerBiometricScan = (staffMember = PREREGISTERED_STAFF[0]) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanSuccess(false);
    setErrorMessage("");

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setScanProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setScanSuccess(true);

        setTimeout(() => {
          onLoginSuccess({
            name: staffMember.name,
            role: staffMember.role,
            bioId: staffMember.bioId
          });
        }, 800);
      }
    }, 300);
  };

  // Trigger QR Code scan simulation
  const handleQrScanSimulation = () => {
    setIsScanning(true);
    setErrorMessage("");
    setTimeout(() => {
      setIsScanning(false);
      onLoginSuccess({
        name: PREREGISTERED_STAFF[0].name,
        role: PREREGISTERED_STAFF[0].role,
        bioId: PREREGISTERED_STAFF[0].bioId
      });
    }, 1500);
  };

  // OTP Request
  const handleSendOtp = () => {
    if (!phoneForOtp || phoneForOtp.length < 9) {
      setErrorMessage("Tafadhali ingiza namba halali ya simu!");
      return;
    }
    setOtpSent(true);
    setErrorMessage("");
    // Start countdown
    setOtpCountdown(60);
  };

  // OTP Verification
  const handleVerifyOtp = () => {
    const code = otpCode.join("");
    if (code.length === 6) {
      onLoginSuccess({
        name: PREREGISTERED_STAFF[0].name,
        role: PREREGISTERED_STAFF[0].role,
        bioId: PREREGISTERED_STAFF[0].bioId
      });
    } else {
      setErrorMessage("Siri ya OTP si sahihi. Ingiza tarakimu 6!");
    }
  };

  // Registration handler
  const handleRegisterStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regPhone || !regLicense) {
      setErrorMessage("Tafadhali jaza taarifa zote muhimu!");
      return;
    }
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setActiveTab("login");
      setAuthMethod("password");
      setUsername(regFullName.toLowerCase().replace(/\s+/g, ""));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
            <Hospital className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              AfyaMed Portal <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">v3.4 Secure</span>
            </h1>
            <p className="text-xs text-slate-400">Mfumo wa Kitaalamu wa Usimamizi wa Afya na Magonjwa Sugu</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> End-to-End Encrypted
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-4">
        <div className="w-full max-w-xl bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">

          {/* Navigation Bar inside Card */}
          <div className="flex border-b border-slate-700/80 bg-slate-900/50 p-1.5">
            <button
              onClick={() => { setActiveTab("login"); setErrorMessage(""); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === "login"
                  ? "bg-emerald-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Lock className="w-4 h-4" /> Ingia Kwenye Mfumo (Login)
            </button>
            <button
              onClick={() => { setActiveTab("register"); setErrorMessage(""); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === "register"
                  ? "bg-emerald-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <UserPlus className="w-4 h-4" /> Sajili Mtoa Huduma Mpya
            </button>
          </div>

          {/* Alert / Error Display */}
          {errorMessage && (
            <div className="m-4 mb-0 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === "login" ? (
            <div className="p-6 space-y-6">

              {/* Sub Authentication Method Selector */}
              <div className="grid grid-cols-4 gap-2 p-1 bg-slate-900/60 rounded-xl border border-slate-700/50 text-xs">
                <button
                  type="button"
                  onClick={() => { setAuthMethod("password"); setErrorMessage(""); }}
                  className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 font-medium transition ${
                    authMethod === "password" ? "bg-slate-700 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Nenosiri</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMethod("biometric"); setErrorMessage(""); }}
                  className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 font-medium transition ${
                    authMethod === "biometric" ? "bg-slate-700 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Biometric</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMethod("qr"); setErrorMessage(""); }}
                  className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 font-medium transition ${
                    authMethod === "qr" ? "bg-slate-700 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Kadi QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMethod("otp"); setErrorMessage(""); }}
                  className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 font-medium transition ${
                    authMethod === "otp" ? "bg-slate-700 text-emerald-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>SMS OTP</span>
                </button>
              </div>

              {/* 1. PASSWORD LOGIN FORM */}
              {authMethod === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Jina la Mtumiaji (Username)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ingiza mf. dktkhalifa"
                        required
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Nenosiri (Password)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-11 pr-11 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Nisahau kwenye kifaa hiki</span>
                    </label>
                    <span className="text-emerald-400 hover:underline cursor-pointer">
                      Umesehau nenosiri?
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" /> INGIA KWENYE MFUMO
                  </button>

                  {/* Pre-configured Demo Accounts Helper */}
                  <div className="mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700/60 text-xs">
                    <p className="text-slate-400 font-semibold mb-2 flex items-center justify-between">
                      <span>Akaunti Zilizosajiliwa (Demo Quick Click):</span>
                      <span className="text-emerald-400">Nenosiri: 123456</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {PREREGISTERED_STAFF.map((staff) => (
                        <button
                          key={staff.id}
                          type="button"
                          onClick={() => {
                            setUsername(staff.username);
                            setPassword("123456");
                          }}
                          className="p-2 bg-slate-800 hover:bg-slate-700/80 rounded-lg text-left border border-slate-700 transition"
                        >
                          <div className="font-semibold text-emerald-300 truncate">{staff.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{staff.roleDisplay}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              )}

              {/* 2. BIOMETRIC LOGIN */}
              {authMethod === "biometric" && (
                <div className="py-4 text-center space-y-5">
                  <div className="flex justify-center gap-3 mb-2">
                    <button
                      onClick={() => setBiometricType("fingerprint")}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                        biometricType === "fingerprint"
                          ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Fingerprint className="w-3.5 h-3.5" /> Alama ya Kidole (Fingerprint)
                    </button>
                    <button
                      onClick={() => setBiometricType("face")}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                        biometricType === "face"
                          ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Scan className="w-3.5 h-3.5" /> Sura (Face ID)
                    </button>
                  </div>

                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    <div
                      className={`absolute inset-0 rounded-full border-2 ${
                        isScanning
                          ? "border-emerald-500 animate-ping opacity-30"
                          : scanSuccess
                          ? "border-emerald-400"
                          : "border-slate-700"
                      }`}
                    />
                    <button
                      onClick={() => triggerBiometricScan()}
                      disabled={isScanning}
                      className={`w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition transform active:scale-95 ${
                        scanSuccess
                          ? "bg-emerald-500 text-slate-950"
                          : isScanning
                          ? "bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400"
                          : "bg-slate-900 border-2 border-slate-700 hover:border-emerald-500 text-emerald-400"
                      }`}
                    >
                      {scanSuccess ? (
                        <CheckCircle2 className="w-12 h-12" />
                      ) : biometricType === "fingerprint" ? (
                        <Fingerprint className="w-12 h-12" />
                      ) : (
                        <Scan className="w-12 h-12" />
                      )}
                    </button>
                  </div>

                  {isScanning ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-emerald-400 animate-pulse">
                        Inasoma Alama ya Biometri... {scanProgress}%
                      </p>
                      <div className="w-48 h-1.5 bg-slate-900 rounded-full mx-auto overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : scanSuccess ? (
                    <p className="text-sm font-bold text-emerald-400">
                      Uhakiki umefanikiwa! Kuingia kwenye mfumo...
                    </p>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Weka kidole chako kwenye kisoma alama au bofya kitufe
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Scanner ya kibaiometria imeunganishwa (Biometric Device: Active)
                      </p>
                    </div>
                  )}

                  {/* Select staff member for biometric fast test */}
                  <div className="pt-2 border-t border-slate-700/60 text-left">
                    <p className="text-xs text-slate-400 mb-2">Chagua staff wa kujaribu biometri:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {PREREGISTERED_STAFF.map((staff) => (
                        <button
                          key={staff.id}
                          onClick={() => triggerBiometricScan(staff)}
                          disabled={isScanning}
                          className="p-2 bg-slate-900/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-left text-xs transition"
                        >
                          <div className="font-semibold text-white truncate">{staff.name}</div>
                          <div className="text-[10px] text-emerald-400">{staff.bioId}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. QR CARD SCAN LOGIN */}
              {authMethod === "qr" && (
                <div className="py-4 text-center space-y-4">
                  <div className="w-48 h-48 mx-auto bg-slate-900 border-2 border-dashed border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden group">
                    <QrCode className="w-20 h-20 text-emerald-400 mb-2" />
                    <p className="text-xs text-slate-400">Weka Kadi ya Mfanyakazi au Scan QR</p>
                    {isScanning && (
                      <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-lg shadow-emerald-400 animate-bounce top-1/2" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleQrScanSimulation}
                    disabled={isScanning}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
                  >
                    {isScanning ? "Inasoma Kadi..." : "Simulate QR Scan (Soma Kadi)"}
                  </button>
                </div>
              )}

              {/* 4. SMS OTP LOGIN */}
              {authMethod === "otp" && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                          Namba ya Simu Iliyosajiliwa
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            value={phoneForOtp}
                            onChange={(e) => setPhoneForOtp(e.target.value)}
                            placeholder="07XX XXX XXX"
                            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        <Smartphone className="w-4 h-4" /> TUMA MTIMBO WA OTP KWA SMS
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center">
                      <p className="text-xs text-slate-300">
                        Tumetuma tarakimu 6 za siri kwenda namba <span className="text-emerald-400 font-bold">{phoneForOtp}</span>
                      </p>

                      <div className="flex justify-center gap-2 my-2">
                        {otpCode.map((digit, idx) => (
                          <input
                            key={idx}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newArr = [...otpCode];
                              newArr[idx] = val;
                              setOtpCode(newArr);
                            }}
                            className="w-10 h-12 bg-slate-900 border border-slate-700 rounded-lg text-center text-lg font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
                      >
                        THIBITISHA NA INGIA
                      </button>

                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-xs text-slate-400 hover:text-slate-200"
                      >
                        Badilisha Namba ya Simu
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            /* NEW STAFF REGISTRATION FORM */
            <form onSubmit={handleRegisterStaff} className="p-6 space-y-4">
              {regSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                  <h3 className="text-lg font-bold text-white">Usajili Umefanikiwa!</h3>
                  <p className="text-xs text-slate-300">Taarifa zako zimehifadhiwa kwenye kanzidata ya hospitali.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Jina Kamili la Mtoa Huduma
                    </label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="mf. Dr. Hamisi Bakari"
                      required
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Cheo / Wadhifa (Role)
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Doctor">Daktari (Doctor)</option>
                        <option value="Nurse">Muuguzi (Nurse)</option>
                        <option value="Pharmacist">Mfamasia (Pharmacist)</option>
                        <option value="Lab Tech">Mtaalamu wa Maabara</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Namba ya Simu
                      </label>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="07XX XXX XXX"
                        required
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kituo cha Afya / Hospitali
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={regFacility}
                        onChange={(e) => setRegFacility(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Namba ya Leseni ya Udaktari / Kazi
                    </label>
                    <input
                      type="text"
                      value={regLicense}
                      onChange={(e) => setRegLicense(e.target.value)}
                      placeholder="MCT-88942-TZ"
                      required
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
                  >
                    <UserPlus className="w-4 h-4" /> KUSILISHA USAJILI
                  </button>
                </>
              )}
            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-900/50">
        AfyaMed Health Information System &copy; {new Date().getFullYear()} — Mfumo Rasmi wa Wizara ya Afya na Hospitali
      </footer>
    </div>
  );
}

export { LoginScreen };
export default LoginScreen;
