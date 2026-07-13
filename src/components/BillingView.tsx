import React, { useState } from "react";
import { FileText, Plus, Receipt, Trash2, Printer, CheckCircle, Percent, Coins, ShieldCheck } from "lucide-react";
import { Patient, Invoice } from "../types";

interface BillingViewProps {
  patients: Patient[];
  invoices: Invoice[];
  onAddInvoice: (newInvoice: Invoice) => void;
  onPayInvoice: (id: string) => void;
}

export default function BillingView({ patients, invoices, onAddInvoice, onPayInvoice }: BillingViewProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || "");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<Invoice["paymentMethod"]>("Cash");
  const [insuranceProvider, setInsuranceProvider] = useState("");

  // Invoice items constructor
  const [items, setItems] = useState<{ description: string; amount: number }[]>([
    { description: "Sajili na Kadi ya Premium (Hospital ID)", amount: 20000 }
  ]);
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");

  const handleAddItem = () => {
    const amt = parseFloat(newItemAmount);
    if (!newItemDesc.trim() || isNaN(amt) || amt <= 0) {
      alert("Tafadhali ingiza jina na bei halali ya huduma.");
      return;
    }
    setItems([...items, { description: newItemDesc, amount: amt }]);
    setNewItemDesc("");
    setNewItemAmount("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const sum = items.reduce((acc, item) => acc + item.amount, 0);
    const discVal = parseFloat(discount) || 0;
    const finalVal = sum - discVal;
    return {
      gross: sum,
      discount: discVal,
      net: finalVal > 0 ? finalVal : 0
    };
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    const pat = patients.find(p => p.id === selectedPatientId);
    if (!pat) return;

    const totals = calculateTotal();
    const invoiceId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const controlNo = `99026${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newInv: Invoice = {
      id: invoiceId,
      patientId: selectedPatientId,
      patientName: pat.name,
      date: new Date().toISOString().split("T")[0],
      items,
      discount: totals.discount,
      insuranceProvider: paymentMethod === "Insurance" ? (insuranceProvider || "NHIF") : "",
      paymentMethod,
      controlNumber: controlNo,
      status: "Paid", // Automatically completes payments in this simplified sandbox environment
      total: totals.gross,
      netAmount: totals.net
    };

    onAddInvoice(newInv);
    alert(`Risiti ya malipo ${newInv.id} imetengenezwa! Namba ya Malipo (Control Number) ni ${newInv.controlNumber}.`);

    // Reset items builder
    setItems([{ description: "Sajili na Kadi ya Premium (Hospital ID)", amount: 20000 }]);
    setDiscount("0");
  };

  const totals = calculateTotal();

  return (
    <div className="p-6 space-y-6">
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Billing History and Receipt Viewer */}
        <div className="xl:col-span-2 bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-primary/20 pb-3">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-5 h-5 text-secondary animate-pulse" />
              Miamala na Risiti (Paid Invoices & Receipts Ledger)
            </h3>
            <span className="bg-primary text-white text-xs px-2.5 py-0.5 rounded font-mono font-bold">
              Invoices {invoices.length}
            </span>
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4 bg-light-bg rounded-xl border-2 border-primary/10 space-y-3">
                <div className="flex items-start justify-between border-b border-primary/10 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-primary uppercase font-display">
                      {inv.patientName} (Receipt Reference)
                    </h4>
                    <p className="text-[10px] text-gray-500 font-bold font-mono">
                      Invoice No: {inv.id} • Tarehe: {inv.date} • Njia ya Malipo: <span className="text-secondary font-extrabold uppercase">{inv.paymentMethod}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 bg-primary hover:bg-secondary text-white rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Receipt
                  </button>
                </div>

                {/* Items layout */}
                <div className="bg-white p-3 rounded-lg border border-primary/10 space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between border-b border-gray-100 pb-1 text-[10px] text-gray-400 uppercase font-bold">
                    <span>Maelezo ya Huduma</span>
                    <span>Kiasi (TZS)</span>
                  </div>
                  {inv.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-primary">
                      <span>{item.description}</span>
                      <span className="font-mono">{item.amount.toLocaleString()} TZS</span>
                    </div>
                  ))}
                  
                  {inv.discount > 0 && (
                    <div className="flex justify-between text-secondary pt-1 border-t border-gray-100 font-bold">
                      <span>Punguzo (Discount):</span>
                      <span className="font-mono">-{inv.discount.toLocaleString()} TZS</span>
                    </div>
                  )}

                  <div className="flex justify-between text-primary pt-1.5 border-t-2 border-dashed border-primary/20 text-sm font-extrabold">
                    <span>JUMLA KUU:</span>
                    <span className="text-secondary font-mono">{inv.netAmount.toLocaleString()} TZS</span>
                  </div>
                </div>

                {/* Government Control Number Section for maximum realism */}
                <div className="p-2.5 bg-primary text-white rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] font-medium">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                    <span>Namba ya Malipo Serikalini (Control Number):</span>
                  </div>
                  <span className="font-mono font-black text-secondary text-xs tracking-wider">
                    {inv.controlNumber}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Build New Invoice Form */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b-2 border-secondary pb-2">
            Andaa Ankara Mpya (Bill Patient)
          </h3>

          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-primary mb-1">Mgonjwa *</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                required
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.cardNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Build Items List */}
            <div className="p-3 bg-light-bg rounded-lg border border-primary/20 space-y-3 text-xs">
              <span className="font-extrabold text-primary uppercase block text-[10px]">Huduma Zilizochaguliwa</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] font-semibold bg-white p-2 rounded border border-primary/5">
                    <span className="text-primary uppercase truncate max-w-[120px]">{item.description}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-secondary">{item.amount.toLocaleString()} TZS</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-primary hover:text-secondary"
                        title="Ondoa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add item fields */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/10">
                <input
                  type="text"
                  placeholder="Maelezo ya Huduma"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="p-1.5 border border-primary/30 rounded bg-white text-[11px] font-semibold"
                />
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    placeholder="Bei (TZS)"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    className="p-1.5 border border-primary/30 rounded bg-white text-[11px] font-mono font-semibold w-full"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="p-1.5 bg-primary text-white rounded font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col">
                <label className="font-bold text-primary mb-1">Njia ya Malipo</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as Invoice["paymentMethod"])}
                  className="p-2.5 border-2 border-primary rounded-lg font-semibold bg-white"
                >
                  <option value="Cash">Cash (Mkononi)</option>
                  <option value="Mobile Money">Mobile Money (M-Pesa/Airtel)</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Insurance">Bima (Insurance)</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-primary mb-1">Punguzo (Discount TZS)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg font-semibold font-mono"
                  placeholder="0"
                />
              </div>
            </div>

            {paymentMethod === "Insurance" && (
              <div className="flex flex-col text-xs">
                <label className="font-bold text-primary mb-1">Kampuni ya Bima</label>
                <input
                  type="text"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg font-semibold"
                  placeholder="Mf. NHIF au AAR"
                />
              </div>
            )}

            {/* Calculations summaries */}
            <div className="p-3 bg-primary/5 rounded-lg border-2 border-dashed border-primary/30 space-y-1.5 text-xs font-semibold text-gray-700">
              <div className="flex justify-between">
                <span>Gross Total:</span>
                <span className="font-mono">{totals.gross.toLocaleString()} TZS</span>
              </div>
              <div className="flex justify-between text-secondary font-bold">
                <span>Discount:</span>
                <span className="font-mono">-{totals.discount.toLocaleString()} TZS</span>
              </div>
              <div className="flex justify-between text-primary text-sm font-extrabold pt-1 border-t border-primary/10">
                <span>Net Payable:</span>
                <span className="text-secondary font-mono">{totals.net.toLocaleString()} TZS</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-3.5 bg-secondary hover:bg-primary border-2 border-secondary hover:border-primary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow"
            >
              <Receipt className="w-4 h-4" />
              Kamilisha Ankara & Toa Risiti (Generate Receipt)
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
