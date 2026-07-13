import React, { useState } from "react";
import { Boxes, Plus, Package, ShoppingCart, UserCheck, ShieldCheck } from "lucide-react";
import { InventoryItem } from "../types";

interface InventoryViewProps {
  inventory: InventoryItem[];
  onAddInventoryItem: (newItem: InventoryItem) => void;
}

export default function InventoryView({ inventory, onAddInventoryItem }: InventoryViewProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventoryItem["category"]>("Equipment");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState<InventoryItem["status"]>("Good");
  const [supplier, setSupplier] = useState("Medical Equipment East Africa");

  // Purchase orders simulator
  const [poList, setPoList] = useState([
    { id: "PO-2026-001", date: "2026-07-02", item: "Kioo Bottles (500ml)", qty: 200, cost: 400000, status: "Delivered" },
    { id: "PO-2026-002", date: "2026-07-10", item: "Mashine ya Kupima Presha", qty: 2, cost: 180000, status: "Pending" }
  ]);
  const [newPoItem, setNewPoItem] = useState("");
  const [newPoQty, setNewPoQty] = useState("");
  const [newPoCost, setNewPoCost] = useState("");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: InventoryItem = {
      id: `INV-${Math.floor(100 + Math.random() * 900)}`,
      name,
      category,
      quantity: parseInt(quantity) || 1,
      status,
      supplier,
      purchaseDate: new Date().toISOString().split("T")[0]
    };

    onAddInventoryItem(newItem);
    alert(`Asset/Vifaa ${newItem.name} imehifadhiwa kwenye stoki ya ofisi.`);

    // Clear form
    setName("");
    setQuantity("");
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoItem.trim()) return;

    const newPO = {
      id: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split("T")[0],
      item: newPoItem,
      qty: parseInt(newPoQty) || 10,
      cost: parseFloat(newPoCost) || 100000,
      status: "Pending"
    };

    setPoList([newPO, ...poList]);
    alert(`Simulated Purchase Order ${newPO.id} imeidhinishwa salama!`);
    setNewPoItem("");
    setNewPoQty("");
    setNewPoCost("");
  };

  return (
    <div className="p-6 space-y-6">
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Assets and Equipment Inventory list */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-primary/20 pb-3">
              <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-5 h-5 text-secondary animate-pulse" />
                Vifaa & Mali za Kliniki (Clinical Assets & Consumables)
              </h3>
              <span className="bg-primary text-white text-xs px-2.5 py-0.5 rounded font-mono font-bold">
                Mali {inventory.length} Zilizopo
              </span>
            </div>

            <div className="table-responsive">
              <table className="text-left w-full text-xs font-semibold">
                <thead>
                  <tr>
                    <th className="p-3">ID & Vifaa</th>
                    <th className="p-3">Aina (Category)</th>
                    <th className="p-3">Idadi (Quantity)</th>
                    <th className="p-3">Hali (Status)</th>
                    <th className="p-3">Mtoa Vifaa (Supplier)</th>
                    <th className="p-3 font-mono">Date Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-light-bg/50">
                      <td className="p-3">
                        <div className="font-bold text-primary uppercase">{item.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{item.id}</div>
                      </td>
                      <td className="p-3 text-gray-600">{item.category}</td>
                      <td className="p-3 text-primary font-bold font-mono">{item.quantity} Units</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.status === "Good" 
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{item.supplier}</td>
                      <td className="p-3 text-primary font-mono">{item.purchaseDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Simulated Purchase Orders list */}
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b border-primary/20 pb-3">
              Maagizo ya Vifaa & LPO (Purchase Orders Logs)
            </h3>
            <div className="table-responsive">
              <table className="text-left w-full text-xs font-semibold">
                <thead>
                  <tr>
                    <th className="p-3">LPO #</th>
                    <th className="p-3">Tarehe ya Ombi</th>
                    <th className="p-3">Vifaa Vilivyoagizwa</th>
                    <th className="p-3">Idadi</th>
                    <th className="p-3">Gharama</th>
                    <th className="p-3">Hali (LPO Status)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {poList.map((po) => (
                    <tr key={po.id} className="hover:bg-light-bg/50">
                      <td className="p-3 font-mono font-bold text-secondary">{po.id}</td>
                      <td className="p-3 text-gray-500 font-mono">{po.date}</td>
                      <td className="p-3 text-primary uppercase font-bold">{po.item}</td>
                      <td className="p-3 text-primary font-mono">{po.qty} Units</td>
                      <td className="p-3 text-primary font-mono">{po.cost.toLocaleString()} TZS</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          po.status === "Delivered" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Book New PO and Asset Entry */}
        <div className="space-y-4">
          
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b-2 border-secondary pb-2">
              Sajili Asset Mpya (Asset Entry)
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="flex flex-col text-xs">
                <label className="font-bold text-primary mb-1">Jina la Vifaa / Asset *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg font-semibold"
                  placeholder="Mf. Mizani ya Kielektroniki"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col">
                  <label className="font-bold text-primary mb-1">Aina ya Asset</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InventoryItem["category"])}
                    className="p-2.5 border-2 border-primary rounded-lg font-semibold bg-white"
                  >
                    <option value="Asset">Asset ya Ofisi</option>
                    <option value="Equipment">Vifaa Tiba (Equipment)</option>
                    <option value="Consumable">Vifaa Vinavyoisha (Consumable)</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-bold text-primary mb-1">Idadi / Quantity *</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col">
                  <label className="font-bold text-primary mb-1">Hali (Condition)</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as InventoryItem["status"])}
                    className="p-2.5 border-2 border-primary rounded-lg font-semibold bg-white"
                  >
                    <option value="Good">Inafanya kazi vizuri</option>
                    <option value="Requires Maintenance">Inahitaji Matengenezo</option>
                    <option value="Out of Order">Mbovu (Out of Order)</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-bold text-primary mb-1">Supplier</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-secondary hover:bg-primary border-2 border-secondary hover:border-primary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" />
                Hifadhi Kwenye Mali za Ofisi
              </button>
            </form>
          </div>

          {/* New PO Booking */}
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b-2 border-secondary pb-2">
              Omba LPO Mpya (Generate PO)
            </h3>

            <form onSubmit={handleCreatePO} className="space-y-4">
              <div className="flex flex-col text-xs">
                <label className="font-bold text-primary mb-1">Kitu Kinachoagizwa *</label>
                <input
                  type="text"
                  required
                  value={newPoItem}
                  onChange={(e) => setNewPoItem(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg font-semibold"
                  placeholder="Mf. Beaker au Gloves"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col">
                  <label className="font-bold text-primary mb-1">Idadi *</label>
                  <input
                    type="number"
                    required
                    value={newPoQty}
                    onChange={(e) => setNewPoQty(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg font-semibold font-mono"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-bold text-primary mb-1">Gharama Makadirio *</label>
                  <input
                    type="number"
                    required
                    value={newPoCost}
                    onChange={(e) => setNewPoCost(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg font-semibold font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-primary hover:bg-secondary text-white border-2 border-primary hover:border-secondary text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow"
              >
                <ShoppingCart className="w-4 h-4" />
                Sajili na Tuma Maombi LPO
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
