import React, { useState } from "react";
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
  Fingerprint
} from "lucide-react";
import { Patient } from "./types";
import PatientsView from "./components/PatientsView";
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("admin");
  const [currentRole, setCurrentRole] = useState("Msimamizi Mkuu");
  const [loginAttempts, setLoginAttempts] = useState(0);

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [notifications, setNotifications] = useState<string[]>([
    "Mfumo wa kadi umezinduliwa sasa hivi!",
    "Hakikisha unaondoa background ya picha kabla ya kuchapisha kadi ya mgonjwa."
  ]);
  const [showNotificationCount, setShowNotificationCount] = useState(true);

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    // Add real notification
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Top Header matching user's screenshot exactly */}
      <header className="bg-white border-b-2 border-primary/10 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-lg text-primary transition-colors cursor-pointer" title="Menu">
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-black font-display text-primary tracking-wide uppercase">
              USAJILI WA WAGONJWA
            </h1>
            <p className="text-[10px] text-gray-500 font-bold tracking-wider">
              AL-FURQAN CLINIC • CLINIC MANAGEMENT SYSTEM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setShowNotificationCount(false);
              alert(`Taarifa za hivi karibuni:\n\n${notifications.join('\n')}`);
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-primary rounded-xl relative transition-all cursor-pointer"
            title="Notification"
          >
            <Bell className="w-5 h-5" />
            {showNotificationCount && notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white animate-bounce" />
            )}
          </button>
          
          <div className="h-8 w-px bg-slate-200" />

          <button 
            onClick={handleLogout}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Toka"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-12">
        {/* Statistics bar */}
        <div className="px-6 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-primary/10 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Jumla ya Wagonjwa</p>
              <p className="text-lg font-black text-primary font-mono">{patients.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-primary/10 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Waliosajiliwa Leo</p>
              <p className="text-lg font-black text-emerald-600 font-mono">1</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-primary/10 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Kadi za Plastiki</p>
              <p className="text-lg font-black text-rose-600 font-mono">Ready to Print</p>
            </div>
          </div>
        </div>

        {/* The Patients View Component */}
        <PatientsView 
          patients={patients} 
          onAddPatient={handleAddPatient} 
          onDeletePatient={handleDeletePatient} 
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-gray-400 font-medium">
        &copy; {new Date().getFullYear()} Al-Furqan Clinic. Haki zote zimehifadhiwa. Designed for Dr. Khalifa Rehani.
      </footer>
    </div>
  );
}
