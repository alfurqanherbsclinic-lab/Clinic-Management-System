import React, { useState } from "react";
import { 
  DollarSign, 
  Receipt, 
  Search, 
  Printer, 
  CheckCircle2, 
  Plus, 
  CreditCard,
  FileText
} from "lucide-react";
import { Patient, Invoice } from "../types";

interface BillingModuleProps {
  patients: Patient[];
  activeSubTab?: "billing_payments" | "billing_invoices";
}

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "INV-1001",
    invoiceNumber: "ANK-2026-001",
    patientId: "AF-001",
    patientName: "ALI HASSAN",
    patientPhone: "0712345678",
    date: new Date().toISOString().split("T")[0],
    items: [
      { description: "Registration & Patient Card Fee", amount: 10000 },
      { description: "Doctor Consultation Fee", amount: 15000 },
      { description: "Full Blood Picture Lab Test", amount: 15000 }
    ],
    totalAmount: 40000,
    paidAmount: 40000,
    status: "Paid",
    paymentMethod: "NHIF Insurance"
  },
  {
    id: "INV-1002",
    invoiceNumber: "ANK-2026-002",
    patientId: "AF-002",
    patientName: "AMINA OMARI",
    patientPhone: "0755889922",
    date: new Date().toISOString().split("T")[0],
    items: [
      { description: "Doctor Consultation Fee", amount: 15000 },
      { description: "Widal Test (Typhoid)", amount: 10000 }
    ],
    totalAmount: 25000,
    paidAmount: 0,
    status: "Pending",
    paymentMethod: "Cash"
  }
];

export function BillingModule({ patients, activeSubTab = "billing_payments" }: BillingModuleProps) {
  const [subTab, setSubTab] = useState<"billing_payments" | "billing_invoices">(activeSubTab);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || "");
  const [serviceDesc, setServiceDesc] = useState("Doctor Consultation & Treatment");
  const [serviceAmount, setServiceAmount] = useState("25000");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleCreateInvoice = () => {
    if (!selectedPatient) return;
    const amt = parseFloat(serviceAmount) || 20000;
    const newInv: Invoice = {
      id: "INV-" + (invoices.length + 1001),
      invoiceNumber: "ANK-2026-" + (invoices.length + 1).toString().padStart(3, "0"),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientPhone: selectedPatient.phone,
      date: new Date().toISOString().split("T")[0],
      items: [
        { description: serviceDesc, amount: amt }
      ],
      totalAmount: amt,
      paidAmount: amt,
      status: "Paid",
      paymentMethod
    };

    setInvoices(prev => [newInv, ...prev]);
    setSuccessMsg(`Ankara/Risiti #${newInv.invoiceNumber} ya TZS ${amt.toLocaleString()} imelipwa na kuhifadhiwa!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handlePayPending = (invId: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invId) {
        return { ...inv, paidAmount: inv.totalAmount, status: "Paid" };
      }
      return inv;
    }));
    setSuccessMsg("Malipo ya ankara yamekamilika kwa 100%!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filteredInvoices = invoices.filter(i => 
    i.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-5 rounded-2xl border-2 border-primary/20 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-black font-display text-primary uppercase flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-teal-600" />
            <span>BILLING, MALIPO NA ANKARA (FINANCIAL SERVICES)</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Usimamizi wa Risiti, Ankara za Hospitali na Bima (NHIF/AAR)</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Financial Summary</span>
        </button>
      </div>

      {/* SubTab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <button
          onClick={() => setSubTab("billing_payments")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === "billing_payments" ? "bg-teal-700 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>1. Mapokezi ya Malipo & Risiti</span>
        </button>

        <button
          onClick={() => setSubTab("billing_invoices")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
            subTab === "billing_invoices" ? "bg-teal-700 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>2. Ankara (Invoices)</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl text-emerald-900 text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SubTab 1: Payment Reception */}
      {subTab === "billing_payments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-black text-primary uppercase">Fomu ya Kupokea Malipo:</h3>

            <div>
              <label className="text-xs font-bold text-primary block mb-1">Chagua Mgonjwa:</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-2.5 border-2 border-primary/30 rounded-lg text-xs font-bold bg-white text-primary"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name.toUpperCase()} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-primary block mb-1">Maelezo ya Huduma / Ankara:</label>
              <input
                type="text"
                value={serviceDesc}
                onChange={(e) => setServiceDesc(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-primary block mb-1">Kiasi cha Pesa (TZS):</label>
              <input
                type="number"
                value={serviceAmount}
                onChange={(e) => setServiceAmount(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-black font-mono text-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-primary block mb-1">Njia ya Malipo:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
              >
                <option value="Cash">Cash (Pesa Taslimu)</option>
                <option value="Mobile Money (M-Pesa/TigoPesa)">Mobile Money (M-Pesa / Tigo Pesa)</option>
                <option value="NHIF Insurance">NHIF Insurance</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <button
              onClick={handleCreateInvoice}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Receipt className="w-4 h-4" />
              <span>Thibitisha Malipo & Toa Risiti</span>
            </button>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-black text-primary uppercase">Historia ya Risiti na Ankara:</h3>
            <div className="space-y-2">
              {invoices.map(inv => (
                <div key={inv.id} className="p-3 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-primary">{inv.patientName}</span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded font-mono">
                        {inv.invoiceNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold mt-0.5">{inv.items.map(i => i.description).join(", ")}</p>
                    <p className="text-[10px] text-gray-500 font-mono">Simu: {inv.patientPhone} • Njia: {inv.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-black text-sm text-primary">TZS {inv.totalAmount.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase mt-1 ${
                      inv.status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Pending Invoices */}
      {subTab === "billing_invoices" && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-primary uppercase">Ankara Zote na Hali za Malipo:</h3>
          <div className="space-y-3">
            {invoices.map(inv => (
              <div key={inv.id} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-extrabold text-sm text-primary">{inv.invoiceNumber} - {inv.patientName}</p>
                  <p className="text-xs text-slate-700 mt-1">Jumla: <span className="font-mono font-bold">TZS {inv.totalAmount.toLocaleString()}</span> | Imelipwa: <span className="font-mono font-bold text-emerald-700">TZS {inv.paidAmount.toLocaleString()}</span></p>
                </div>
                {inv.status === "Pending" ? (
                  <button
                    onClick={() => handlePayPending(inv.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded cursor-pointer"
                  >
                    Lipa Sasa (TZS {inv.totalAmount.toLocaleString()})
                  </button>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-3 py-1 rounded">
                    PAID IN FULL ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default BillingModule;
