import React, { useState } from "react";
import { 
  Pill, 
  ShoppingBag, 
  Boxes, 
  Truck, 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  Receipt,
  Trash2
} from "lucide-react";
import { PharmacyItem, PharmacySale } from "../types";

interface PharmacyModuleProps {
  activeSubTab?: "pharmacy_drugs" | "pharmacy_sales" | "pharmacy_stock" | "pharmacy_suppliers";
}

const INITIAL_ITEMS: PharmacyItem[] = [
  {
    id: "DRUG-001",
    name: "Habat Soda Pure Oil 100ml",
    category: "Mafuta",
    quantity: 45,
    unit: "Bote",
    unitPrice: 15000,
    supplier: "Al-Furqan Pure Oils Ltd",
    expiryDate: "2028-12-31",
    minStockLevel: 10
  },
  {
    id: "DRUG-002",
    name: "Asali ya Nyuki ya Asili 500ml",
    category: "Tiba Lishe",
    quantity: 30,
    unit: "Bote",
    unitPrice: 20000,
    supplier: "Tabora Natural Honey Co.",
    expiryDate: "2029-06-30",
    minStockLevel: 10
  },
  {
    id: "DRUG-003",
    name: "Dawa ya Tumbo na Gesi (Herbal Powder 250g)",
    category: "Unga wa Miti",
    quantity: 4,
    unit: "Pkts",
    unitPrice: 10000,
    supplier: "Al-Furqan Herbal Farm",
    expiryDate: "2027-05-15",
    minStockLevel: 10
  },
  {
    id: "DRUG-004",
    name: "Amoxicillin Capsules 500mg (10x10)",
    category: "Tablets",
    quantity: 60,
    unit: "Boxes",
    unitPrice: 12000,
    supplier: "Kigoma Pharma Wholesale",
    expiryDate: "2027-10-01",
    minStockLevel: 15
  }
];

export function PharmacyModule({ activeSubTab = "pharmacy_drugs" }: PharmacyModuleProps) {
  const [subTab, setSubTab] = useState<"pharmacy_drugs" | "pharmacy_sales" | "pharmacy_stock" | "pharmacy_suppliers">(activeSubTab);
  const [items, setItems] = useState<PharmacyItem[]>(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");

  // POS Cart State
  const [cart, setCart] = useState<Array<{ item: PharmacyItem; qty: number }>>([]);
  const [customerName, setCustomerName] = useState("Mgonjwa Wa Kawaida");
  const [customerPhone, setCustomerPhone] = useState("07XXXXXXXX");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [salesHistory, setSalesHistory] = useState<PharmacySale[]>([]);
  const [successMsg, setSuccessMsg] = useState("");

  // New Drug Form State
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<PharmacyItem["category"]>("Dawa za Asili");
  const [newItemQty, setNewItemQty] = useState("20");
  const [newItemPrice, setNewItemPrice] = useState("15000");

  const addToCart = (item: PharmacyItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  const cartTotal = cart.reduce((sum, c) => sum + (c.item.unitPrice * c.qty), 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Weka dawa kwenye kikapu kwanza!");
      return;
    }

    const sale: PharmacySale = {
      id: "SALE-" + Date.now().toString().slice(-6),
      patientName: customerName,
      patientPhone: customerPhone,
      date: new Date().toISOString().split("T")[0],
      items: cart.map(c => ({
        itemName: c.item.name,
        quantity: c.qty,
        price: c.item.unitPrice,
        total: c.item.unitPrice * c.qty
      })),
      grandTotal: cartTotal,
      paymentMethod,
      receiptNumber: "REC-2026-" + Math.floor(1000 + Math.random() * 9000)
    };

    // Update stock quantity
    setItems(prev => prev.map(it => {
      const cartMatch = cart.find(c => c.item.id === it.id);
      if (cartMatch) {
        return { ...it, quantity: Math.max(0, it.quantity - cartMatch.qty) };
      }
      return it;
    }));

    setSalesHistory(prev => [sale, ...prev]);
    setCart([]);
    setSuccessMsg(`Mauzo yamekamilika! Risiti namba #${sale.receiptNumber} imetengenezwa.`);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const handleAddNewItem = () => {
    if (!newItemName.trim()) return;
    const newItem: PharmacyItem = {
      id: "DRUG-" + (items.length + 101),
      name: newItemName,
      category: newItemCategory,
      quantity: parseInt(newItemQty) || 10,
      unit: "Bote/Pkts",
      unitPrice: parseFloat(newItemPrice) || 10000,
      supplier: "Al-Furqan Herbs Direct",
      expiryDate: "2028-12-31",
      minStockLevel: 5
    };

    setItems(prev => [newItem, ...prev]);
    setNewItemName("");
    setSuccessMsg(`Dawa mpya '${newItemName}' imeongezwa kwenye stoki!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white p-5 rounded-2xl border-2 border-primary/20 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-black font-display text-primary uppercase flex items-center gap-2">
            <Pill className="w-6 h-6 text-amber-600" />
            <span>DUKA LA DAWA & TIBA ZA ASILI (PHARMACY & POS)</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Usimamizi wa Stoki ya Dawa, Mauzo, Risiti na Wauzaji</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Stock List</span>
        </button>
      </div>

      {/* SubTab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-100 pb-2">
        <button
          onClick={() => setSubTab("pharmacy_drugs")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === "pharmacy_drugs" ? "bg-amber-600 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>1. Orodha ya Dawa</span>
        </button>

        <button
          onClick={() => setSubTab("pharmacy_sales")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === "pharmacy_sales" ? "bg-amber-600 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>2. Mauzo (POS) & Risiti</span>
        </button>

        <button
          onClick={() => setSubTab("pharmacy_stock")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === "pharmacy_stock" ? "bg-amber-600 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>3. Usimamizi wa Stoki</span>
        </button>

        <button
          onClick={() => setSubTab("pharmacy_suppliers")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === "pharmacy_suppliers" ? "bg-amber-600 text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>4. Suppliers (Wauzaji)</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl text-emerald-900 text-xs font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SubTab 1: Drug Inventory */}
      {subTab === "pharmacy_drugs" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tafuta dawa kwa jina au kundi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>
            <div className="text-xs font-mono font-bold text-slate-600">
              Jumla Aina za Dawa: <span className="text-amber-700 font-extrabold">{items.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto border-2 border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-primary font-bold uppercase">
                  <th className="p-3">Jina la Dawa</th>
                  <th className="p-3">Aina</th>
                  <th className="p-3">Kiasi Stoki</th>
                  <th className="p-3">Bei (TZS)</th>
                  <th className="p-3">Muuzaji</th>
                  <th className="p-3 text-right">Kitendo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 font-medium">
                    <td className="p-3 font-extrabold text-slate-900">{item.name}</td>
                    <td className="p-3 text-gray-600 font-semibold">{item.category}</td>
                    <td className="p-3 font-mono font-bold">
                      <span className={item.quantity <= item.minStockLevel ? "text-rose-600 flex items-center gap-1 font-black" : "text-emerald-700"}>
                        {item.quantity} {item.unit}
                        {item.quantity <= item.minStockLevel && <AlertTriangle className="w-3.5 h-3.5" />}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-primary">TZS {item.unitPrice.toLocaleString()}</td>
                    <td className="p-3 text-gray-500">{item.supplier}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          addToCart(item);
                          setSubTab("pharmacy_sales");
                        }}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-all cursor-pointer"
                      >
                        Uza / Dispense
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Sales (POS) */}
      {subTab === "pharmacy_sales" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black text-primary uppercase">Chagua Dawa za Kuuza:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {items.map(it => (
                <div key={it.id} className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-xs text-primary">{it.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono">Stoki: {it.quantity} {it.unit} • TZS {it.unitPrice.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => addToCart(it)}
                    className="px-2.5 py-1 bg-amber-600 text-white font-bold text-xs rounded hover:bg-amber-700 cursor-pointer"
                  >
                    + Weka
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart & Checkout */}
          <div className="bg-slate-50 p-4 rounded-xl border-2 border-amber-300 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-primary uppercase flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              Kikapu cha Mauzo ({cart.length})
            </h3>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Jina la Mgonjwa / Mteja:</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs font-semibold bg-white"
              />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cart.map(c => (
                <div key={c.item.id} className="p-2 bg-white rounded border flex items-center justify-between text-xs font-semibold">
                  <div>
                    <p className="font-extrabold text-primary">{c.item.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{c.qty} x TZS {c.item.unitPrice.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-secondary">TZS {(c.qty * c.item.unitPrice).toLocaleString()}</span>
                    <button onClick={() => removeFromCart(c.item.id)} className="text-rose-600 font-bold">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 flex justify-between items-center text-sm font-black">
              <span className="text-primary">JUMLA (TOTAL):</span>
              <span className="text-rose-600 font-mono text-base">TZS {cartTotal.toLocaleString()}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Kamilisha Mauzo & Toa Risiti</span>
            </button>
          </div>
        </div>
      )}

      {/* SubTab 3: Stock Management */}
      {subTab === "pharmacy_stock" && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-black text-primary uppercase">Ongeza Stoki Mpya ya Dawa:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Jina la Dawa / Herbal Remedy"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="p-2 border border-slate-300 rounded text-xs font-semibold"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="p-2 border border-slate-300 rounded text-xs font-semibold bg-white"
              >
                <option value="Dawa za Asili">Dawa za Asili</option>
                <option value="Mafuta">Mafuta</option>
                <option value="Unga wa Miti">Unga wa Miti</option>
                <option value="Tiba Lishe">Tiba Lishe</option>
                <option value="Tablets">Tablets</option>
                <option value="Syrup">Syrup</option>
              </select>
              <input
                type="number"
                placeholder="Idadi / Qty"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                className="p-2 border border-slate-300 rounded text-xs font-bold font-mono"
              />
              <input
                type="number"
                placeholder="Bei (TZS)"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="p-2 border border-slate-300 rounded text-xs font-bold font-mono"
              />
            </div>
            <button
              onClick={handleAddNewItem}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded cursor-pointer"
            >
              + Ongeza Kwenye Stoki
            </button>
          </div>
        </div>
      )}

      {/* SubTab 4: Suppliers */}
      {subTab === "pharmacy_suppliers" && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-primary uppercase">Orodha ya Wauzaji & Suppliers:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border rounded-xl space-y-1">
              <p className="font-extrabold text-xs text-primary">Al-Furqan Natural Remedies Farm</p>
              <p className="text-xs text-gray-600">Supplier wa Mafuta ya Habat Soda, Asali na Unga wa Miti</p>
              <p className="text-[10px] font-mono font-bold text-secondary">Simu: 0711002233 • Kigoma</p>
            </div>
            <div className="p-4 bg-slate-50 border rounded-xl space-y-1">
              <p className="font-extrabold text-xs text-primary">Kigoma Pharmaceuticals Wholesale</p>
              <p className="text-xs text-gray-600">Supplier wa Dawa za Hospitali & Equipment</p>
              <p className="text-[10px] font-mono font-bold text-secondary">Simu: 0788445566 • Kigoma</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default PharmacyModule;
