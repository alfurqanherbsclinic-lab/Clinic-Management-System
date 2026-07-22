import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import PatientsView from './components/PatientsView';
import BroadcastCenter from './components/BroadcastCenter';
import { Patient, User } from './types';
import { UserCheck, LogOut, Users, Send, Shield, Clock } from 'lucide-react';

const INITIAL_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Kassim Majaliwa',
    phone: '255712345678',
    age: 42,
    gender: 'Mume',
    residence: 'Dar es Salaam, Kinondoni',
    condition: 'Tiba ya Mfumo wa Chakula & Presha',
    cardNumber: 'AHC-2026-001',
    registrationDate: '2026-07-01'
  },
  {
    id: '2',
    name: 'Amina Juma',
    phone: '255754987654',
    age: 31,
    gender: 'Mke',
    residence: 'Zanzibar, Mjini',
    condition: 'Ushauri wa Lishe na Nyongo',
    cardNumber: 'AHC-2026-002',
    registrationDate: '2026-07-05'
  },
  {
    id: '3',
    name: 'Juma Ramadhani',
    phone: '255688112233',
    age: 55,
    gender: 'Mume',
    residence: 'Dodoma, Makulu',
    condition: 'Maumivu ya Viungo (Arthritis)',
    cardNumber: 'AHC-2026-003',
    registrationDate: '2026-07-12'
  }
];

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'broadcast'>('patients');
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('al_furqan_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [loginAttempts, setLoginAttempts] = useState<number>(() => {
    const saved = localStorage.getItem('al_furqan_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('al_furqan_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('sw-TZ', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddPatient = (newPatient: Omit<Patient, 'id' | 'cardNumber' | 'registrationDate'>) => {
    const count = patients.length + 1;
    const padCount = String(count).padStart(3, '0');
    const patientObj: Patient = {
      ...newPatient,
      id: Date.now().toString(),
      cardNumber: `AHC-2026-${padCount}`,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    setPatients([patientObj, ...patients]);
  };

  const handleDeletePatient = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
  };

  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        initialAttempts={loginAttempts}
        onIncrementAttempts={() => {
          const next = loginAttempts + 1;
          setLoginAttempts(next);
          localStorage.setItem('al_furqan_attempts', String(next));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold shadow-sm">
                AHC
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  AL-FURQAN HERB'S CLINIC
                  <span className="bg-pink-100 text-pink-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    HIS SYSTEM
                  </span>
                </h1>
                <p className="text-xs text-slate-500">Mfumo wa Usajili, Biometric na Broadcast</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <Clock className="w-4 h-4 text-pink-600" />
                <span>Muda: <strong className="font-mono text-slate-800">{currentTime || '23:55:10'}</strong></span>
              </div>

              <div className="flex items-center space-x-3 bg-pink-50/50 border border-pink-100 px-3 py-1.5 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    {currentUser.name}
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[10px] text-pink-700 font-medium">
                    {currentUser.roleDisplay}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                title="Ondoka kwenye mfumo"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Toka</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs Bar */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('patients')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'patients'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                USAJILI WA WAGONJWA & KADI
              </button>

              <button
                onClick={() => setActiveTab('broadcast')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'broadcast'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm ring-2 ring-pink-500 ring-offset-1'
                    : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200'
                }`}
              >
                <Send className="w-4 h-4" />
                SMS & WHATSAPP BROADCAST CENTER
                <span className="bg-white text-pink-700 text-[10px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider ml-1">
                  OASIS & WA
                </span>
              </button>
            </nav>

            <div className="hidden lg:flex items-center text-xs text-slate-500 gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Wagonjwa Waliosajiliwa: <strong className="text-emerald-900 font-bold">{patients.length}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'patients' ? (
          <PatientsView
            patients={patients}
            onAddPatient={handleAddPatient}
            onDeletePatient={handleDeletePatient}
          />
        ) : (
          <BroadcastCenter patients={patients} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-12 text-center text-xs text-slate-400">
        <p>AL-FURQAN CLINIC PORTAL SYSTEM • ALL RIGHTS RESERVED 2026</p>
      </footer>
    </div>
  );
}

export default App;
