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
  AlertCircle,
  FlaskConical,
  DollarSign,
  HeartHandshake
} from "lucide-react";
import { Patient } from "./types";
import PatientsView from "./components/PatientsView";
import BroadcastCenter from "./components/BroadcastCenter";
import LoginScreen from "./components/LoginScreen";
import SidebarNav, { NavSubView } from "./components/SidebarNav";
import DoctorModule from "./components/DoctorModule";
import LaboratoryModule from "./components/LaboratoryModule";
import PharmacyModule from "./components/PharmacyModule";
import BillingModule from "./components/BillingModule";
import HerbalLibraryModule from "./components/HerbalLibraryModule";
import ReportsModule from "./components/ReportsModule";
import SettingsStaffModule from "./components/SettingsStaffModule";

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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("Dr. Khalifa Rehani");
  const [currentRole, setCurrentRole] = useState("Mtaalamu wa Clinic (Admin)");
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Active Navigation State (Mapped to Left Sidebar)
  const [navSubView, setNavSubView] = useState<NavSubView>("dashboard");
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
    "Mfumo wa Hospital Information System (HIS) umechujwa na kukamilika kikamilifu!",
    "Kipengele cha Vikumbusho vya Dawa na SMS kupitia Oasis kiko tayari.",
    "Lango la Oasis SMS Technologies liko LIVE."
  ]);
  const [showNotificationCount, setShowNotificationCount] = useState(true);

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
    setCurrentUser(user || "Dr. Khalifa Rehani");
    setCurrentRole(role || "Mtaalamu wa Clinic");
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans relative">
      
      {/* Left Navigation Sidebar */}
      <SidebarNav
        activeNav={navSubView}
        onSelectNav={(nav) => setNavSubView(nav)}
        patientCount={patients.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        currentRole={currentRole}
      />

      {/* Top Main Navigation Header */}
      <header className="lg:pl-72 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-primary transition-all cursor-pointer border border-slate-200"
            title="Fungua Orodha (Menu)"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black font-display text-primary tracking-wide uppercase flex items-center gap-2">
              <span>AL-FURQAN HERB'S CLINIC - HIS SYSTEM</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">
              Hospital Information System • Dr. Khalifa Rehani Portal
            </p>
          </div>
        </div>

        {/* Realtime Clock & Date Pills + Notifications + Logout */}
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
              alert(`Taarifa za hivi karibuni:\n\n• ${notifications.join('\n• ')}`);
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
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-rose-200 text-xs font-bold shadow-2xs"
            title="Toka (Logout)"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Body Layout (With left padding on desktop for fixed sidebar) */}
      <main className="lg:pl-72 flex-1 w-full mx-auto pb-12 px-4 sm:px-6 pt-6">

        {/* 1. DASHBOARD VIEW */}
        {navSubView === "dashboard" && (
          <div className="space-y-6">
            {/* Top Overview KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-primary/20 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Jumla ya Wagonjwa</p>
                  <p className="text-2xl font-black text-primary font-mono mt-1">{patients.length}</p>
                </div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Waliosajiliwa Leo</p>
                  <p className="text-2xl font-black text-emerald-600 font-mono mt-1">1</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-rose-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">SMS Gateway (Oasis)</p>
                  <p className="text-2xl font-black text-rose-600 font-mono mt-1">128 SMS</p>
                </div>
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                  <Send className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Kadi za Plastiki</p>
                  <p className="text-sm font-black text-primary uppercase mt-1">Tayari Kuchapishwa</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Layers className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Grid matching left sidebar options */}
            <div className="bg-gradient-to-br from-primary/5 via-white to-rose-50/30 p-6 rounded-2xl border border-primary/15 shadow-sm">
              <h2 className="text-sm font-black text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#D6145A]" />
                <span>NJIA ZA MKATO NA HUDUMA ZOTE (QUICK MODULE ACCESSIBILITY)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setNavSubView("patients_register")}
                  className="p-4 bg-white hover:bg-primary/5 rounded-xl border border-primary/20 shadow-xs text-left transition-all group cursor-pointer"
                >
                  <div className="p-2.5 bg-primary/10 text-primary rounded-lg w-fit group-hover:bg-primary group-hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 mt-3">Usajili wa Wagonjwa</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Sajili Mgonjwa Mpya, Vikumbusho na Kadi za Plastiki</p>
                </button>

                <button
                  onClick={() => setNavSubView("doctor_consultation")}
                  className="p-4 bg-white hover:bg-sky-50 rounded-xl border border-sky-200 shadow-xs text-left transition-all group cursor-pointer"
                >
                  <div className="p-2.5 bg-sky-100 text-sky-700 rounded-lg w-fit group-hover:bg-sky-700 group-hover:text-white transition-colors">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 mt-3">Huduma za Daktari</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Consultation, Vital Signs, Diagnosis & Prescriptions</p>
                </button>

                <button
                  onClick={() => setNavSubView("lab_tests")}
                  className="p-4 bg-white hover:bg-purple-50 rounded-xl border border-purple-200 shadow-xs text-left transition-all group cursor-pointer"
                >
                  <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg w-fit group-hover:bg-purple-700 group-hover:text-white transition-colors">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 mt-3">Maabara (Laboratory)</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Omba vipimo vya Widal, Malaria, FBP na Matokeo</p>
                </button>

                <button
                  onClick={() => setNavSubView("pharmacy_drugs")}
                  className="p-4 bg-white hover:bg-amber-50 rounded-xl border border-amber-200 shadow-xs text-left transition-all group cursor-pointer"
                >
                  <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg w-fit group-hover:bg-amber-700 group-hover:text-white transition-colors">
                    <Pill className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 mt-3">Pharmacy & Stock</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Dawa za asili, mauzo (POS) na usimamizi wa stoki</p>
                </button>
              </div>
            </div>

            {/* Patients Overview Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-bold text-slate-800 text-base">Wagonjwa wa Hivi Karibuni</h2>
                  <p className="text-xs text-gray-500">Orodha ya wagonjwa waliosajiliwa hivi karibuni</p>
                </div>
                <button 
                  onClick={() => setNavSubView("patients_list")}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Tazama Orodha Kamili ({patients.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-gray-500 uppercase font-mono tracking-wider">
                      <th className="p-3.5 pl-5">Mgonjwa</th>
                      <th className="p-3.5">Namba ya Kadi / MRN</th>
                      <th className="p-3.5">Simu</th>
                      <th className="p-3.5">Anwani</th>
                      <th className="p-3.5">Malipo</th>
                      <th className="p-3.5 pr-5 text-right">Kitendo</th>
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
                          />
                          <div>
                            <p className="font-bold text-slate-900">{patient.name}</p>
                            <p className="text-[10px] text-gray-400">{patient.age} Yrs • {patient.gender}</p>
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
                            onClick={() => setNavSubView("patients_cards")}
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

          </div>
        )}

        {/* 2. USAJILI WA WAGONJWA MODULE */}
        {(navSubView === "patients_register" || navSubView === "patients_list" || navSubView === "patients_cards") && (
          <PatientsView 
            patients={patients} 
            onAddPatient={handleAddPatient} 
            onDeletePatient={handleDeletePatient} 
          />
        )}

        {/* 3. HUDUMA ZA DAKTARI MODULE */}
        {(navSubView === "doctor_consultation" || navSubView === "doctor_diagnosis" || navSubView === "doctor_prescription" || navSubView === "doctor_followup") && (
          <DoctorModule 
            patients={patients} 
            activeSubTab={
              navSubView === "doctor_diagnosis" ? "diagnosis" :
              navSubView === "doctor_prescription" ? "prescription" :
              navSubView === "doctor_followup" ? "followup" : "consultation"
            } 
          />
        )}

        {/* 4. MAABARA (LABORATORY) MODULE */}
        {(navSubView === "lab_tests" || navSubView === "lab_results") && (
          <LaboratoryModule 
            patients={patients} 
            activeSubTab={navSubView} 
          />
        )}

        {/* 5. PHARMACY MODULE */}
        {(navSubView === "pharmacy_drugs" || navSubView === "pharmacy_sales" || navSubView === "pharmacy_stock" || navSubView === "pharmacy_suppliers") && (
          <PharmacyModule 
            activeSubTab={navSubView} 
          />
        )}

        {/* 6. BILLING & MALIPO MODULE */}
        {(navSubView === "billing_payments" || navSubView === "billing_invoices") && (
          <BillingModule 
            patients={patients} 
            activeSubTab={navSubView} 
          />
        )}

        {/* 7. TIBA ASILI & MAKTABA MODULE */}
        {(navSubView === "herbal_remedies" || navSubView === "herbal_books" || navSubView === "herbal_promos") && (
          <HerbalLibraryModule 
            activeSubTab={navSubView} 
          />
        )}

        {/* 8. RIPOTI & TAKWIMU MODULE */}
        {navSubView === "reports" && (
          <ReportsModule 
            patients={patients} 
          />
        )}

        {/* 9. SMS & WHATSAPP BROADCAST MODULE */}
        {navSubView === "broadcast" && (
          <BroadcastCenter 
            patients={patients} 
          />
        )}

        {/* 10. MIPANGILIO & WAFANYAKAZI MODULE */}
        {(navSubView === "settings_config" || navSubView === "settings_staff" || navSubView === "settings_logs") && (
          <SettingsStaffModule 
            activeSubTab={navSubView} 
          />
        )}

      </main>

      {/* Footer */}
      <footer className="lg:pl-72 bg-white border-t border-slate-200 py-4 text-center text-xs text-gray-400 font-medium">
        &copy; {new Date().getFullYear()} Al-Furqan Herb's Clinic HIS System. Haki zote zimehifadhiwa. Designed for Dr. Khalifa Rehani.
      </footer>
    </div>
  );
}

