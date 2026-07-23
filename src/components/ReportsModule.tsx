import React from "react";
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Pill, 
  FlaskConical, 
  Printer, 
  Download,
  Calendar,
  TrendingUp
} from "lucide-react";
import { Patient } from "../types";

interface ReportsModuleProps {
  patients: Patient[];
}

export function ReportsModule({ patients }: ReportsModuleProps) {
  const totalPatients = patients.length;
  const maleCount = patients.filter(p => p.gender.toLowerCase() === "mme" || p.gender.toLowerCase() === "male").length;
  const femaleCount = patients.filter(p => p.gender.toLowerCase() === "mke" || p.gender.toLowerCase() === "female").length;
  const insuredCount = patients.filter(p => p.insurance?.hasInsurance).length;

  return (
    <div className="bg-white p-5 rounded-2xl border-2 border-primary/20 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-black font-display text-primary uppercase flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-600" />
            <span>RIPOTI NA TAKWIMU ZA HOSPITALI (REPORTS & ANALYTICS)</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Uchambuzi wa Wagonjwa, Mapato, Bima, Maabara na Dawa</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-gradient-to-br from-slate-900 to-[#0F2D3E] text-white rounded-xl shadow-md space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-300">Jumla ya Wagonjwa</p>
          <p className="text-2xl font-black font-mono text-amber-400">{totalPatients}</p>
          <p className="text-[10px] text-slate-400">Wamesajiliwa kwenye mfumo</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-xl shadow-md space-y-1">
          <p className="text-[10px] uppercase font-bold text-emerald-200">Mapato ya Mwezi (TZS)</p>
          <p className="text-xl font-black font-mono text-emerald-300">1,450,000</p>
          <p className="text-[10px] text-emerald-200">Kutoka Huduma & Dawa</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-sky-800 to-sky-950 text-white rounded-xl shadow-md space-y-1">
          <p className="text-[10px] uppercase font-bold text-sky-200">Wagonjwa Wa Bima</p>
          <p className="text-2xl font-black font-mono text-sky-300">{insuredCount}</p>
          <p className="text-[10px] text-sky-200">Wenye NHIF / Bima Nyingine</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-800 to-purple-950 text-white rounded-xl shadow-md space-y-1">
          <p className="text-[10px] uppercase font-bold text-purple-200">Vipimo vya Maabara</p>
          <p className="text-2xl font-black font-mono text-purple-300">38</p>
          <p className="text-[10px] text-purple-200">Vimekamilika mwezi huu</p>
        </div>
      </div>

      {/* Visual Gender & Demographic Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="space-y-2">
          <h3 className="text-xs font-black text-primary uppercase">Mchanganuo wa Jinsia za Wagonjwa:</h3>
          <div className="space-y-1 text-xs font-bold">
            <div className="flex justify-between">
              <span>Wanaume (Male):</span>
              <span className="font-mono text-primary">{maleCount}</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: `${totalPatients ? (maleCount/totalPatients)*100 : 50}%` }} />
            </div>

            <div className="flex justify-between pt-2">
              <span>Wanawake (Female):</span>
              <span className="font-mono text-[#D6145A]">{femaleCount}</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-[#D6145A] h-full" style={{ width: `${totalPatients ? (femaleCount/totalPatients)*100 : 50}%` }} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-black text-primary uppercase">Mchanganuo wa Dawa Zinazouzwa Zaidi:</h3>
          <ul className="text-xs space-y-1 text-slate-700 font-semibold">
            <li className="flex justify-between border-b pb-1">
              <span>1. Habat Soda Pure Oil 100ml</span>
              <span className="font-mono text-emerald-700 font-bold">45 Bote</span>
            </li>
            <li className="flex justify-between border-b pb-1">
              <span>2. Asali ya Nyuki ya Asili</span>
              <span className="font-mono text-emerald-700 font-bold">30 Bote</span>
            </li>
            <li className="flex justify-between">
              <span>3. Dawa ya Tumbo & Gesi</span>
              <span className="font-mono text-emerald-700 font-bold">22 Pkts</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}

export default ReportsModule;
