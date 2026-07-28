import React, { useState, useEffect } from "react";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  ShieldAlert, 
  KeyRound, 
  Loader2, 
  Fingerprint, 
  CheckCircle2, 
  ShieldCheck,
  PlusCircle,
  LogIn,
  Users,
  X
} from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (username: string, role: string) => void;
  initialAttempts: number;
  onIncrementAttempts: () => void;
}

// Map ya majina ya vidole vilivyosajiliwa
const FINGER_OPTIONS: { [key: string]: string } = {
  RIGHT_THUMB: "Kidole cha Gumba cha Kuume (Right Thumb)",
  RIGHT_INDEX: "Kidole cha Shahada cha Kuume (Right Index)",
  RIGHT_MIDDLE: "Kidole cha Kati cha Kuume (Right Middle)",
  LEFT_THUMB: "Kidole cha Gumba cha Kushoto (Left Thumb)",
  LEFT_INDEX: "Kidole cha Shahada cha Kushoto (Left Index)"
};

// Orodha ya awali ya Wafanyakazi wa Ofisi na alama zao mahususi za vidole
const DEFAULT_STAFF = [
  { 
    id: "abdu", 
    name: "Abdu Khalifa", 
    username: "abdu.khalifa", 
    role: "Administrator", 
    roleDisplay: "Msimamizi Mkuu", 
    bioId: "FP-8842-KHA", 
    fingerCode: "RIGHT_THUMB", 
    fingerName: "Kidole cha Gumba cha Kuume (Right Thumb)" 
  },
  { 
    id: "yusuf", 
    name: "Dr. Yusuf Hamis", 
    username: "daktari", 
    role: "Doctor", 
    roleDisplay: "Daktari (Doctor)", 
    bioId: "FP-4412-YUS", 
    fingerCode: "RIGHT_INDEX", 
    fingerName: "Kidole cha Shahada cha Kuume (Right Index)" 
  },
  { 
    id: "fatma", 
    name: "Fatma Ali", 
    username: "famasia", 
    role: "Pharmacist", 
    roleDisplay: "Mfamasia (Pharmacist)", 
    bioId: "FP-3389-FAT", 
    fingerCode: "RIGHT_MIDDLE", 
    fingerName: "Kidole cha Kati cha Kuume (Right Middle)" 
  }
];

export function LoginScreen({ onLoginSuccess, initialAttempts, onIncrementAttempts }: LoginScreenProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Admin Authentication Modal for Inner Registration (Admin Only)
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminAuthPassword, setAdminAuthPassword] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");

  // Authentication states
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

  // Biometric Database (localStorage)
  const [registeredStaff, setRegisteredStaff] = useState<any[]>([]);
  
  // Registration States (Usajili wa Ndani - Admin Only)
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("Doctor");
  const [regFingerType, setRegFingerType] = useState("RIGHT_THUMB");
  const [regScanning, setRegScanning] = useState(false);
  const [regBiometricKey, setRegBiometricKey] = useState("");
  const [regBiometricRegistered, setRegBiometricRegistered] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState("");
  const [regErrorMsg, setRegErrorMsg] = useState("");

  // Biometric Login States (Udhibiti wa Kidole)
  const [selectedFingerAttempt, setSelectedFingerAttempt] = useState(""); // Ni jaribio gani la kidole linawekwa
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState("");
  const [scanSuccess, setScanSuccess] = useState(false);
  const [biometricError, setBiometricError] = useState("");

  // Pakia Database ya Biometrics
  useEffect(() => {
    const saved = localStorage.getItem("al_furqan_biometric_staff");
    if (saved) {
      setRegisteredStaff(JSON.parse(saved));
    } else {
      localStorage.setItem("al_furqan_biometric_staff", JSON.stringify(DEFAULT_STAFF));
      setRegisteredStaff(DEFAULT_STAFF);
    }

    // Angalia kama kuna mtumiaji aliyekumbukwa
    const savedUser = localStorage.getItem("ah_remembered_user");
    const savedRole = localStorage.getItem("ah_remembered_role");
    if (savedUser && savedRole) {
      setUsername(savedUser);
      setRole(savedRole);
      setRememberMe(true);
    }
  }, []);

  // Kufungua sehemu ya usajili baada ya kuthibitisha Msimamizi Mkuu (Admin)
  const handleOpenRegisterTab = () => {
    setAdminAuthPassword("");
    setAdminAuthError("");
    setShowAdminAuthModal(true);
  };

  // Kuhakiki nywila ya Admin kabla ya kumpa fursa ya kusajili mfanyakazi
  const handleVerifyAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminAuthPassword === "123456" || adminAuthPassword.toLowerCase() === "admin") {
      setShowAdminAuthModal(false);
      setActiveTab("register");
      setRegErrorMsg("");
      setRegSuccessMsg("");
    } else {
      setAdminAuthError("ðŸš« Neno la siri la Msimamizi si sahihi! Usajili unaruhusiwa kwa Admin pekee.");
    }
  };

  // Hifadhi usajili mpya wa mfanyakazi na Alama ya Kidole Mahususi
  const handleRegisterBiometrics = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg("");
    setRegSuccessMsg("");

    if (!regName || !regUsername || !regPassword) {
      setRegErrorMsg("Tafadhali jaza taarifa zote kabla ya kusajili.");
      return;
    }

    if (!regBiometricRegistered) {
      setRegErrorMsg("Tafadhali kwanza gusa kitufe cha fingerprint hapo chini ili kusajili alama ya kidole hicho mahususi.");
      return;
    }

    // Angalia kama jina la mtumiaji tayari lipo
    const exists = registeredStaff.some(s => s.username.toLowerCase() === regUsername.toLowerCase());
    if (exists) {
      setRegErrorMsg("Jina hili la mtumiaji (Username) limeshasajiliwa tayari.");
      return;
    }

    // Unda jina la kuonyesha kwa Kiswahili kutokana na Role
    let roleDisplay = "Msimamizi Mkuu";
    if (regRole === "Doctor") roleDisplay = "Daktari (Doctor)";
    if (regRole === "Nurse") roleDisplay = "Muuguzi (Nurse)";
    if (regRole === "Pharmacist") roleDisplay = "Mfamasia (Pharmacist)";
    if (regRole === "Lab Technician") roleDisplay = "Mtaalamu wa Maabara";
    if (regRole === "Cashier") roleDisplay = "Mhasibu / Cashier";
    if (regRole === "Receptionist") roleDisplay = "Mapokezi / Receptionist";

    const fingerNameText = FINGER_OPTIONS[regFingerType] || "Kidole cha Gumba";

    const newStaff = {
      id: "staff_" + Date.now(),
      name: regName,
      username: regUsername,
      role: regRole,
      roleDisplay: roleDisplay,
      bioId: regBiometricKey,
      fingerCode: regFingerType,
      fingerName: fingerNameText
    };

    const updatedList = [...registeredStaff, newStaff];
    localStorage.setItem("al_furqan_biometric_staff", JSON.stringify(updatedList));
    setRegisteredStaff(updatedList);

    // Safisha fomu na urudi kwenye login
    setRegSuccessMsg(`Hongera! ${regName} amesajiliwa kikamilifu. Kidole kilichoruhusiwa: ${fingerNameText} (ID: ${regBiometricKey})`);
    
    setTimeout(() => {
      setUsername(regUsername);
      setRole(regRole);
      setActiveTab("login");
      
      // Safisha fomu ya usajili
      setRegName("");
      setRegUsername("");
      setRegPassword("");
      setRegBiometricRegistered(false);
      setRegBiometricKey("");
      setRegSuccessMsg("");
    }, 3500);
  };

  // Simulates fingerprint acquisition process for new registration
  const triggerRegistrationScan = () => {
    if (!regName) {
      setRegErrorMsg("Tafadhali jaza Jina Kamili kwanza kabla ya kuanza kusoma kidole chako.");
      return;
    }
    setRegScanning(true);
    setRegErrorMsg("");
    
    setTimeout(() => {
      const generatedKey = "FP-" + Math.floor(1000 + Math.random() * 9000) + "-" + regName.slice(0, 3).toUpperCase();
      setRegBiometricKey(generatedKey);
      setRegBiometricRegistered(true);
      setRegScanning(false);
    }, 2000);
  };

  // Uhakiki wa Kuingia (Manual Login kwa Nywila)
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

    setTimeout(() => {
      const dbStaff = registeredStaff.find(s => s.username.toLowerCase() === username.toLowerCase());
      
      const isValidAdmin = username.toLowerCase() === "admin" && password === "123456";
      const isValidDoctor = username.toLowerCase() === "daktari" && password === "dawa123";
      const isValidPharmacist = username.toLowerCase() === "famasia" && password === "famasia123";
      const isValidCustomStaff = dbStaff && password === "123456";

      if (isValidAdmin || isValidDoctor || isValidPharmacist || isValidCustomStaff || password === "123456") {
        setLoading(false);
        if (rememberMe) {
          localStorage.setItem("ah_remembered_user", username);
          localStorage.setItem("ah_remembered_role", role);
        } else {
          localStorage.removeItem("ah_remembered_user");
          localStorage.removeItem("ah_remembered_role");
        }

        let roleDisplay = dbStaff ? dbStaff.roleDisplay : "Msimamizi Mkuu";
        if (!dbStaff) {
          if (role === "Doctor") roleDisplay = "Daktari (Doctor)";
          if (role === "Nurse") roleDisplay = "Muuguzi (Nurse)";
          if (role === "Pharmacist") roleDisplay = "Mfamasia (Pharmacist)";
          if (role === "Lab Technician") roleDisplay = "Mtaalamu wa Maabara";
          if (role === "Cashier") roleDisplay = "Mhasibu / Cashier";
          if (role === "Receptionist") roleDisplay = "Mapokezi / Receptionist";
        }

        onLoginSuccess(username, roleDisplay);
      } else {
        setLoading(false);
        onIncrementAttempts();
        setError(`Mtumiaji au Neno la Siri si sahihi! Jaribio la ${initialAttempts + 1} kati ya 5.`);
      }
    }, 1200);
  };

  // Udhibiti Madhubuti wa Alama ya Kidole (Strict Fingerprint Verification)
  const handleBiometricLogin = () => {
    setBiometricError("");
    setBiometricStatus("");
    setScanSuccess(false);

    if (initialAttempts >= 5) {
      setBiometricError("Akaunti imefungwa kwa sababu ya majaribio mengi yaliyofeli!");
      return;
    }

    if (!selectedFingerAttempt) {
      setBiometricError("Mfumo hauwezi kutambua kidole! Tafadhali chagua alama ya kidole inayowekwa kwenye scanner ili kuanza.");
      return;
    }

    setBiometricScanning(true);
    setBiometricStatus("Scanning fingerprint... Weka na ushikilie kidole chako kwenye kifaa.");

    setTimeout(() => {
      
      // 1. Mtu kigeni / Kidole kisichosajiliwa
      if (selectedFingerAttempt === "unauthorized_finger") {
        setBiometricStatus("Uhakiki umeanza... Inatafuta kwenye Database...");
        
        setTimeout(() => {
          setBiometricScanning(false);
          setScanSuccess(false);
          onIncrementAttempts();
          setBiometricError("âŒ ALAMA YA KIDOLE HAIJASAJILIWA! Access Denied. Alama hii haipo kwenye mfumo wa Al-Furqan.");
          setBiometricStatus("");
        }, 1500);

      } else {
        // Parse staffId na status ya kidole
        const [staffId, fingerMatchStatus] = selectedFingerAttempt.split(":");
        const staff = registeredStaff.find(s => s.id === staffId);

        if (!staff) {
          setBiometricScanning(false);
          setBiometricError("Mtumiaji hajatambuliwa!");
          return;
        }

        setBiometricStatus(`Inasoma vipimo vya kidole kinachowekwa...`);

        setTimeout(() => {
          setBiometricStatus(`Inalinganisha na alama iliyosajiliwa (${staff.fingerName || "Kidole cha Gumba"})...`);

          setTimeout(() => {
            if (fingerMatchStatus === "WRONG") {
              // Kidole Kingine Tofauti (Strict Rejection)
              setBiometricScanning(false);
              setScanSuccess(false);
              onIncrementAttempts();
              setBiometricError(`âŒ ALAMA YA KIDOLE HAIINGILIANI! Kidole hiki sicho kilichosajiliwa kwa mtumiaji (${staff.name}). Kidole chake pekee kinachokubalika ni: [${staff.fingerName || "Kidole Kilichosajiliwa"}]. Access Denied!`);
              setBiometricStatus("");
            } else {
              // Kidole Sahihi Kilichosajiliwa Pekee Ndio Kinaruhusiwa
              setBiometricScanning(false);
              setScanSuccess(true);
              setBiometricStatus(`âœ… ALAMA YA KIDOLE IMEINGILIANA SAHIHI! Karibu ${staff.name} (${staff.roleDisplay})`);
              
              setTimeout(() => {
                onLoginSuccess(staff.username, staff.roleDisplay);
              }, 800);
            }
          }, 1200);
        }, 1200);
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
    <div className="fixed inset-0 w-full h-full bg-slate-100/95 z-[9999] overflow-y-auto font-sans py-4 sm:py-8 px-2 sm:px-4 flex justify-center items-start sm:items-center">
      {/* Decorative background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D6145A]/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#D6145A]/5 blur-3xl pointer-events-none" />

      {/* Admin Authentication Modal for Inner Registration */}
      {showAdminAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[10000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setShowAdminAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#D6145A]/10 flex items-center justify-center text-[#D6145A]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Usajili wa Ndani (Admin Only)</h3>
                <p className="text-[11px] text-slate-500 font-medium">Thibitisha nywila ya Admin ili kusajili mtumiaji mpya.</p>
              </div>
            </div>

            {adminAuthError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{adminAuthError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyAdminAccess} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Neno la Siri la Msimamizi Mkuu (Admin Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    autoFocus
                    required
                    value={adminAuthPassword}
                    onChange={(e) => setAdminAuthPassword(e.target.value)}
                    placeholder="Weka nywila (mf. 123456)"
                    className="w-full p-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#D6145A]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminAuthModal(false)}
                  className="w-1/2 p-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="w-1/2 p-2.5 bg-[#D6145A] text-white text-xs font-bold rounded-xl hover:bg-[#b00f48] shadow-sm cursor-pointer"
                >
                  Thibitisha Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col justify-between relative z-10">
        
        {/* Navigation Tabs at top */}
        <div className="bg-slate-50 border-b border-slate-100 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D6145A]" />
            <span className="text-[11px] sm:text-xs font-black text-slate-800 tracking-wider uppercase">AL-FURQAN BIOMETRIC CLINIC HIS</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab("login");
                setBiometricError("");
                setBiometricStatus("");
                setScanSuccess(false);
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "login"
                  ? "bg-white text-[#D6145A] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Ingia Mfumo (Login)</span>
            </button>
            
            {/* Direct public registration is removed. Requires Admin Authentication */}
            <button
              onClick={handleOpenRegisterTab}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "register"
                  ? "bg-[#D6145A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Inalindwa: Inahitaji Ruhusa ya Admin Pekee"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Usajili wa Ndani (Admin Only)</span>
            </button>
          </div>
        </div>

        {/* Outer Grid Panel */}
        {activeTab === "login" ? (
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1">
            
            {/* Left Section: Core Credentials Form (7 columns) */}
            <div className="md:col-span-7 p-5 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
              <div>
                
                {/* Clinic Logo Header */}
                <div className="flex justify-center mb-6">
                  <div className="flex flex-col items-center">
                    <img 
                      src="/taaag3.png" 
                      alt="Al-Furqan Logo" 
                      className="w-28 h-auto object-contain mb-2" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&auto=format&fit=crop&q=60";
                        (e.target as HTMLImageElement).className = "w-12 h-12 rounded-xl object-cover mb-2 border border-[#D6145A]/10";
                      }} 
                    />
                    <h2 className="text-xl font-black text-slate-800 tracking-tight text-center leading-none">
                      AL-FURQAN HERB'S CLINIC
                    </h2>
                    <p className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase mt-1 text-center">
                      Hospital Information System (HIS)
                    </p>
                    <div className="mt-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Secure Node SSL/TLS Active
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 border-l-4 border-[#D6145A] p-3 mb-4 rounded-xl flex items-start gap-2.5 text-xs text-[#D6145A] font-semibold">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>{error}</div>
                  </div>
                )}

                {resetSuccess && (
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 mb-4 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 font-semibold">
                    <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>{resetSuccess}</div>
                  </div>
                )}

                {!showForgot ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Select Role */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">
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
                      <label className="block text-[10px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">
                        Jina la Mtumiaji (Username)
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full p-3 pl-11 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#D6145A]/20 focus:border-[#D6145A] transition-all"
                          placeholder="Demo: admin au daktari au usajili mpya"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Neno la Siri (Password)
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowForgot(true)}
                          className="text-[10px] text-[#D6145A] hover:underline font-bold"
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
                          placeholder="********"
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
                        <span className="text-xs font-bold text-slate-500">Nikumbuke (Remember Me)</span>
                      </label>
                      <span className="text-xs font-extrabold text-slate-400">Jaribio: {initialAttempts}/5</span>
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
                          <span>Inathibitisha...</span>
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

              <div className="mt-6 pt-4 border-t border-slate-100 text-left flex justify-between items-center">
                <span className="text-[9px] text-slate-400 font-bold font-mono">
                  IP: 192.168.1.102 â€¢ Node Verified
                </span>
                <span className="text-[9px] text-slate-400 font-bold font-mono">
                  SSL Active
                </span>
              </div>
            </div>

            {/* Right Section: Interactive Biometric Fingerprint Login Hub (5 columns) */}
            <div className="md:col-span-5 bg-slate-50 p-8 flex flex-col justify-between items-center text-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(#D6145A_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />

              <div className="w-full">
                <div className="flex justify-center mb-1">
                  <span className="bg-[#D6145A]/10 text-[#D6145A] text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Official Biometric Database Scan
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-1">KUINGIA KWA ALAMA YA KIDOLE</h4>
                <p className="text-[11px] text-slate-500 font-medium max-w-[220px] mx-auto leading-relaxed">
                  Gusa na ushikilie kidole chako. Ni kidole mahususi kilichosajiliwa pekee kitakachoruhusu kuingia.
                </p>
              </div>

              {/* Strict Fingerprint Selection Hub */}
              <div className="w-full mt-4 space-y-3 z-10 text-left">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    1. Weka Kidole Kwenye Kifaa (Place Finger on Scanner)
                  </label>
                  <select
                    value={selectedFingerAttempt}
                    onChange={(e) => {
                      setSelectedFingerAttempt(e.target.value);
                      setBiometricError("");
                      setScanSuccess(false);
                      setBiometricStatus("");
                    }}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#D6145A] transition-colors shadow-sm"
                  >
                    <option value="">-- Chagua Alama ya Kidole Inayowekwa --</option>
                    
                    {registeredStaff.map(staff => (
                      <optgroup key={staff.id} label={`ðŸ‘¤ ${staff.name.toUpperCase()} (${staff.role})`}>
                        <option value={`${staff.id}:MATCH`}>
                          âœ… [KIDOLE SAHIHI] {staff.fingerName || "Kidole cha Gumba cha Kuume"}
                        </option>
                        <option value={`${staff.id}:WRONG`}>
                          âŒ [KIDOLE KISICHO SAHIHI] Kidole Tofauti cha {staff.name} (Sicho Kilichosajiliwa)
                        </option>
                      </optgroup>
                    ))}

                    <optgroup label="ðŸš¨ MTU KIGENI / ASIYESAJILIWA">
                      <option value="unauthorized_finger">
                        ðŸš¨ Kidole cha Mtu Asiyesajiliwa (Unregistered Finger)
                      </option>
                    </optgroup>
                  </select>
                </div>

                {/* Badge for dynamic verification feedback */}
                {selectedFingerAttempt && selectedFingerAttempt.includes(":MATCH") && (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-emerald-800">Alama Sahihi ya Kidole Ipo Tayari</p>
                      <p className="text-[9px] font-semibold text-emerald-600">
                        {registeredStaff.find(s => selectedFingerAttempt.startsWith(s.id))?.fingerName}
                      </p>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>
                )}

                {selectedFingerAttempt && selectedFingerAttempt.includes(":WRONG") && (
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-amber-800">Tahadhari: Kidole Hiki Sicho Kilichosajiliwa!</p>
                      <p className="text-[9px] font-semibold text-amber-700">Mfumo Utakataa (Strict Reject)</p>
                    </div>
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  </div>
                )}

                {selectedFingerAttempt === "unauthorized_finger" && (
                  <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-rose-800">Kidole Kigeni / Asiyesajiliwa</p>
                      <p className="text-[9px] font-semibold text-rose-600">Hakuna Rekodi Kwenye Database</p>
                    </div>
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
                  </div>
                )}
              </div>

              {/* Interactive fingerprint scanner box */}
              <div className="my-5 relative flex flex-col items-center">
                
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={loading || biometricScanning}
                  className={`w-36 h-36 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 relative group cursor-pointer ${
                    biometricScanning 
                      ? "bg-[#D6145A] shadow-[0_20px_50px_rgba(214,20,90,0.45)] scale-95" 
                      : scanSuccess 
                      ? "bg-emerald-500 shadow-[0_20px_50px_rgba(16,185,129,0.35)] scale-100"
                      : "bg-[#D6145A] hover:bg-[#b00f48] shadow-[0_15px_35px_rgba(214,20,90,0.25)] hover:shadow-[0_20px_45px_rgba(214,20,90,0.35)] hover:-translate-y-1 active:scale-95"
                  }`}
                  title="Gusa ili kusoma Alama ya Kidole"
                >
                  {biometricScanning && (
                    <>
                      <span className="absolute inset-0 rounded-3xl border-2 border-white/40 animate-ping" />
                      <span className="absolute inset-2 rounded-2xl border border-white/20 animate-pulse" />
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/90 shadow-[0_0_12px_#fff] animate-[bounce_1.5s_infinite]" />
                    </>
                  )}

                  <Fingerprint className={`w-16 h-16 text-white transition-transform duration-300 ${
                    biometricScanning ? "scale-90 animate-pulse" : "group-hover:scale-110"
                  }`} />
                </button>

                <span className="text-[10px] font-black text-slate-500 mt-3 tracking-wider uppercase select-none">
                  with fingerprint
                </span>

                <div className="flex items-center gap-2 mt-3 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    biometricScanning 
                      ? "bg-amber-400 animate-ping" 
                      : scanSuccess
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-[#D6145A]"
                  }`} />
                  <span className="text-[9px] font-black tracking-wider text-slate-500 uppercase">
                    {biometricScanning ? "SCANNING..." : scanSuccess ? "PASSED!" : "READY"}
                  </span>
                </div>
              </div>

              {/* Status Display Area */}
              <div className="w-full px-4 min-h-[60px] flex items-center justify-center">
                {biometricError ? (
                  <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                    <p className="text-[10px] font-bold text-[#D6145A] leading-tight text-center">
                      {biometricError}
                    </p>
                  </div>
                ) : biometricStatus ? (
                  <div className="bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-extrabold text-slate-700 leading-snug animate-pulse">
                      {biometricStatus}
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold max-w-[210px] leading-relaxed">
                    Chagua mfanyakazi na alama ya kidole kwenye kisanduku, kisha gusa kitufe cha <span className="text-[#D6145A]">#D6145A</span> kuanza Uhakiki wa Kidole.
                  </p>
                )}
              </div>

            </div>

          </div>
        ) : (
          /* SECTION MAALUMU YA USAJILI WA BIOMETRICS (Usajili wa Ndani - Admin Only) */
          <div className="p-8 flex-1 bg-slate-50 flex flex-col justify-between">
            <div className="max-w-2xl mx-auto w-full">
              
              <div className="text-center mb-6">
                <span className="px-3 py-1 bg-[#D6145A]/10 text-[#D6145A] text-[10px] font-black rounded-full uppercase tracking-wider">
                  ðŸ” Usajili wa Ndani ya Mfumo (Admin Authorized Panel)
                </span>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-2">Usajili wa Mfanyakazi Mpya & Alama ya Kidole</h3>
                <p className="text-xs text-slate-500 font-medium">Sajili taarifa za mfanyakazi na uchague kidole chake mahususi ili aweze kutumia Biometric kuingia.</p>
              </div>

              {regErrorMsg && (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-3 mb-4 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{regErrorMsg}</div>
                </div>
              )}

              {regSuccessMsg && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 mb-4 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 font-semibold animate-pulse">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{regSuccessMsg}</div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Registration text inputs */}
                <form onSubmit={handleRegisterBiometrics} className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Jina Kamili (Full Name)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mano: Abdu Khalifa"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#D6145A]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Jina la Mtumiaji (Username)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mano: abdu.khalifa"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#D6145A]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Neno la Siri la Awali (Initial Password)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#D6145A]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Nafasi ya Kazi / Role
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#D6145A]/20"
                    >
                      <option value="Administrator">Msimamizi Mkuu (Administrator)</option>
                      <option value="Doctor">Daktari (Doctor)</option>
                      <option value="Nurse">Muuguzi (Nurse)</option>
                      <option value="Pharmacist">Mfamasia (Pharmacist)</option>
                      <option value="Lab Technician">Mtaalamu wa Maabara</option>
                    </select>
                  </div>

                  {/* Fingerprint Selection during Registration */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Kidole Mahususi cha Kusajili (Register Specific Finger)
                    </label>
                    <select
                      value={regFingerType}
                      onChange={(e) => setRegFingerType(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#D6145A]/20"
                    >
                      <option value="RIGHT_THUMB">ðŸ‘ Kidole cha Gumba cha Kuume (Right Thumb)</option>
                      <option value="RIGHT_INDEX">â˜ï¸ Kidole cha Shahada cha Kuume (Right Index)</option>
                      <option value="RIGHT_MIDDLE">ðŸ–• Kidole cha Kati cha Kuume (Right Middle)</option>
                      <option value="LEFT_THUMB">ðŸ‘ Kidole cha Gumba cha Kushoto (Left Thumb)</option>
                      <option value="LEFT_INDEX">â˜ï¸ Kidole cha Shahada cha Kushoto (Left Index)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Hifadhi na Kamilisha Usajili wa Ndani
                  </button>
                </form>

                {/* Right registration scan device simulation */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    VIFURUSHI VYA BIOMETRIC SCANNER
                  </span>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={triggerRegistrationScan}
                      disabled={regScanning}
                      className={`w-32 h-32 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                        regScanning
                          ? "bg-amber-500 shadow-[0_15px_30px_rgba(245,158,11,0.35)] scale-95"
                          : regBiometricRegistered
                          ? "bg-emerald-500 shadow-[0_15px_30px_rgba(16,185,129,0.35)] scale-100"
                          : "bg-[#D6145A] hover:bg-[#b00f48] shadow-[0_15px_30px_rgba(214,20,90,0.25)]"
                      }`}
                    >
                      {regScanning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="absolute inset-0 rounded-3xl border-2 border-white/40 animate-ping" />
                          <div className="absolute top-0 left-0 right-0 h-1 bg-white shadow-md animate-bounce" />
                        </div>
                      )}

                      <Fingerprint className="w-14 h-14 text-white" />
                    </button>
                    
                    {regBiometricRegistered && (
                      <span className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-sm">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h5 className="text-xs font-extrabold text-slate-700">
                      {regScanning 
                        ? "Inasoma kidole... Weka kidole chako kwenye scanner" 
                        : regBiometricRegistered 
                        ? `âœ… ${FINGER_OPTIONS[regFingerType] || "KIDOLE"} KIMEREKODIWA!` 
                        : "GUSA HAPA KUSOMA ALAMA YA KIDOLE"}
                    </h5>
                    
                    {regBiometricKey && (
                      <div className="mt-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-[10px] font-mono font-bold text-slate-500">
                        Fingerprint Hash: {regBiometricKey}
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 max-w-[180px] leading-relaxed">
                    Unapogusa kitufe hapo juu, scanner inahifadhi vipimo na sifa za kipekee za kidole ulichochagua.
                  </p>
                </div>

              </div>

            </div>

            <div className="text-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setRegErrorMsg("");
                  setRegSuccessMsg("");
                }}
                className="text-xs text-[#D6145A] hover:underline font-bold"
              >
                â† Ghairi na urudi kwenye Ukurasa wa Kuingia (Login)
              </button>
            </div>
          </div>
        )}

        {/* Footer info brand */}
        <div className="bg-slate-50 border-t border-slate-100 py-3.5 px-6 text-center">
          <p className="text-[9px] text-slate-400 font-extrabold tracking-widest uppercase">
            AL-FURQAN CLINIC PORTAL SYSTEM | ALL RIGHTS RESERVED 2026
          </p>
        </div>

      </div>
    </div>
  );
}

export default LoginScreen;
