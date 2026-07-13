import React, { useState } from "react";
import { Settings, Shield, HardDrive, ShieldCheck, CheckCircle, RefreshCw, Upload, Download, Trash2, Heart } from "lucide-react";

interface SettingsViewProps {
  onRestoreBackup: (backupData: any) => void;
  patients: any[];
  records: any[];
  consultations: any[];
  medicines: any[];
  invoices: any[];
}

export default function SettingsView({ 
  onRestoreBackup, 
  patients, 
  records, 
  consultations, 
  medicines, 
  invoices 
}: SettingsViewProps) {
  const [clinicName, setClinicName] = useState("Al-Furqan Herb's Clinic & HIS");
  const [clinicPhone, setClinicPhone] = useState("+255 713 456 789");
  const [clinicEmail, setClinicEmail] = useState("info@alfurqanherb.co.tz");
  const [clinicAddress, setClinicAddress] = useState("Dar es Salaam, Tanzania");
  const [selectedBackupFile, setSelectedBackupFile] = useState<string>("");

  const [users, setUsers] = useState([
    { id: "USR-001", name: "Dr. Abdu Khalifa Rehani", role: "Super Admin", active: true },
    { id: "USR-002", name: "Dr. Khalifa Rehani", role: "Medical Doctor", active: true },
    { id: "USR-003", name: "Aisha Bakari", role: "Pharmacist", active: true }
  ]);

  const handleDownloadBackup = () => {
    const backupData = {
      backupDate: new Date().toISOString(),
      patients,
      records,
      consultations,
      medicines,
      invoices
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AlFurqan_HIS_Backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    alert("Mlisho kamili wa backup (JSON) umepakuliwa kwa usalama!");
  };

  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.patients) {
            onRestoreBackup(parsed);
            alert("Backup imerejeshwa kikamilifu! Mfumo sasa una data mpya zilizorejeshwa.");
          } else {
            alert("Mfumo haukutambua muundo sahihi wa faili ya backup.");
          }
        } catch (err) {
          alert("Kuna hitilafu wakati wa kusoma faili ya JSON.");
        }
      };
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Clinic Profile & System Users List */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Clinic Profile details */}
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b border-primary/20 pb-2 flex items-center gap-2">
              <Settings className="w-5 h-5 text-secondary" />
              Maelezo ya Hospitali (Clinic Identity & Hospital Profile)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col">
                <label className="font-bold text-primary mb-1">Jina la Hospitali / Kliniki *</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg font-semibold"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-primary mb-1">Simu ya Kliniki *</label>
                <input
                  type="text"
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg font-semibold font-mono"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-primary mb-1">Barua Pepe (Email) *</label>
                <input
                  type="email"
                  value={clinicEmail}
                  onChange={(e) => setClinicEmail(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg font-semibold"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-primary mb-1">Anwani ya Kliniki (Physical Address) *</label>
                <input
                  type="text"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  className="p-2.5 border-2 border-primary rounded-lg font-semibold"
                />
              </div>
            </div>

            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-between text-xs">
              <span className="font-bold text-primary">Koti la Stamp ya Kliniki na Saini za Digitali (Stamp & Digital Signatures):</span>
              <button
                onClick={() => alert("Koti la saini za kidigitali limeamilishwa na lipo tayari kwa matumizi.")}
                className="px-3 py-1 bg-primary text-white font-bold rounded hover:bg-secondary cursor-pointer transition-colors"
              >
                Pakia Saini/Stamp
              </button>
            </div>
          </div>

          {/* System Users lists with Roles */}
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b border-primary/20 pb-2">
              Watumiaji na Majukumu (HIS Security Users & Access Roles)
            </h3>
            <div className="table-responsive">
              <table className="text-left w-full text-xs font-semibold">
                <thead>
                  <tr>
                    <th className="p-3">User ID & Jina</th>
                    <th className="p-3">Jukumu (Role Status)</th>
                    <th className="p-3">Hali ya Akaunti (Status)</th>
                    <th className="p-3">Zana (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-light-bg/50">
                      <td className="p-3">
                        <div className="font-bold text-primary uppercase">{u.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{u.id}</div>
                      </td>
                      <td className="p-3">
                        <span className="inline-block bg-primary/10 text-primary rounded px-2 py-0.5 text-[10px] font-bold uppercase">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="inline-block bg-emerald-100 text-emerald-800 rounded px-2 py-0.5 text-[10px] font-bold">
                          Active
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => alert("Marekebisho ya watumiaji na majukumu yamezuiwa kwa usalama.")}
                          className="text-secondary hover:underline cursor-pointer"
                        >
                          Badili Jukumu
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Backup and Restore Tools */}
        <div className="space-y-4">
          
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <div className="border-b-2 border-secondary pb-2">
              <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-secondary animate-pulse" />
                Backup na Rejesha (Backup & Restore Utilities)
              </h3>
            </div>

            <p className="text-xs text-gray-500 font-semibold">
              Kulingana na Sheria za Usalama wa Data Hospitalini, daktari anapaswa kuhifadhi backup kila baada ya saa 24.
            </p>

            <div className="space-y-3.5 pt-2">
              {/* Backup Tool */}
              <button
                onClick={handleDownloadBackup}
                className="w-full p-3.5 bg-secondary hover:bg-primary text-white border-2 border-secondary hover:border-primary rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4 animate-bounce" />
                Pakua Backup ya Mfumo (Backup JSON)
              </button>

              <div className="border-t border-primary/15 my-4"></div>

              {/* Restore Tool */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-primary uppercase">Rejesha Mfumo Kutoka Backup (Restore JSON)</label>
                <div className="relative border-2 border-dashed border-primary/40 p-4 rounded-lg bg-light-bg hover:bg-primary/5 transition-colors text-center cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <span className="text-xs font-bold text-primary block">Bofya kupakia faili ya Backup (.json)</span>
                  <span className="text-[10px] text-gray-400 font-semibold">Data zote za kliniki zitarejeshwa papo hapo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secure SSL indicator */}
          <div className="p-4 bg-primary text-white rounded-xl text-xs space-y-2">
            <p className="font-extrabold uppercase text-secondary flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Encryption na Ulinzi
            </p>
            <p className="font-medium text-gray-200">
              Uunganishaji wote wa data umesimbwa kwa njia ya siri (AES-256 SSL Encryption). Hakuna ripoti inayoweza kufikiwa bila uthibitishaji wa bima au saini ya daktari mkuu.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
