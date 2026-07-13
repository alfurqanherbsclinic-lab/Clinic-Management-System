import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { FileText, Download, Printer, TrendingUp, Calendar, Coins, UserCheck, ShieldCheck } from "lucide-react";
import { Patient, Invoice, Appointment } from "../types";

interface ReportsViewProps {
  patients: Patient[];
  invoices: Invoice[];
  appointments: Appointment[];
}

export default function ReportsView({ patients, invoices, appointments }: ReportsViewProps) {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.netAmount, 0);
  const totalPatients = patients.length;
  const totalAppointments = appointments.length;

  const chartData = [
    { name: "Jan", Wagonjwa: 12, Mapato: 320000 },
    { name: "Feb", Wagonjwa: 18, Mapato: 450000 },
    { name: "Mar", Wagonjwa: 25, Mapato: 680000 },
    { name: "Apr", Wagonjwa: 30, Mapato: 820000 },
    { name: "May", Wagonjwa: 45, Mapato: 1100000 },
    { name: "Jun", Wagonjwa: 60, Mapato: 1450000 },
    { name: "Jul", Wagonjwa: 85, Mapato: 2450000 }
  ];

  const handleExport = (format: "PDF" | "Excel") => {
    alert(`Ripoti kamili ya ${reportType.toUpperCase()} inapakuliwa kama ${format} salama na kulingana na vigezo vya usalama wa kisheria wa daktari.`);
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Dynamic Selector Header */}
      <div className="bg-white p-4 rounded-xl border-2 border-primary shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-secondary shrink-0" />
          <span className="text-xs font-bold text-primary uppercase">Chagua Kipindi cha Ripoti:</span>
          <div className="flex bg-light-bg rounded p-1 border border-primary/10 text-xs font-bold text-primary">
            <button
              onClick={() => setReportType("daily")}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${reportType === "daily" ? "bg-secondary text-white" : ""}`}
            >
              Daily
            </button>
            <button
              onClick={() => setReportType("weekly")}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${reportType === "weekly" ? "bg-secondary text-white" : ""}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setReportType("monthly")}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${reportType === "monthly" ? "bg-secondary text-white" : ""}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setReportType("yearly")}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${reportType === "yearly" ? "bg-secondary text-white" : ""}`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExport("PDF")}
            className="px-3 py-2 bg-primary hover:bg-secondary text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileText className="w-4 h-4 text-secondary" />
            Pakua PDF Report
          </button>
          <button
            onClick={() => handleExport("Excel")}
            className="px-3 py-2 bg-secondary hover:bg-primary text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            Pakua Excel Report
          </button>
        </div>
      </div>

      {/* Statistical Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mapato Kipindi Hiki</p>
            <h4 className="text-xl font-black text-secondary font-mono">{totalRevenue.toLocaleString()} TZS</h4>
            <p className="text-[10px] text-emerald-700 font-bold">↑ +14.5% vs Kipindi cha nyuma</p>
          </div>
          <Coins className="w-10 h-10 text-primary opacity-20" />
        </div>

        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Wagonjwa Wapya</p>
            <h4 className="text-xl font-black text-primary font-mono">{totalPatients} Wagonjwa</h4>
            <p className="text-[10px] text-emerald-700 font-bold">↑ +8% vs Mwezi uliopita</p>
          </div>
          <UserCheck className="w-10 h-10 text-primary opacity-20" />
        </div>

        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Miadi Iliyokamilika</p>
            <h4 className="text-xl font-black text-primary font-mono">{totalAppointments} Miadi</h4>
            <p className="text-[10px] text-emerald-700 font-bold">↑ +2.5% Msururu kamili</p>
          </div>
          <Calendar className="w-10 h-10 text-primary opacity-20" />
        </div>

      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue chart */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-primary font-display uppercase tracking-wider flex items-center gap-1.5 border-b border-primary/20 pb-2">
            <TrendingUp className="w-4 h-4 text-secondary" />
            Ukuaji wa Mapato (Revenue Performance Trend)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMapato" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D6145A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D6145A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#0F2D3E" style={{ fontSize: 10, fontWeight: "bold" }} />
                <YAxis stroke="#0F2D3E" style={{ fontSize: 10, fontWeight: "bold" }} />
                <Tooltip />
                <Area type="monotone" dataKey="Mapato" stroke="#D6145A" strokeWidth={3} fillOpacity={1} fill="url(#colorMapato)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patients registrations chart */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-primary font-display uppercase tracking-wider flex items-center gap-1.5 border-b border-primary/20 pb-2">
            <UserCheck className="w-4 h-4 text-secondary" />
            Wagonjwa Wapya Waliojisajili (New Registrations)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#0F2D3E" style={{ fontSize: 10, fontWeight: "bold" }} />
                <YAxis stroke="#0F2D3E" style={{ fontSize: 10, fontWeight: "bold" }} />
                <Tooltip />
                <Bar dataKey="Wagonjwa" fill="#0F2D3E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Detailed Revenue Table per month */}
      <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-primary font-display uppercase tracking-wider border-b border-primary/20 pb-2">
          Ripoti ya Kichambuzi cha Mapato ya Kila Mwezi (Analytic Ledger Summary)
        </h3>
        <div className="table-responsive">
          <table className="text-left w-full text-xs font-semibold">
            <thead>
              <tr>
                <th className="p-3">Mwezi</th>
                <th className="p-3">Wagonjwa Wapya</th>
                <th className="p-3">Mapato ya Dawa & Viungo</th>
                <th className="p-3">Mapato ya Ushauri (Consultations)</th>
                <th className="p-3">Jumla ya Mapato (TZS)</th>
                <th className="p-3">Hali ya Kisheria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {chartData.map((data, idx) => (
                <tr key={idx} className="hover:bg-light-bg/50">
                  <td className="p-3 font-bold text-primary">{data.name} 2026</td>
                  <td className="p-3 text-primary font-mono">{data.Wagonjwa}</td>
                  <td className="p-3 font-mono">{(data.Mapato * 0.7).toLocaleString()} TZS</td>
                  <td className="p-3 font-mono">{(data.Mapato * 0.3).toLocaleString()} TZS</td>
                  <td className="p-3 font-mono text-secondary font-bold">{data.Mapato.toLocaleString()} TZS</td>
                  <td className="p-3">
                    <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 rounded px-2 py-0.5 text-[9px] font-bold uppercase">
                      Audited & Verified
                    </span>
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
