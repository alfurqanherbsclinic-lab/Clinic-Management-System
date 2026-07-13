import React, { useState } from "react";
import { Pill, Plus, Minus, Search, AlertTriangle, ShieldCheck, Printer, FileText, Filter, CheckCircle2 } from "lucide-react";
import { Medicine } from "../types";

interface PharmacyViewProps {
  medicines: Medicine[];
  onAddMedicine: (newMed: Medicine) => void;
  onUpdateStock: (id: string, qtyChange: number) => void;
}

export default function PharmacyView({ medicines, onAddMedicine, onUpdateStock }: PharmacyViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Form states for adding a new medicine
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Mafuta ya Tiba");
  const [qty, setQty] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [supplier, setSupplier] = useState("Al-Furqan Pharmacy Supplies");
  const [lowStockAlert, setLowStockAlert] = useState("10");

  // Stock adjustment state
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState("");

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMed: Medicine = {
      id: `MED-${Math.floor(100 + Math.random() * 900)}`,
      name,
      category,
      qty: parseInt(qty) || 50,
      batchNumber: batchNumber || `B-HB${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      supplier,
      lowStockAlert: parseInt(lowStockAlert) || 10
    };

    onAddMedicine(newMed);
    alert(`Dawa ${newMed.name} imeongezwa kikamilifu kwenye Stoki.`);

    // Clear form
    setName("");
    setQty("");
    setBatchNumber("");
    setExpiryDate("");
    setLowStockAlert("10");
  };

  const handleStockAdjustment = (id: string, method: "IN" | "OUT") => {
    const amount = parseInt(adjustQty);
    if (isNaN(amount) || amount <= 0) {
      alert("Tafadhali ingiza kiwango halali.");
      return;
    }
    const finalChange = method === "IN" ? amount : -amount;
    onUpdateStock(id, finalChange);
    setAdjustingId(null);
    setAdjustQty("");
    alert("Stoki imesasishwa kikamilifu!");
  };

  // Expiry Check helpers
  const checkExpiryStatus = (expStr: string) => {
    const expDate = new Date(expStr);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: "Expired", color: "bg-red-100 text-red-800 border-red-300" };
    if (diffDays <= 90) return { label: `Expiring Soon (${diffDays} days)`, color: "bg-amber-100 text-amber-800 border-amber-300" };
    return { label: "Safe", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  };

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Mafuta ya Tiba", "Asali & Virutubisho", "Mimea Tiba Kavu", "Vidonge Lishe", "Mengineyo"];

  return (
    <div className="p-6 space-y-6">
      
      {/* Search Header and Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Search Input Card */}
        <div className="bg-white p-4 rounded-xl border-2 border-primary shadow-sm md:col-span-2 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-60" />
            <input
              type="text"
              placeholder="Tafuta dawa kwa jina au Batch Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 p-2.5 bg-white border-2 border-primary rounded-lg text-xs font-semibold outline-none"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === "All" ? "Kundi Zote" : c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Warning Card */}
        <div className="bg-amber-50 border-l-4 border-secondary p-4 rounded-xl flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <div className="space-y-1 text-primary">
            <p className="font-extrabold uppercase">Taarifa za Usalama wa Stoki</p>
            <p className="font-medium text-gray-700">
              Kuna <span className="font-bold text-secondary">{medicines.filter(m => m.qty <= m.lowStockAlert).length} dawa</span> chini ya kiwango cha chini!
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Medicine Catalogue Table */}
        <div className="xl:col-span-2 bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-primary/20 pb-3">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-5 h-5 text-secondary animate-pulse" />
              Katalogi ya Dawa (Medicine Inventory Database)
            </h3>
            <span className="bg-primary text-white text-xs px-2.5 py-0.5 rounded font-mono font-bold">
              Stoki {filteredMedicines.length} Dawa
            </span>
          </div>

          <div className="table-responsive">
            <table className="text-left w-full">
              <thead>
                <tr>
                  <th className="p-3 text-xs">ID & Dawa</th>
                  <th className="p-3 text-xs">Kundi (Category)</th>
                  <th className="p-3 text-xs">Idadi (Stock Qty)</th>
                  <th className="p-3 text-xs">Batch & Expiry</th>
                  <th className="p-3 text-xs">Supplier & Status</th>
                  <th className="p-3 text-xs">Marekebisho (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-semibold">
                {filteredMedicines.map((m) => {
                  const expiry = checkExpiryStatus(m.expiryDate);
                  const isLow = m.qty <= m.lowStockAlert;
                  return (
                    <tr key={m.id} className="hover:bg-light-bg/50">
                      <td className="p-3">
                        <div className="font-bold text-primary uppercase">{m.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{m.id}</div>
                      </td>
                      <td className="p-3 text-gray-600">{m.category}</td>
                      <td className="p-3">
                        <span className={`font-black font-mono text-sm px-2 py-0.5 rounded ${
                          isLow ? "bg-red-100 text-secondary border border-secondary/30" : "text-primary"
                        }`}>
                          {m.qty} Units
                        </span>
                        {isLow && (
                          <span className="block text-[8px] text-secondary font-black uppercase mt-1">Stoki Ipo Chini!</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-[10px] text-gray-600">Batch: {m.batchNumber}</div>
                        <div className={`mt-1 inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border ${expiry.color}`}>
                          {expiry.label}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-500 max-w-[120px] truncate">{m.supplier}</div>
                        <div className="text-[9px] text-primary/50 font-mono mt-0.5">SSL Secured Logs</div>
                      </td>
                      <td className="p-3">
                        {adjustingId === m.id ? (
                          <div className="flex flex-col gap-1.5 p-2 bg-light-bg rounded border border-primary/20">
                            <input
                              type="number"
                              value={adjustQty}
                              onChange={(e) => setAdjustQty(e.target.value)}
                              className="p-1 text-xs border border-primary rounded w-20 font-mono"
                              placeholder="Kiasi"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleStockAdjustment(m.id, "IN")}
                                className="px-1.5 py-0.5 bg-emerald-600 text-white font-bold rounded text-[10px]"
                              >
                                IN
                              </button>
                              <button
                                onClick={() => handleStockAdjustment(m.id, "OUT")}
                                className="px-1.5 py-0.5 bg-secondary text-white font-bold rounded text-[10px]"
                              >
                                OUT
                              </button>
                              <button
                                onClick={() => setAdjustingId(null)}
                                className="px-1.5 py-0.5 bg-gray-300 text-primary font-bold rounded text-[10px]"
                              >
                                X
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAdjustingId(m.id);
                              setAdjustQty("");
                            }}
                            className="px-2 py-1 bg-primary hover:bg-secondary text-white font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            Marekebisho
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Register/Add New Medicine Form */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b-2 border-secondary pb-2">
            Ingiza Dawa Mpya (Stock In Entry)
          </h3>

          <form onSubmit={handleAddMedicine} className="space-y-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-primary mb-1">Jina la Dawa / Kiungo *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                placeholder="Mf. Unga wa Uwatu (Fenugreek)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-primary mb-1">Kundi la Dawa</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="Mafuta ya Tiba">Mafuta ya Tiba</option>
                  <option value="Asali & Virutubisho">Asali & Virutubisho</option>
                  <option value="Mimea Tiba Kavu">Mimea Tiba Kavu</option>
                  <option value="Vidonge Lishe">Vidonge Lishe</option>
                  <option value="Mengineyo">Mengineyo</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-primary mb-1">Idadi ya Kuingiza *</label>
                <input
                  type="number"
                  required
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold font-mono"
                  placeholder="Mf. 50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-primary mb-1">Nambari ya Batch</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold font-mono"
                  placeholder="Mf. B-HB2026"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-primary mb-1">Muda wa Kuisha *</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-primary mb-1">Mtoa Huduma (Supplier)</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                  placeholder="Supplier"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-primary mb-1">Low Stock Limit</label>
                <input
                  type="number"
                  value={lowStockAlert}
                  onChange={(e) => setLowStockAlert(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-3.5 bg-secondary hover:bg-primary border-2 border-secondary hover:border-primary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              Ongeza Kwenye Stoki (Save Medicine)
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
