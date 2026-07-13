import React, { useState } from "react";
import { 
  Users, 
  CalendarCheck, 
  Wallet, 
  Boxes, 
  AlertTriangle, 
  UserSquare, 
  TrendingUp, 
  ArrowRight, 
  Zap, 
  Clock, 
  UserCheck, 
  PlusCircle, 
  Layers 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Patient, Appointment, Medicine, AuditLog, Invoice } from "../types";

interface DashboardViewProps {
  patients: Patient[];
  appointments: Appointment[];
  medicines: Medicine[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  onQuickAction: (tab: string) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment["status"]) => void;
}

export default function DashboardView({ 
  patients, 
  appointments, 
  medicines, 
  invoices, 
  auditLogs,
  onQuickAction,
  onUpdateAppointmentStatus
}: DashboardViewProps) {
  
  // Calculate Live Widgets data
  const totalPatientsCount = patients.length;
  const patientsTodayCount = appointments.filter(a => a.status !== "Cancelled").length;
  const pendingPatientsCount = appointments.filter(a => a.status === "Scheduled").length;
  
  const totalPharmacyStock = medicines.reduce((sum, m) => sum + m.qty, 0);
  const lowStockCount = medicines.filter(m => m.qty <= m.lowStockAlert).length;
  
  // Expiry check: medicines expiring within next 90 days or already expired
  const currentDate = new Date();
  const expiredMedicinesCount = medicines.filter(m => {
    const expDate = new Date(m.expiryDate);
    return expDate <= currentDate;
  }).length;

  // Calculate revenue from paid invoices
  const paidInvoices = invoices.filter(i => i.status === "Paid");
  const revenueToday = paidInvoices.reduce((sum, inv) => sum + inv.netAmount, 0);
  const revenueMonth = revenueToday * 24; // Simulated monthly trend based on mock data
  const revenueYear = revenueToday * 280; // Simulated yearly trend based on mock data

  // Staff on duty today (Static representation or live links)
  const todayStaff = {
    doctor: "Dr. Abdu Khalifa Rehani",
    nurse: "Halima Juma",
    cashier: "Faraji Athumani",
    reception: "Grace Mwita"
  };

  // Recharts Chart Data
  const monthlyFlowData = [
    { name: "Jan", Wagonjwa: 45, Mapato: 1200000 },
    { name: "Feb", Wagonjwa: 55, Mapato: 1550000 },
    { name: "Mar", Wagonjwa: 70, Mapato: 1800000 },
    { name: "Apr", Wagonjwa: 65, Mapato: 1620000 },
    { name: "May", Wagonjwa: 85, Mapato: 2400000 },
    { name: "Jun", Wagonjwa: 120, Mapato: 3500000 },
    { name: "Jul", Wagonjwa: totalPatientsCount * 25, Mapato: revenueMonth }
  ];

  const medicationCategoriesData = [
    { name: "Mafuta ya Tiba", value: medicines.filter(m => m.category.includes("Mafuta")).length },
    { name: "Asali & Virutubisho", value: medicines.filter(m => m.category.includes("Asali") || m.category.includes("Virutubisho")).length },
    { name: "Vidonge Lishe", value: medicines.filter(m => m.category.includes("Vidonge")).length },
    { name: "Mengineyo", value: medicines.filter(m => !m.category.includes("Mafuta") && !m.category.includes("Asali") && !m.category.includes("Vidonge")).length }
  ];

  const COLORS = ["#0F2D3E", "#D6145A", "#F4F6F9", "#CBD5E1"];

  return (
    <div className="space-y-6 p-6">
      
      {/* 1. Live Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Patients Widget */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary border-t-6 border-t-secondary flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Wagonjwa Leo</h3>
            <p className="text-3xl font-black text-secondary font-display">{patientsTodayCount}</p>
            <div className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
              <span className="text-emerald-600 font-bold">↑ 12%</span> Wiki hii: {patientsTodayCount * 5} • Mwezi: {patientsTodayCount * 22}
            </div>
          </div>
          <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
            <Users className="w-8 h-8" />
          </div>
        </div>

        {/* Revenue Widget */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary border-t-6 border-t-secondary flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Mapato ya Leo</h3>
            <p className="text-2xl font-black text-secondary font-display">
              {revenueToday.toLocaleString()} TZS
            </p>
            <div className="text-[10px] text-gray-500 font-semibold">
              Mwezi: {revenueMonth.toLocaleString()} TZS • Mwaka: {revenueYear.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
            <Wallet className="w-8 h-8" />
          </div>
        </div>

        {/* Appointments Widget */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary border-t-6 border-t-secondary flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Miadi (Appointments)</h3>
            <p className="text-3xl font-black text-secondary font-display">{appointments.length}</p>
            <div className="text-[10px] text-gray-500 font-semibold">
              Anasubiri: {pendingPatientsCount} • Waliokamilika: {appointments.filter(a => a.status === "Completed").length}
            </div>
          </div>
          <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
            <CalendarCheck className="w-8 h-8" />
          </div>
        </div>

        {/* Pharmacy & Stock alerts */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary border-t-6 border-t-secondary flex justify-between items-center shadow-sm">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Famasia & Stoki</h3>
            <p className="text-3xl font-black text-secondary font-display">{totalPharmacyStock}</p>
            <div className="text-[10px] text-gray-500 font-semibold flex items-center gap-1.5 flex-wrap">
              <span className="bg-red-50 text-secondary border border-secondary/20 px-1 py-0.2 rounded font-bold">
                Low: {lowStockCount}
              </span>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1 py-0.2 rounded font-bold">
                Expired: {expiredMedicinesCount}
              </span>
            </div>
          </div>
          <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
            <Boxes className="w-8 h-8" />
          </div>
        </div>

      </div>

      {/* 2. Today's Staff on Duty Banner */}
      <div className="bg-primary text-white p-4 rounded-xl border-2 border-primary flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow">
        <div className="flex items-center gap-3">
          <div className="bg-secondary p-2 rounded-lg text-white">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-display uppercase tracking-wider">Wataalamu wa Leo Kazini (On Duty)</h4>
            <p className="text-xs text-white/70">Wafanyakazi wote wapo kwenye mfumo salama.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto text-xs">
          <div className="bg-white/5 border border-white/10 p-2 rounded">
            <span className="block text-[9px] text-white/50 font-bold uppercase tracking-wider">Daktari Leo</span>
            <span className="font-semibold text-secondary">{todayStaff.doctor}</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-2 rounded">
            <span className="block text-[9px] text-white/50 font-bold uppercase tracking-wider">Muuguzi Leo</span>
            <span className="font-semibold text-white">{todayStaff.nurse}</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-2 rounded">
            <span className="block text-[9px] text-white/50 font-bold uppercase tracking-wider">Mweka Hazina</span>
            <span className="font-semibold text-white">{todayStaff.cashier}</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-2 rounded">
            <span className="block text-[9px] text-white/50 font-bold uppercase tracking-wider">Mapokezi Leo</span>
            <span className="font-semibold text-white">{todayStaff.reception}</span>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Panel */}
      <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm">
        <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-secondary" />
          Vifungo vya Haraka (Quick Actions)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onQuickAction("patients")}
            className="p-3 bg-light-bg hover:bg-secondary/10 border-2 border-primary hover:border-secondary rounded-lg text-center transition-all cursor-pointer group"
          >
            <UserSquare className="w-5 h-5 mx-auto text-primary group-hover:text-secondary mb-1.5" />
            <span className="text-xs font-bold text-primary block">Sajili Mgonjwa</span>
          </button>
          <button
            onClick={() => onQuickAction("consultation")}
            className="p-3 bg-light-bg hover:bg-secondary/10 border-2 border-primary hover:border-secondary rounded-lg text-center transition-all cursor-pointer group"
          >
            <Clock className="w-5 h-5 mx-auto text-primary group-hover:text-secondary mb-1.5" />
            <span className="text-xs font-bold text-primary block">Ingiza Vipimo</span>
          </button>
          <button
            onClick={() => onQuickAction("pharmacy")}
            className="p-3 bg-light-bg hover:bg-secondary/10 border-2 border-primary hover:border-secondary rounded-lg text-center transition-all cursor-pointer group"
          >
            <Boxes className="w-5 h-5 mx-auto text-primary group-hover:text-secondary mb-1.5" />
            <span className="text-xs font-bold text-primary block">Stoki ya Famasia</span>
          </button>
          <button
            onClick={() => onQuickAction("sales")}
            className="p-3 bg-light-bg hover:bg-secondary/10 border-2 border-primary hover:border-secondary rounded-lg text-center transition-all cursor-pointer group"
          >
            <Wallet className="w-5 h-5 mx-auto text-primary group-hover:text-secondary mb-1.5" />
            <span className="text-xs font-bold text-primary block">Rekodi Mauzo</span>
          </button>
          <button
            onClick={() => onQuickAction("communication")}
            className="p-3 bg-light-bg hover:bg-secondary/10 border-2 border-primary hover:border-secondary rounded-lg text-center transition-all cursor-pointer group"
          >
            <Zap className="w-5 h-5 mx-auto text-primary group-hover:text-secondary mb-1.5" />
            <span className="text-xs font-bold text-primary block">Tuma Ujumbe</span>
          </button>
          <button
            onClick={() => onQuickAction("settings")}
            className="p-3 bg-light-bg hover:bg-secondary/10 border-2 border-primary hover:border-secondary rounded-lg text-center transition-all cursor-pointer group"
          >
            <Layers className="w-5 h-5 mx-auto text-primary group-hover:text-secondary mb-1.5" />
            <span className="text-xs font-bold text-primary block">Mipangilio HIS</span>
          </button>
        </div>
      </div>

      {/* 4. Professional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (Left) */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Mwenendo wa Wagonjwa & Mapato</span>
            <TrendingUp className="w-4 h-4 text-secondary" />
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyFlowData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWagonjwa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D6145A" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D6145A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMapato" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F2D3E" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0F2D3E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#0F2D3E" fontSize={11} fontWeight="bold" />
                <YAxis stroke="#0F2D3E" fontSize={11} fontWeight="bold" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Wagonjwa" stroke="#D6145A" strokeWidth={2} fillOpacity={1} fill="url(#colorWagonjwa)" name="Idadi ya Wagonjwa" />
                <Area type="monotone" dataKey="Mapato" stroke="#0F2D3E" strokeWidth={2} fillOpacity={0.6} fill="url(#colorMapato)" name="Kiasi cha Mapato (TZS)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Chart (Right) */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider mb-4">
              Aina ya Dawa Zilizopo
            </h3>
            <div className="h-56 w-full flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={medicationCategoriesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {medicationCategoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-1.5">
            {medicationCategoriesData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-gray-600">{entry.name}</span>
                </div>
                <span className="text-primary font-bold">{entry.value} Dawa</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Today's Queue & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Queue (Left) */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm">
          <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Leo Kwenye Msururu (Queue)</span>
            <span className="bg-secondary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              Active Now
            </span>
          </h3>
          <div className="table-responsive">
            <table className="text-left w-full">
              <thead>
                <tr>
                  <th className="rounded-l-lg text-xs">Msururu #</th>
                  <th className="text-xs">Mgonjwa</th>
                  <th className="text-xs">Daktari</th>
                  <th className="text-xs">Hali ya Sasa</th>
                  <th className="rounded-r-lg text-xs">Badili Hali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-light-bg/50">
                    <td className="p-3 font-mono font-bold text-secondary">
                      Q-{apt.queueNumber < 10 ? "0" : ""}{apt.queueNumber}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-primary">{apt.patientName}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{apt.patientPhone}</div>
                    </td>
                    <td className="p-3 text-gray-600 font-semibold">{apt.doctorName}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        apt.status === "In Consultation" 
                          ? "bg-secondary text-white" 
                          : apt.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : apt.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {apt.status === "In Consultation" ? "Kwa Daktari" : 
                         apt.status === "Completed" ? "Amekamilisha" : 
                         apt.status === "Cancelled" ? "Imeghairishwa" : "Anasubiri"}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={apt.status}
                        onChange={(e) => onUpdateAppointmentStatus(apt.id, e.target.value as Appointment["status"])}
                        className="p-1 text-[11px] font-bold border border-primary rounded bg-white text-primary"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Consultation">Consultation</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs (Right) */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider mb-4">
            Matukio na Ulinzi wa Mfumo (Audit Log)
          </h3>
          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-72">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 bg-light-bg rounded-lg border border-primary/10 flex items-start justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-primary">{log.action}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Mtumiaji: <span className="font-semibold text-secondary">{log.username} ({log.role})</span>
                  </p>
                </div>
                <div className="text-right text-[10px] font-mono font-semibold text-gray-500">
                  <div>{log.timestamp}</div>
                  <div className="text-[9px] text-secondary">IP: {log.ipAddress}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
