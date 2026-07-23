import React, { useState } from "react";
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  CreditCard, 
  Stethoscope, 
  FileText, 
  Pill, 
  Calendar, 
  FlaskConical, 
  CheckSquare, 
  ShoppingBag, 
  Boxes, 
  Truck, 
  Receipt, 
  DollarSign, 
  BookOpen, 
  Tag, 
  BarChart3, 
  Send, 
  Settings, 
  UserCheck, 
  ShieldCheck, 
  ChevronDown, 
  ChevronRight, 
  Sparkles,
  HeartHandshake
} from "lucide-react";

export type NavSubView = 
  | "dashboard"
  | "patients_register"
  | "patients_list"
  | "patients_cards"
  | "doctor_consultation"
  | "doctor_diagnosis"
  | "doctor_prescription"
  | "doctor_followup"
  | "lab_tests"
  | "lab_results"
  | "pharmacy_drugs"
  | "pharmacy_sales"
  | "pharmacy_stock"
  | "pharmacy_suppliers"
  | "billing_payments"
  | "billing_invoices"
  | "herbal_remedies"
  | "herbal_books"
  | "herbal_promos"
  | "reports"
  | "broadcast"
  | "settings_config"
  | "settings_staff"
  | "settings_logs";

interface SidebarNavProps {
  activeNav: NavSubView;
  onSelectNav: (nav: NavSubView) => void;
  patientCount: number;
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  currentRole: string;
}

export function SidebarNav({ 
  activeNav, 
  onSelectNav, 
  patientCount, 
  isOpen, 
  onClose,
  currentUser,
  currentRole
}: SidebarNavProps) {
  // Track open accordion sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    patients: true,
    doctor: true,
    lab: false,
    pharmacy: false,
    billing: false,
    herbal: false,
    settings: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isNavActive = (views: NavSubView[]) => views.includes(activeNav);

  const navClass = (view: NavSubView) =>
    `w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
      activeNav === view
        ? "bg-[#D6145A] text-white shadow-md font-black"
        : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
    }`;

  const categoryHeaderClass = (section: string, activeViews: NavSubView[]) =>
    `w-full text-left px-3.5 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between cursor-pointer ${
      isNavActive(activeViews)
        ? "bg-slate-800 text-rose-400 border-l-4 border-[#D6145A]"
        : "text-slate-300 hover:bg-slate-800/50"
    }`;

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-full w-72 bg-[#0F2D3E] text-white flex flex-col transition-transform duration-300 border-r border-slate-700/50 shadow-2xl ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Clinic Logo and Title */}
      <div className="p-4 border-b border-slate-700/60 flex items-center justify-between bg-[#0b222f]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D6145A] to-rose-700 text-white flex items-center justify-center font-black text-lg shadow-md border border-rose-400/30">
            AF
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-white font-display tracking-wide uppercase">AL-FURQAN CLINIC</h2>
            <p className="text-[10px] text-rose-300 font-bold tracking-wider uppercase">HIS Management System</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* User Info Header */}
      <div className="px-4 py-2.5 bg-slate-800/50 border-b border-slate-700/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-200">{currentUser}</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/80 text-rose-300 font-mono font-bold border border-rose-800/50">
          {currentRole}
        </span>
      </div>

      {/* Navigation Accordion List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">

        {/* 1. Dashboard */}
        <button
          onClick={() => { onSelectNav("dashboard"); onClose(); }}
          className={navClass("dashboard")}
        >
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-4 h-4 text-rose-400" />
            <span>Dashboard (Dhibiti)</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </button>

        {/* 2. Usajili wa Wagonjwa */}
        <div>
          <button
            onClick={() => toggleSection("patients")}
            className={categoryHeaderClass("patients", ["patients_register", "patients_list", "patients_cards"])}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Usajili wa Wagonjwa</span>
            </div>
            {openSections.patients ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>

          {openSections.patients && (
            <div className="ml-3 pl-2.5 border-l border-slate-700/60 my-1 space-y-1">
              <button onClick={() => { onSelectNav("patients_register"); onClose(); }} className={navClass("patients_register")}>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sajili Mgonjwa</span>
                </div>
              </button>

              <button onClick={() => { onSelectNav("patients_list"); onClose(); }} className={navClass("patients_list")}>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>Orodha ya Wagonjwa</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold rounded">
                  {patientCount}
                </span>
              </button>

              <button onClick={() => { onSelectNav("patients_cards"); onClose(); }} className={navClass("patients_cards")}>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Kadi za Plastiki / Premium</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 3. Huduma za Daktari */}
        <div>
          <button
            onClick={() => toggleSection("doctor")}
            className={categoryHeaderClass("doctor", ["doctor_consultation", "doctor_diagnosis", "doctor_prescription", "doctor_followup"])}
          >
            <div className="flex items-center gap-2.5">
              <Stethoscope className="w-4 h-4 text-sky-400" />
              <span>Huduma za Daktari</span>
            </div>
            {openSections.doctor ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>

          {openSections.doctor && (
            <div className="ml-3 pl-2.5 border-l border-slate-700/60 my-1 space-y-1">
              <button onClick={() => { onSelectNav("doctor_consultation"); onClose(); }} className={navClass("doctor_consultation")}>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Consultation & Vitals</span>
                </div>
              </button>

              <button onClick={() => { onSelectNav("doctor_diagnosis"); onClose(); }} className={navClass("doctor_diagnosis")}>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Diagnosis & Uchunguzi</span>
                </div>
              </button>

              <button onClick={() => { onSelectNav("doctor_prescription"); onClose(); }} className={navClass("doctor_prescription")}>
                <div className="flex items-center gap-2">
                  <Pill className="w-3.5 h-3.5" />
                  <span>Prescription / Matibabu</span>
                </div>
              </button>

              <button onClick={() => { onSelectNav("doctor_followup"); onClose(); }} className={navClass("doctor_followup")}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Follow Up & Marejeo</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 4. Maabara (Laboratory) */}
        <div>
          <button
            onClick={() => toggleSection("lab")}
            className={categoryHeaderClass("lab", ["lab_tests", "lab_results"])}
          >
            <div className="flex items-center gap-2.5">
              <FlaskConical className="w-4 h-4 text-purple-400" />
              <span>Maabara (Laboratory)</span>
            </div>
            {openSections.lab ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>

          {openSections.lab && (
            <div className="ml-3 pl-2.5 border-l border-slate-700/60 my-1 space-y-1">
              <button onClick={() => { onSelectNav("lab_tests"); onClose(); }} className={navClass("lab_tests")}>
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Omba Vipimo vya Maabara</span>
                </div>
              </button>

              <button onClick={() => { onSelectNav("lab_results"); onClose(); }} className={navClass("lab_results")}>
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Matokeo ya Vipimo</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 5. Pharmacy */}
        <div>
          <button
            onClick={() => toggleSection("pharmacy")}
            className={categoryHeaderClass("pharmacy", ["pharmacy_drugs", "pharmacy_sales", "pharmacy_stock", "pharmacy_suppliers"])}
          >
            <div className="flex items-center gap-2.5">
              <Pill className="w-4 h-4 text-amber-400" />
              <span>Pharmacy & Stock</span>
            </div>
            {openSections.pharmacy ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>

          {openSections.pharmacy && (
            <div className="ml-3 pl-2.5 border-l border-slate-700/60 my-1 space-y-1">
              <button onClick={() => { onSelectNav("pharmacy_drugs"); onClose(); }} className={navClass("pharmacy_drugs")}>
                <div className="flex items-center gap-2">
                  <Pill className="w-3.5 h-3.5" />
                  <span>Orodha ya Dawa</span>
                </div>
              </button>

              <button onClick={() => { onSelectNav("pharmacy_sales"); onClose(); }} className={navClass("pharmacy_sales")}>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Mauzo ya Dawa (POS)</span>
                </div>
              </button>

              <button onClick={() => { onSelectNav("pharmacy_stock"); onClose(); }} className={navClass("pharmacy_stock")}>
                <div className="flex items-center gap-2">
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Usimamizi wa Stoki</span>
                </div>
              </button>

              <button onClick={() => { onSelectNav("pharmacy_suppliers"); onClose(); }} className={navClass("pharmacy_suppliers")}>
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Suppliers / Wauzaji</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 6. Billing & Malipo */}
        <div>
          <button
            onClick={() => toggleSection("billing")}
            className={categoryHeaderClass("billing", ["billing_payments", "billing_invoices"])}
          >
            <div className="flex items-center gap-2.5">
              <DollarSign className="w-4 h-4 text-teal-400" />
              <span>Billing & Malipo</span>
            </div>
            {openSections.billing ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>

          {openSections.billing && (
            <div className="ml-3 pl-2.5 border-l border-slate-700/60 my-1 space-y-1">
              <button onClick={() => { onSelectNav("billing_payments"); onClose(); }} className={navClass("billing_payments")}>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Malipo (Cash/Mobile/NHIF)</span>
                </div>
              </button>

              <button onClick={() => { onSelectNav("billing_invoices"); onClose(); }} className={navClass("billing_invoices")}>
                <div className="flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Ankara (Invoices)</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 7. Tiba Asili & Vitabu */}
        <div>
          <button
            onClick={() => toggleSection("herbal")}
            className={categoryHeaderClass("herbal", ["herbal_remedies", "herbal_books", "herbal_promos"])}
          >
            <div className="flex items-center gap-2.5">
              <HeartHandshake className="w-4 h-4 text-rose-300" />
              <span>Tiba Asili & Vitabu</span>
            </div>
            {openSections.herbal ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>

          {openSections.herbal && (
            <div className="ml-3 pl-2.5 border-l border-slate-700/60 my-1 space-y-1">
              <button onClick={() => { onSelectNav("herbal_remedies"); onClose(); }} className={navClass("herbal_remedies")}>
                <div className="flex items-center gap-2">
                  <Pill className="w-3.5 h-3.5" />
                  <span>Dawa za Miti Shamba</span>
                </div>
              </button>

              <button onClick={() => { onSelectNav("herbal_books"); onClose(); }} className={navClass("herbal_books")}>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Maktaba & Mauzo ya Vitabu</span>
                </div>
              </button>

              <button onClick={() => { onSelectNav("herbal_promos"); onClose(); }} className={navClass("herbal_promos")}>
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Ofa na Promotions</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 8. Ripoti na Takwimu */}
        <button
          onClick={() => { onSelectNav("reports"); onClose(); }}
          className={navClass("reports")}
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-amber-300" />
            <span>Ripoti & Takwimu</span>
          </div>
        </button>

        {/* 9. SMS & WhatsApp Broadcast */}
        <button
          onClick={() => { onSelectNav("broadcast"); onClose(); }}
          className={navClass("broadcast")}
        >
          <div className="flex items-center gap-2.5">
            <Send className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>SMS & WhatsApp Broadcast</span>
          </div>
          <span className="px-1.5 py-0.5 text-[9px] bg-rose-500 text-white font-bold rounded">
            OASIS
          </span>
        </button>

        {/* 10. Mipangilio & Wafanyakazi */}
        <div>
          <button
            onClick={() => toggleSection("settings")}
            className={categoryHeaderClass("settings", ["settings_config", "settings_staff", "settings_logs"])}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-slate-300" />
              <span>Mipangilio & System</span>
            </div>
            {openSections.settings ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>

          {openSections.settings && (
            <div className="ml-3 pl-2.5 border-l border-slate-700/60 my-1 space-y-1">
              <button onClick={() => { onSelectNav("settings_config"); onClose(); }} className={navClass("settings_config")}>
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Oasis API & Firebase Config</span>
                </div>
              </button>

              <button onClick={() => { onSelectNav("settings_staff"); onClose(); }} className={navClass("settings_staff")}>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Wafanyakazi & Permissions</span>
                </div>
              </button>

              <button onClick={() => { onSelectNav("settings_logs"); onClose(); }} className={navClass("settings_logs")}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Audit Logs & Backup</span>
                </div>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Footer Branding */}
      <div className="p-3 border-t border-slate-800 bg-[#081a24] text-[10px] text-slate-400 text-center font-mono">
        Al-Furqan Clinic HIS v2.5
      </div>
    </aside>
  );
}

export default SidebarNav;
