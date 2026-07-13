import React, { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import PatientsView from "./components/PatientsView";
import MedicalRecordsView from "./components/MedicalRecordsView";
import ConsultationView from "./components/ConsultationView";
import PharmacyView from "./components/PharmacyView";
import LabView from "./components/LabView";
import AppointmentsView from "./components/AppointmentsView";
import BillingView from "./components/BillingView";
import InventoryView from "./components/InventoryView";
import HRView from "./components/HRView";
import ReportsView from "./components/ReportsView";
import SettingsView from "./components/SettingsView";

import { 
  Patient, 
  MedicalRecord, 
  Consultation, 
  Medicine, 
  LabRecord, 
  Appointment, 
  Invoice, 
  InventoryItem, 
  Staff, 
  AuditLog 
} from "./types";

import { 
  initialPatients, 
  initialRecords, 
  initialConsultations, 
  initialMedicines, 
  initialLabs, 
  initialAppointments, 
  initialInvoices, 
  initialInventory, 
  initialStaff, 
  initialAuditLogs 
} from "./initialData";

import { BookOpen, HelpCircle, Send, Users, ShieldAlert, CheckCircle } from "lucide-react";

export default function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Active View controller
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Centralized State Management
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [records, setRecords] = useState<MedicalRecord[]>(initialRecords);
  const [consultations, setConsultations] = useState<Consultation[]>(initialConsultations);
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [labRecords, setLabRecords] = useState<LabRecord[]>(initialLabs);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Session Timeout countdown (25 minutes)
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(1500);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        setSessionTimeRemaining((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = (user: string, role: string) => {
    setIsAuthenticated(true);
    setUsername(user);
    setUserRole(role);
    setSessionTimeRemaining(1500); // reset timer
    
    // Add audit log for successful login
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      username: user,
      role: role,
      action: "Secure Login Successful (Authorized Node)",
      ipAddress: "192.168.1.100"
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setUserRole("");
  };

  const handleIncrementAttempts = () => {
    setLoginAttempts((prev) => prev + 1);
  };

  // State Updates Handlers
  const handleAddPatient = (newPatient: Patient) => {
    setPatients([newPatient, ...patients]);
    
    // Auto-create initial Invoice for patient card registration fee (TZS 20,000)
    const cardInvoice: Invoice = {
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: newPatient.id,
      patientName: newPatient.name,
      date: new Date().toISOString().split("T")[0],
      items: [{ description: "Sajili na Kadi ya Premium (Hospital ID Fee)", amount: 20000 }],
      discount: 0,
      insuranceProvider: newPatient.paymentMethod === "Insurance" ? (newPatient.insurance.provider || "NHIF") : "",
      paymentMethod: newPatient.paymentMethod === "Insurance" ? "Insurance" : "Cash",
      controlNumber: `99026${Math.floor(1000000 + Math.random() * 9000000)}`,
      status: "Paid",
      total: 20000,
      netAmount: 20000
    };
    setInvoices([cardInvoice, ...invoices]);

    // Create automatic scheduled appointment for Doctor Consultation
    const firstAppointment: Appointment = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      patientId: newPatient.id,
      patientName: newPatient.name,
      patientPhone: newPatient.phone,
      doctorName: "Dr. Abdu Khalifa Rehani",
      date: new Date().toISOString().split("T")[0],
      time: "09:30 AM",
      queueNumber: appointments.filter(a => a.date === new Date().toISOString().split("T")[0]).length + 1,
      status: "Scheduled"
    };
    setAppointments([firstAppointment, ...appointments]);

    // Add Audit Log
    const log: AuditLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      username: username || "System",
      role: userRole || "Administrator",
      action: `Registered Patient: ${newPatient.name} (${newPatient.cardNumber}). Initial card & appointment auto-generated.`,
      ipAddress: "192.168.1.100"
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleDeletePatient = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
  };

  const handleAddRecord = (newRecord: MedicalRecord) => {
    setRecords([newRecord, ...records]);
    
    // Add Audit Log
    const log: AuditLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      username: username,
      role: userRole,
      action: `Added EMR clinical record for Patient ID: ${newRecord.patientId}`,
      ipAddress: "192.168.1.100"
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleAddConsultation = (newConsultation: Consultation) => {
    setConsultations([newConsultation, ...consultations]);

    // Auto-generate invoice/bill for the prescribed medicines
    const medicineInvoice: Invoice = {
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: newConsultation.patientId,
      patientName: patients.find(p => p.id === newConsultation.patientId)?.name || "Mgonjwa",
      date: new Date().toISOString().split("T")[0],
      items: [
        { description: `Doctor Consultation & Diagnosis (${newConsultation.icdCode})`, amount: 15000 },
        { description: "Habbat Soda / Asali (Tiba Prescribed)", amount: 30000 }
      ],
      discount: 0,
      insuranceProvider: "",
      paymentMethod: "Cash",
      controlNumber: `99026${Math.floor(1000000 + Math.random() * 9000000)}`,
      status: "Paid",
      total: 45000,
      netAmount: 45000
    };
    setInvoices([medicineInvoice, ...invoices]);

    // Add Audit Log
    const log: AuditLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      username: username,
      role: userRole,
      action: `Completed Doctor Consultation for Patient ID: ${newConsultation.patientId}. Medication bill generated.`,
      ipAddress: "192.168.1.100"
    };
    setAuditLogs([log, ...auditLogs]);
  };

  const handleAddMedicine = (newMed: Medicine) => {
    setMedicines([newMed, ...medicines]);
  };

  const handleUpdateStock = (id: string, qtyChange: number) => {
    setMedicines(medicines.map(m => {
      if (m.id === id) {
        const finalQty = Math.max(0, m.qty + qtyChange);
        return { ...m, qty: finalQty };
      }
      return m;
    }));
  };

  const handleAddLabRecord = (newLab: LabRecord) => {
    setLabRecords([newLab, ...labRecords]);
  };

  const handleUpdateLabReview = (id: string, review: string) => {
    setLabRecords(labRecords.map(lab => {
      if (lab.id === id) {
        return { ...lab, doctorReview: review, reviewer: username || "Dr. Khalifa Rehani" };
      }
      return lab;
    }));
  };

  const handleAddAppointment = (newApt: Appointment) => {
    setAppointments([newApt, ...appointments]);
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment["status"]) => {
    setAppointments(appointments.map(a => {
      if (a.id === id) {
        return { ...a, status };
      }
      return a;
    }));
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
  };

  const handlePayInvoice = (id: string) => {
    setInvoices(invoices.map(inv => {
      if (inv.id === id) {
        return { ...inv, status: "Paid" };
      }
      return inv;
    }));
  };

  const handleAddInventoryItem = (newItem: InventoryItem) => {
    setInventory([newItem, ...inventory]);
  };

  const handleAddStaff = (newStaff: Staff) => {
    setStaffList([newStaff, ...staffList]);
  };

  const handleUpdateAttendance = (id: string, attendance: Staff["attendance"]) => {
    setStaffList(staffList.map(s => {
      if (s.id === id) {
        return { ...s, attendance };
      }
      return s;
    }));
  };

  const handleRestoreBackup = (backupData: any) => {
    if (backupData.patients) setPatients(backupData.patients);
    if (backupData.records) setRecords(backupData.records);
    if (backupData.consultations) setConsultations(backupData.consultations);
    if (backupData.medicines) setMedicines(backupData.medicines);
    if (backupData.invoices) setInvoices(backupData.invoices);
  };

  // Helper to translate Active Tab to title header swahili text
  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard": return "DASHBOARD KUU";
      case "patients": return "USAJILI WA WAGONJWA";
      case "records": return "KUMBUKUMBU ZA CLINICAL (EMR)";
      case "external-register": return "REGISTER PORTAL (EXTERNAL)";
      case "external-list": return "SABMITI ZA MTANDAONI (PORTAL)";
      case "external-master": return "DATABASE KUU YA MGONJWA";
      case "consultation": return "VIPIMO NA USHAURI WA CLINIC";
      case "pharmacy": return "FAMASIA & STOKI YA DAWA";
      case "lab": return "MAABARA (LABORATORY REPORTS)";
      case "books": return "MAKTABA (VITABU VYA TIBA)";
      case "sales": return "MAUZO NA ANKARA (BILLING)";
      case "communication": return "SMS & WHATSAPP BROADCAST";
      case "settings": return "MIPANGILIO YA MFUMO";
      default: return "AL-FURQAN HIS";
    }
  };

  // Custom views for missing screens in list
  const renderSpecialView = () => {
    if (activeTab === "books") {
      return (
        <div className="p-6 space-y-6">
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b border-primary/20 pb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-secondary animate-pulse" />
              Maktaba ya Vitabu vya Mimea na Tiba Asilia (Herbal Reference Library)
            </h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Daktari anaweza kurejea vitabu hivi ili kupata muongozo sahihi wa vipimo na maandalizi ya dawa asili kulingana na mafundisho ya Sunnah.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-4 bg-light-bg rounded-xl border border-primary/10 space-y-3">
                <span className="text-[10px] bg-secondary text-white font-mono px-2 py-0.5 rounded font-bold uppercase">Volume 1</span>
                <h4 className="font-extrabold text-primary text-xs uppercase">Mwongozo wa Habbat Soda na Asali</h4>
                <p className="text-[11px] text-gray-600 font-semibold leading-relaxed">
                  Inafafanua jinsi ya kuandaa mafuta ya Habbat Soda kwa ajili ya kutibu pumu (asthma), mzio (allergies), na kurekebisha mmeng'enyo wa chakula.
                </p>
                <button onClick={() => alert("Kifungu cha Mwongozo: Kijiko 1 cha asali mchanganyiko na tone 3 za mafuta ya Habbat soda asubuhi na jioni.")} className="text-[11px] text-secondary hover:underline font-bold cursor-pointer">
                  Soma Mwongozo
                </button>
              </div>
              <div className="p-4 bg-light-bg rounded-xl border border-primary/10 space-y-3">
                <span className="text-[10px] bg-secondary text-white font-mono px-2 py-0.5 rounded font-bold uppercase">Volume 2</span>
                <h4 className="font-extrabold text-primary text-xs uppercase">Tiba ya Uwatu (Fenugreek Science)</h4>
                <p className="text-[11px] text-gray-600 font-semibold leading-relaxed">
                  Faida za kipekee za unga wa Uwatu katika kusaidia kupunguza sukari mwilini (Diabetes management) na kuondoa sumu mwilini.
                </p>
                <button onClick={() => alert("Kifungu cha Mwongozo: Unga wa Uwatu vijiko 2 vikichanganywa na maji ya uvuguvugu kabla ya mlo.")} className="text-[11px] text-secondary hover:underline font-bold cursor-pointer">
                  Soma Mwongozo
                </button>
              </div>
              <div className="p-4 bg-light-bg rounded-xl border border-primary/10 space-y-3">
                <span className="text-[10px] bg-secondary text-white font-mono px-2 py-0.5 rounded font-bold uppercase">Volume 3</span>
                <h4 className="font-extrabold text-primary text-xs uppercase">Mlonge na Zaituni (Olive & Moringa)</h4>
                <p className="text-[11px] text-gray-600 font-semibold leading-relaxed">
                  Mchanganyiko thabiti wa antioxidant kusaidia kuongeza kinga ya mwili (Immune support) na kupambana na rheumatic pains.
                </p>
                <button onClick={() => alert("Kifungu cha Mwongozo: Moringa capsule 1 x 3 mlo baada ya asubuhi, mchana na usiku.")} className="text-[11px] text-secondary hover:underline font-bold cursor-pointer">
                  Soma Mwongozo
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "communication") {
      return (
        <div className="p-6 space-y-6">
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b border-primary/20 pb-2 flex items-center gap-2">
              <Send className="w-5 h-5 text-secondary animate-pulse" />
              Mawasiliano na Bulk Broadcast (SMS & WhatsApp Center)
            </h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Tuma ujumbe wa dharura, dokezo la afya na elimu ya tiba ya Sunnah kwa wagonjwa wote waliosajiliwa kwa kubofya kitufe kimoja tu.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="md:col-span-2 space-y-4">
                <div className="flex flex-col text-xs">
                  <label className="font-bold text-primary mb-1 uppercase">Aina ya Broadcast</label>
                  <select className="p-2.5 border-2 border-primary rounded-lg font-semibold bg-white">
                    <option>Ushauri wa Afya (General Health Advice)</option>
                    <option>Dokezo la Matoleo Mapya (Stoki ya Dawa imewasili)</option>
                    <option>Ujumbe wa Sikukuu / Likizo (Clinic Closed Notifications)</option>
                  </select>
                </div>
                <div className="flex flex-col text-xs">
                  <label className="font-bold text-primary mb-1 uppercase">Mwili wa Ujumbe (Message Body) *</label>
                  <textarea
                    rows={5}
                    className="p-3 border-2 border-primary rounded-lg font-semibold"
                    placeholder="Habari ndugu mgonjwa wetu wa Al-Furqan Herbs Clinic, kumbuka kunywa maji ya kutosha na kufuata ushauri wa daktari..."
                  />
                </div>
                <button onClick={() => alert("Ujumbe wa Broadcast umezinduliwa na utatumwa kwa wagonjwa wote 3 ndani ya dakika 2.")} className="p-3 bg-secondary hover:bg-primary text-white text-xs font-bold rounded-lg transition-colors cursor-pointer w-full shadow">
                  Sambaza Ujumbe kwa Wagonjwa Wote (Send Broadcast)
                </button>
              </div>

              <div className="bg-light-bg p-4 rounded-xl border border-primary/10 space-y-3 text-xs font-semibold text-gray-700">
                <span className="font-bold text-primary uppercase block">Hali ya Gateway</span>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span>Simu za Wagonjwa (Target):</span>
                  <span className="font-mono text-primary font-extrabold">{patients.length} Active Contacts</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span>Njia ya Gateway:</span>
                  <span className="text-secondary font-extrabold">Nexmo / Twilio & WA API</span>
                </div>
                <div className="flex justify-between">
                  <span>Hadhi ya Mtandao:</span>
                  <span className="text-emerald-700 font-extrabold">ACTIVE & READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "external-register") {
      return (
        <div className="p-6 space-y-6">
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b border-primary/20 pb-2">
              Fomu ya Usajili ya Kidigitali (External Patients Online Portal)
            </h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Hili ni dirisha la mteja anayejisajili kupitia tovuti rasmi ya Al-Furqan Herbs Clinic kabla ya kufika kliniki. Data hizi huingia kwenye dokezo la mtandaoni na kupokelewa na mapokezi papo hapo.
            </p>
            <div className="p-5 bg-light-bg rounded-xl border-2 border-dashed border-primary/30 max-w-xl mx-auto space-y-3 text-xs">
              <span className="font-bold text-secondary uppercase block text-center">Fomu ya Mtandao ya Al-Furqan Portal</span>
              <div className="space-y-3">
                <input type="text" placeholder="Jina la Mgonjwa" className="w-full p-2.5 border border-primary rounded bg-white font-semibold" />
                <input type="text" placeholder="Namba ya Simu" className="w-full p-2.5 border border-primary rounded bg-white font-semibold" />
                <textarea placeholder="Andika Malalamiko Yako ya Afya Hapa..." rows={3} className="w-full p-2.5 border border-primary rounded bg-white font-semibold" />
                <button onClick={() => alert("Asante! Ombi lako la usajili limepokelewa salama mtandaoni. Namba yako ya kumbukumbu ni ONLINE-029.")} className="w-full p-2.5 bg-secondary text-white font-bold rounded cursor-pointer uppercase">
                  Sabmiti Usajili (Online Register)
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "external-list") {
      return (
        <div className="p-6 space-y-6">
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b border-primary/20 pb-2">
              Orodha Ya Usajili Mtandaoni (External Patient Submissions)
            </h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Hii ni orodha ya maombi mapya kutoka kwa wagonjwa waliojisajili kupitia tovuti ya mtandaoni.
            </p>
            <div className="table-responsive text-xs font-semibold">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-primary/20">
                    <th className="p-3">Namba ya Kumbukumbu</th>
                    <th className="p-3">Jina la Mteja</th>
                    <th className="p-3">Simu ya Mkononi</th>
                    <th className="p-3">Malalamiko (Symptom Description)</th>
                    <th className="p-3">Hadhi ya Mapokezi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-light-bg/50">
                    <td className="p-3 font-mono font-bold text-secondary">ONLINE-029</td>
                    <td className="p-3 text-primary uppercase">Salim Athumani</td>
                    <td className="p-3">0718293021</td>
                    <td className="p-3 font-semibold text-gray-600">Maumivu makali ya goti la kulia kuanzia asubuhi.</td>
                    <td className="p-3">
                      <button onClick={() => alert("Mgonjwa ameingizwa kwenye mfumo mkuu wa usajili.")} className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded">
                        Approve & Register
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "external-master") {
      return (
        <div className="p-6 space-y-6">
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b border-primary/20 pb-2">
              Database Kuu (.html / Data Explorer Master Registry)
            </h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Daktari anaweza kufungua orodha kuu ya faili za kidigitali ili kutunza historia ya maisha yote ya wagonjwa waliosajiliwa Al-Furqan.
            </p>
            <div className="table-responsive text-xs font-semibold">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-primary/20">
                    <th className="p-3">Patient Card</th>
                    <th className="p-3">Jina la Mgonjwa</th>
                    <th className="p-3">Age / Jinsia</th>
                    <th className="p-3">City Address</th>
                    <th className="p-3">Biometrics Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patients.map(p => (
                    <tr key={p.id} className="hover:bg-light-bg/50">
                      <td className="p-3 font-mono font-bold text-secondary">{p.cardNumber}</td>
                      <td className="p-3 text-primary uppercase">{p.name}</td>
                      <td className="p-3">{p.age} Yrs / {p.gender}</td>
                      <td className="p-3">{p.address}</td>
                      <td className="p-3">
                        <span className="text-emerald-700 font-bold">100% Secured</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess} 
        initialAttempts={loginAttempts} 
        onIncrementAttempts={handleIncrementAttempts} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-light-bg flex">
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content frame container */}
      <div className="flex-1 lg:pl-[280px] flex flex-col min-h-screen">
        
        {/* Header toolbar */}
        <Header 
          pageTitle={getPageTitle()} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          username={username} 
          userRole={userRole} 
          onLogout={handleLogout} 
          sessionTimeRemaining={sessionTimeRemaining} 
        />

        {/* Dynamic Inner View Switcher */}
        <main className="flex-1 pb-16">
          {activeTab === "dashboard" && (
            <DashboardView 
              patients={patients} 
              appointments={appointments}
              medicines={medicines} 
              invoices={invoices}
              auditLogs={auditLogs}
              onQuickAction={setActiveTab}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            />
          )}

          {activeTab === "patients" && (
            <PatientsView 
              patients={patients} 
              onAddPatient={handleAddPatient} 
              onDeletePatient={handleDeletePatient} 
            />
          )}

          {activeTab === "records" && (
            <MedicalRecordsView 
              patients={patients} 
              records={records} 
              onAddRecord={handleAddRecord} 
            />
          )}

          {activeTab === "consultation" && (
            <ConsultationView 
              patients={patients} 
              consultations={consultations} 
              onAddConsultation={handleAddConsultation} 
            />
          )}

          {activeTab === "pharmacy" && (
            <PharmacyView 
              medicines={medicines} 
              onAddMedicine={handleAddMedicine} 
              onUpdateStock={handleUpdateStock} 
            />
          )}

          {activeTab === "lab" && (
            <LabView 
              patients={patients} 
              labRecords={labRecords} 
              onAddLabRecord={handleAddLabRecord} 
              onUpdateLabReview={handleUpdateLabReview} 
            />
          )}

          {activeTab === "books" && renderSpecialView()}
          {activeTab === "communication" && renderSpecialView()}
          {activeTab === "external-register" && renderSpecialView()}
          {activeTab === "external-list" && renderSpecialView()}
          {activeTab === "external-master" && renderSpecialView()}

          {activeTab === "sales" && (
            <BillingView 
              patients={patients} 
              invoices={invoices} 
              onAddInvoice={handleAddInvoice} 
              onPayInvoice={handlePayInvoice} 
            />
          )}

          {activeTab === "settings" && (
            <SettingsView 
              onRestoreBackup={handleRestoreBackup} 
              patients={patients} 
              records={records} 
              consultations={consultations} 
              medicines={medicines} 
              invoices={invoices} 
            />
          )}
        </main>

      </div>
    </div>
  );
}
