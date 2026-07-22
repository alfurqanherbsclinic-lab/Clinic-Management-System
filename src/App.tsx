import React, { useState, useEffect } from "react";
import { 
  Menu, 
  Bell, 
  LogOut, 
  PlusCircle, 
  Users, 
  Activity, 
  Layers, 
  Lock, 
  User, 
  Fingerprint,
  LayoutDashboard,
  Send,
  Stethoscope,
  Pill,
  BarChart3,
  Settings,
  Search,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  X,
  ChevronRight,
  FileText,
  Clock,
  Calendar,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { Patient } from "./types";
import PatientsView from "./components/PatientsView";
import BroadcastCenter from "./components/BroadcastCenter";
import LoginScreen from "./components/LoginScreen";

// Initial realistic clinic patients
const INITIAL_PATIENTS: Patient[] = [
  {
    id: "AF-001",
    cardNumber: "AHC-001",
    mrn: "MRN-2026-0001",
    name: "ALI HASSAN",
    phone: "0712345678",
    age: 45,
    gender: "Mwanaume",
    address: "Gungu, Kigoma",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    fingerprintPlaceholder: true,
    emergencyContact: {
      name: "Aisha Hassan",
      phone: "0787654321",
      relation: "Mke"
    },
    occupation: "Mfanyabiashara",
    religion: "Islam",
    nationality: "Tanzanian",
    bloodGroup: "O+",
    weight: 74,
    height: 1.77,
    bmi: 23.6,
    email: "ali.hassan@example.com",
    insurance: {
      hasInsurance: true,
      provider: "NHIF",
      policyNumber: "NHIF-9821-X"
    },
    paymentMethod: "Insurance",
    referralSource: "Kujisajili Mwenyewe",
    guardian: "N/A",
    maritalStatus: "Ameoa",
    nextOfKin: "Aisha Hassan (Mke)",
    registrationDate: "2026-07-10"
  },
  {
    id: "AF-002",
    cardNumber: "AHC-002",
    mrn: "MRN-2026-0002",
    name: "AMINA OMARI",
    phone: "0755889922",
    age: 32,
    gender: "Mwanamke",
    address: "Mwandiga, Kigoma",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    fingerprintPlaceholder: false,
    emergencyContact: {
      name: "Omari Juma",
      phone: "0766112233",
      relation: "Mume"
    },
    occupation: "Mwalimu",
    religion: "Islam",
    nationality: "Tanzanian",
    bloodGroup: "A+",
    weight: 62,
    height: 1.62,
    bmi: 23.6,
    email: "amina.omari@example.com",
    insurance: {
      hasInsurance: false,
      provider: "",
      policyNumber: ""
    },
    paymentMethod: "Cash",
    referralSource: "Kujisajili Mwenyewe",
    guardian: "N/A",
    maritalStatus: "Ameolewa",
    nextOfKin: "Omari Juma (Mume)",
    registrationDate: "2026-07-12"
  },
  {
    id: "AF-003",
    cardNumber: "AHC-003",
    mrn: "MRN-2026-0003",
    name: "JUMA RAMADHANI",
    phone: "0622334455",
    age: 28,
    gender: "Mwanaume",
    address: "Mwanga, Kigoma",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    fingerprintPlaceholder: true,
    emergencyContact: {
      name: "Ramadhani Selemani",
      phone: "0711223344",
      relation: "Baba"
    },
    occupation: "Mkulima",
    religion: "Islam",
    nationality: "Tanzanian",
    bloodGroup: "O-",
    weight: 81,
    height: 1.80,
    bmi: 25.0,
    email: "juma.ramadhani@example.com",
    insurance: {
      hasInsurance: false,
      provider: "",
      policyNumber: ""
    },
    paymentMethod: "Mobile Money",
    referralSource: "Kujisajili Mwenyewe",
    guardian: "N/A",
    maritalStatus: "Hajaoa",
    nextOfKin: "Ramadhani Selemani (Baba)",
    registrationDate: "2026-07-15"
  }
];

type ActiveView = "dashboard" | "patients" | "broadcast" | "consultation" | "pharmacy" | "reports" | "settings";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("admin");
  const [currentRole, setCurrentRole] = useState("Msimamizi Mkuu");
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Active navigation view state - defaults to Patients & Card view (Original Dashboard Layout)
  const [activeView, setActiveView] = useState<ActiveView>("patients");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live real-time clock & date for header
  const [currentTime, setCurrentTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [currentDate, setCurrentDate] = useState<string>(() => {
    try {
      return new Date().toLocaleDateString("sw-TZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    } catch {
      return new Date().toDateString();
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [notifications, setNotifications] = useState<string[]>([
    "Mfumo wa kadi umezinduliwa sasa hivi!",
    "Hakikisha unaondoa background ya picha kabla ya kuchapisha kadi ya mgonjwa.",
    "Lango la Oasis SMS Gateway liko tayari kutuma ujumbe."
  ]);
  const [showNotificationCount, setShowNotificationCount] = useState(true);

  // Consultation state
  const [selectedPatientId, setSelectedPatientId] = useState<string>(INITIAL_PATIENTS[0]?.id || "");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [bloodPressure, setBloodPressure] = useState("120/80");
  const [temperature, setTemperature] = useState("36.6");
  const [consultationSuccess, setConsultationSuccess] = useState(false);

  // Oasis SMS settings state
  const [oasisApiKey, setOasisApiKey] = useState("39029312930192310239120391203921");
  const [oasisSenderId, setOasisSenderId] = useState("AHC MKONONI");

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setNotifications((prev) => [
      `Mgonjwa mpya ${newPatient.name} amesajiliwa vyema!`,
      ...prev
    ]);
    setShowNotificationCount(true);
  };

  const handleDeletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLoginSuccess = (user: string, role: string) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    setCurrentRole(role);
  };

  const handleIncrementAttempts = () => {
    setLoginAttempts((prev) => prev + 1);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess}
        initialAttempts={loginAttempts}
        onIncrementAttempts={handleIncrementAttempts}
      />
    );
  }

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans relative">
      
      {/* Top Header matching original clean dashboard */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl text-primary transition-all cursor-pointer border border-slate-200"
            title="Fungua Orodha (Menu)"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black font-display text-primary tracking-wide uppercase flex items-center gap-2">
              <span>USAJILI WA WAGONJWA</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">
              AL-FURQAN CLINIC â€¢ CLINIC MANAGEMENT SYSTEM
            </p>
          </div>
        </div>

        {/* Realtime Clock & Date Pills + Notification + Logout */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-mono font-bold text-primary shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>{currentTime}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{currentDate}</span>
          </div>

          <button 
            onClick={() => {
              setShowNotificationCount(false);
              alert(`Taarifa za hivi karibuni:\n\nâ€¢ ${notifications.join('\nâ€¢ ')}`);
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-primary rounded-xl relative transition-all cursor-pointer border border-slate-200"
            title="Taarifa"
          >
            <Bell className="w-4 h-4" />
            {showNotificationCount && notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white animate-bounce" />
            )}
          </button>
          
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <button 
            onClick={handleLogout}
            className="px-3 py-1.5 bg-rose-60 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-rose-200 text-xs font-bold shadow-2xs"
            title="Toka (Logout)"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main 2-Tab Navigation Bar (USAJILI WA WAGONJWA & KADI | SMS & WHATSAPP BROADCAST CENTER) */}
      <div className="bg-white border-b-2 border-primary/10 px-4 sm:px-6 py-2 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveView("patients")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeView === "patients"
                  ? "bg-primary text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>USAJILI WA WAGONJWA & KADI</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeView === "patients" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"
              }`}>
                Wagonjwa Waliosajiliwa: {patients.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView("broadcast")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeView === "broadcast"
                  ? "bg-rose-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-rose-600"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>SMS & WHATSAPP BROADCAST CENTER</span>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full uppercase">
                OASIS & WA
              </span>
            </button>
          </nav>

          {/* Quick Doctor / Pharmacy Links */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setActiveView("consultation")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === "consultation" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Daktari
            </button>
            <button
              onClick={() => setActiveView("pharmacy")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === "pharmacy" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              Pharmacy
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Drawer Navigation */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 border-r border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-primary/5 to-rose-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-md">
                  AF
                </div>
                <div>
                  <h2 className="font-bold text-sm text-primary">AL-FURQAN CLINIC</h2>
                  <p className="text-[10px] text-gray-500 font-semibold">{currentUser} ({currentRole})</p>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links */}
            <div className="p-4 flex-1 overflow-y-auto space-y-1.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-3 mb-2">MFUMO WA CLINIC</p>
              
              <button
                onClick={() => { setActiveView("dashboard"); setSidebarOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  activeView === "dashboard" ? "bg-primary text-white shadow-md" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard (Dhibiti)</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => { setActiveView("patients"); setSidebarOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  activeView === "patients" ? "bg-primary text-white shadow-md" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  <span>Usajili wa Wagonjwa & Kadi</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-white/20 rounded-full font-mono font-bold">
                  {patients.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveView("broadcast"); setSidebarOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  activeView === "broadcast" ? "bg-rose-600 text-white shadow-md" : "text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Send className="w-4 h-4" />
                  <span>SMS & WhatsApp Broadcast</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-rose-100 text-rose-700 font-bold rounded-full">
                  Oasis
                </span>
              </button>

              <button
                onClick={() => { setActiveView("consultation"); setSidebarOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  activeView === "consultation" ? "bg-primary text-white shadow-md" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-4 h-4" />
                  <span>Huduma za Daktari & Tiba</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => { setActiveView("pharmacy"); setSidebarOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  activeView === "pharmacy" ? "bg-primary text-white shadow-md" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Pill className="w-4 h-4" />
                  <span>Duka la Dawa (Pharmacy)</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => { setActiveView("reports"); setSidebarOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  activeView === "reports" ? "bg-primary text-white shadow-md" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4" />
                  <span>Ripoti & Takwimu</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => { setActiveView("settings"); setSidebarOpen(false); }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  activeView === "settings" ? "bg-primary text-white shadow-md" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <span>Mipangilio ya Oasis API & Mfumo</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Ondoka Kwenye Mfumo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Bar on Mobile */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs font-bold no-scrollbar">
        <button 
          onClick={() => setActiveView("dashboard")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${activeView === "dashboard" ? "bg-primary text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveView("patients")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${activeView === "patients" ? "bg-primary text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Wagonjwa ({patients.length})
        </button>
        <button 
          onClick={() => setActiveView("broadcast")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${activeView === "broadcast" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          SMS Broadcast
        </button>
        <button 
          onClick={() => setActiveView("consultation")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${activeView === "consultation" ? "bg-primary text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Daktari
        </button>
        <button 
          onClick={() => setActiveView("pharmacy")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${activeView === "pharmacy" ? "bg-primary text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Pharmacy
        </button>
        <button 
          onClick={() => setActiveView("settings")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${activeView === "settings" ? "bg-primary text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Mipangilio
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-12 px-4 sm:px-6 pt-6">

        {/* 1. DASHBOARD VIEW */}
        {activeView === "dashboard" && (
          <div className="space-y-6">
            {/* Top Statistics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-primary/10 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Jumla ya Wagonjwa</p>
                  <p className="text-2xl font-black text-primary font-mono mt-1">{patients.length}</p>
                </div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-primary/10 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Waliosajiliwa Leo</p>
                  <p className="text-2xl font-black text-emerald-600 font-mono mt-1">1</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-primary/10 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">SMS Zilizotumwa</p>
                  <p className="text-2xl font-black text-rose-600 font-mono mt-1">128</p>
                </div>
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                  <Send className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-primary/10 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Kadi za Plastiki</p>
                  <p className="text-sm font-black text-primary uppercase mt-1">Ready to Print</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Layers className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="bg-gradient-to-br from-primary/5 via-white to-rose-50/30 p-6 rounded-2xl border border-primary/15 shadow-sm">
              <h2 className="text-sm font-black text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-rose-600" />
                <span>NJIA ZA MKATO NA HUDUMA ZOTE (QUICK ACTIONS)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveView("patients")}
                  className="p-4 bg-white hover:bg-primary/5 rounded-xl border border-primary/20 shadow-xs text-left transition-all group cursor-pointer"
                >
                  <div className="p-2.5 bg-primary/10 text-primary rounded-lg w-fit group-hover:bg-primary group-hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 mt-3">Usajili wa Wagonjwa</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Sajili mgonjwa mpya & Tengeneza Kadi za Plastiki</p>
                </button>

                <button
                  onClick={() => setActiveView("broadcast")}
                  className="p-4 bg-white hover:bg-rose-50 rounded-xl border border-rose-200 shadow-xs text-left transition-all group cursor-pointer"
                >
                  <div className="p-2.5 bg-rose-100 text-rose-600 rounded-lg w-fit group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <Send className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 mt-3">Oasis SMS Broadcast</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Tuma SMS za dharura na taarifa za clinic</p>
                </button>

                <button
                  onClick={() => setActiveView("consultation")}
                  className="p-4 bg-white hover:bg-primary/5 rounded-xl border border-primary/20 shadow-xs text-left transition-all group cursor-pointer"
                >
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg w-fit group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 mt-3">Huduma za Daktari</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Andika vipimo vya presha, joto na maelezo</p>
                </button>

                <button
                  onClick={() => setActiveView("pharmacy")}
                  className="p-4 bg-white hover:bg-primary/5 rounded-xl border border-primary/20 shadow-xs text-left transition-all group cursor-pointer"
                >
                  <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg w-fit group-hover:bg-amber-700 group-hover:text-white transition-colors">
                    <Pill className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 mt-3">Duka la Dawa</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Kagua stoki ya dawa na kutoa dawa kwa wagonjwa</p>
                </button>
              </div>
            </div>

            {/* Recent Patients Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-bold text-slate-800 text-base">Wagonjwa wa Hivi Karibuni</h2>
                  <p className="text-xs text-gray-500">Orodha ya wagonjwa waliopo kwenye mfumo wa clinic</p>
                </div>
                <button 
                  onClick={() => setActiveView("patients")}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Tazama Wote ({patients.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-gray-500 uppercase font-mono tracking-wider">
                      <th className="p-3.5 pl-5">Mgonjwa</th>
                      <th className="p-3.5">MRN / Namba ya Kadi</th>
                      <th className="p-3.5">Simu</th>
                      <th className="p-3.5">Anwani</th>
                      <th className="p-3.5">Bima / Malipo</th>
                      <th className="p-3.5 pr-5 text-right">Vitendo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 pl-5 font-bold text-slate-800 flex items-center gap-3">
                          <img 
                            src={patient.photoUrl} 
                            alt={patient.name} 
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{patient.name}</p>
                            <p className="text-[10px] text-gray-400">{patient.age} Yrs â€¢ {patient.gender}</p>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-primary">
                          {patient.cardNumber}
                          <span className="block text-[10px] text-gray-400 font-normal">{patient.mrn}</span>
                        </td>
                        <td className="p-3.5 font-mono">{patient.phone}</td>
                        <td className="p-3.5 text-gray-600">{patient.address}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${patient.insurance?.hasInsurance ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                            {patient.insurance?.hasInsurance ? patient.insurance.provider : patient.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <button
                            onClick={() => setActiveView("patients")}
                            className="px-3 py-1 bg-primary text-white rounded-lg text-[11px] font-bold hover:bg-primary/90 transition-all cursor-pointer"
                          >
                            Tazama Kadi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gateway & Infrastructure Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Oasis SMS Gateway Status</h3>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Hali ya Mtandao: ACTIVE & READY</span>
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full text-[10px]">Connected</span>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Sender ID: <span className="font-mono font-bold text-slate-800">{oasisSenderId}</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Fingerprint className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Biometric Scanner Status</h3>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between text-xs font-bold text-rose-900">
                  <span>Kifaa cha Alama za Vidole: SIMULATED READY</span>
                  <span className="px-2 py-0.5 bg-rose-200 text-rose-800 rounded-full text-[10px]">USB Ready</span>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Daktari Aliyepo: <span className="font-bold text-slate-800">{currentUser} ({currentRole})</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. PATIENTS VIEW */}
        {activeView === "patients" && (
          <PatientsView 
            patients={patients} 
            onAddPatient={handleAddPatient} 
            onDeletePatient={handleDeletePatient} 
          />
        )}

        {/* 3. BROADCAST VIEW */}
        {activeView === "broadcast" && (
          <BroadcastCenter patients={patients} />
        )}

        {/* 4. DOCTOR / CONSULTATION VIEW */}
        {activeView === "consultation" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-black font-display text-primary uppercase">
                  HUDUMA ZA DAKTARI NA VIPIMO VYA CLINIC
                </h2>
                <p className="text-xs text-gray-500">Andika maelezo ya tiba, vipimo na ushauri wa kiafya kwa mgonjwa</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs">
                Dr. Khalifa Rehani Portal
              </span>
            </div>

            {consultationSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Taarifa za vipimo na dawa kwa mgonjwa zimehifadhiwa vyema!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Select Patient */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase">Chagua Mgonjwa Aliyepo:</label>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {patients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        selectedPatientId === p.id 
                          ? "border-primary bg-primary/5 shadow-xs" 
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover border" />
                      <div>
                        <p className="font-bold text-xs text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{p.cardNumber} â€¢ {p.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Consultation Form */}
              <div className="md:col-span-2 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-primary" />
                    Vipimo vya Msingi (Vitals) - {selectedPatient?.name}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600">Presha (BP):</label>
                      <input 
                        type="text" 
                        value={bloodPressure}
                        onChange={(e) => setBloodPressure(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600">Joto (Â°C):</label>
                      <input 
                        type="text" 
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600">Uzito (Kg):</label>
                      <input 
                        type="text" 
                        disabled
                        value={selectedPatient?.weight || "70"}
                        className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold font-mono text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Maelezo ya Daktari / Diagnosis:</label>
                  <textarea 
                    rows={4}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Andika maelezo ya ugonjwa au dalili za mgonjwa hapa..."
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dawa Zilizopendekezwa (Prescription):</label>
                  <input 
                    type="text"
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="Mfano: Habat Soda Oil 100ml, Asali ya Nyuki, Dawa ya Mfupa"
                    className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => {
                    setConsultationSuccess(true);
                    setTimeout(() => setConsultationSuccess(false), 4000);
                  }}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hifadhi Record ya Daktari</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. PHARMACY VIEW */}
        {activeView === "pharmacy" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-black font-display text-primary uppercase">
                  DUKA LA DAWA NA TIBA ZA ASILI (PHARMACY)
                </h2>
                <p className="text-xs text-gray-500">Stoki ya dawa na kutoa prescription kwa wagonjwa</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-xs">
                Orodha ya Stoki
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-xs text-emerald-700 font-bold uppercase">Dawa Zilizopo Stoki</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">24 Aina</p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 font-bold uppercase">Inakaribia Kuisha</p>
                <p className="text-2xl font-black text-amber-900 mt-1">2 Aina</p>
              </div>
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <p className="text-xs text-rose-700 font-bold uppercase">Prescriptions za Leo</p>
                <p className="text-2xl font-black text-rose-900 mt-1">8 Wagonjwa</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-gray-600 font-bold uppercase">
                    <th className="p-3">Jina la Dawa</th>
                    <th className="p-3">Aina</th>
                    <th className="p-3">Kiasi Kilichopo</th>
                    <th className="p-3">Gharama (TZS)</th>
                    <th className="p-3 text-right">Kitendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="p-3 font-bold text-slate-800">Habat Soda pure oil 100ml</td>
                    <td className="p-3 text-gray-500">Mafuta ya Asili</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">45 Bote</td>
                    <td className="p-3 font-mono">15,000</td>
                    <td className="p-3 text-right">
                      <button className="px-2.5 py-1 bg-primary text-white text-[11px] font-bold rounded-lg cursor-pointer">Kutoa Dawa</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-800">Asali ya Nyuki ya Asili 500ml</td>
                    <td className="p-3 text-gray-500">Tiba Lishe</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">30 Bote</td>
                    <td className="p-3 font-mono">20,000</td>
                    <td className="p-3 text-right">
                      <button className="px-2.5 py-1 bg-primary text-white text-[11px] font-bold rounded-lg cursor-pointer">Kutoa Dawa</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-800">Dawa ya Tumbo na Gesi (Herbal Powder)</td>
                    <td className="p-3 text-gray-500">Unga wa Miti Shamba</td>
                    <td className="p-3 font-mono font-bold text-amber-600">5 Pkts (Inaisha)</td>
                    <td className="p-3 font-mono">10,000</td>
                    <td className="p-3 text-right">
                      <button className="px-2.5 py-1 bg-primary text-white text-[11px] font-bold rounded-lg cursor-pointer">Kutoa Dawa</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. REPORTS VIEW */}
        {activeView === "reports" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black font-display text-primary uppercase">
                RIPOTI NA TAKWIMU ZA CLINIC
              </h2>
              <p className="text-xs text-gray-500">Uchambuzi wa idadi ya wagonjwa na mfumo wa SMS</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-xs uppercase text-slate-700">Muhtasari wa Mwezi Huu:</h3>
                <ul className="text-xs space-y-2 text-slate-600">
                  <li className="flex justify-between border-b pb-1">
                    <span>Wagonjwa Mapya Waliosajiliwa:</span>
                    <span className="font-bold font-mono text-primary">3</span>
                  </li>
                  <li className="flex justify-between border-b pb-1">
                    <span>Jumla ya SMS Zilizotumwa (Oasis):</span>
                    <span className="font-bold font-mono text-rose-600">128</span>
                  </li>
                  <li className="flex justify-between border-b pb-1">
                    <span>Wagonjwa wa NHIF/Bima:</span>
                    <span className="font-bold font-mono text-emerald-600">1</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-xs uppercase text-slate-700">Ripoti ya Mfumo:</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Mfumo wa kadi za plastiki na usajili unafanya kazi kikamilifu. Matangazo ya SMS yanapita kwenye lango la Oasis SMS Technologies.
                </p>
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-primary/90 transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Chapisha Ripoti (Print)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. SETTINGS VIEW */}
        {activeView === "settings" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black font-display text-primary uppercase">
                MIPANGILIO YA OASIS API & CLINIC
              </h2>
              <p className="text-xs text-gray-500">Sanidi funguo za API na taarifa za mfumo</p>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Oasis SMS API Key / Token:
                </label>
                <input 
                  type="text" 
                  value={oasisApiKey}
                  onChange={(e) => setOasisApiKey(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Oasis Sender ID (Jina la Mtumaji):
                </label>
                <input 
                  type="text" 
                  value={oasisSenderId}
                  onChange={(e) => setOasisSenderId(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <button 
                onClick={() => alert("Mipangilio ya Oasis API imehifadhiwa kikamilifu!")}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>Hifadhi Mipangilio</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-gray-400 font-medium">
        &copy; {new Date().getFullYear()} Al-Furqan Clinic. Haki zote zimehifadhiwa. Designed for Dr. Khalifa Rehani.
      </footer>
    </div>
  );
    }
