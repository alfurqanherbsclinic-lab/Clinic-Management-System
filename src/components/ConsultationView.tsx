import React, { useState, useEffect } from "react";
import { Stethoscope, Activity, HeartPulse, ShieldAlert, CheckCircle, Save, Loader2, ArrowRight } from "lucide-react";
import { Patient, Consultation } from "../types";

interface ConsultationViewProps {
  patients: Patient[];
  consultations: Consultation[];
  onAddConsultation: (newConsultation: Consultation) => void;
}

export default function ConsultationView({ patients, consultations, onAddConsultation }: ConsultationViewProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || "");
  const [temperature, setTemperature] = useState("36.6");
  const [bp, setBp] = useState("120/80");
  const [pulse, setPulse] = useState("72");
  const [respiration, setRespiration] = useState("16");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("1.70");
  const [bmi, setBmi] = useState(24.2);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [icdCode, setIcdCode] = useState("M19.9 (Unspecified Osteoarthritis)");
  const [prescription, setPrescription] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const [savingStatus, setSavingStatus] = useState("Idling");

  // Calculate live BMI
  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w > 0 && h > 0) {
      const calculatedBmi = w / (h * h);
      setBmi(parseFloat(calculatedBmi.toFixed(1)));
    } else {
      setBmi(0);
    }
  }, [weight, height]);

  // Simulate auto-saving for doctor consultation entries as requested (SHARTI 10, 19, 20)
  useEffect(() => {
    if (doctorNotes || diagnosis || prescription) {
      setSavingStatus("Saving");
      const delayDebounceFn = setTimeout(() => {
        setSavingStatus("Saved");
      }, 1000);
      return () => {
        clearTimeout(delayDebounceFn);
        setSavingStatus("Idling");
      };
    }
  }, [doctorNotes, diagnosis, prescription, temperature, bp, pulse, respiration, weight, height, advice, followUpDate]);

  const handleSaveConsultation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPatientId) return;

    const newCons: Consultation = {
      id: `CON-${Math.floor(100 + Math.random() * 900)}`,
      patientId: selectedPatientId,
      date: new Date().toISOString().split("T")[0],
      temperature: parseFloat(temperature) || 36.6,
      bp: bp || "120/80",
      pulse: parseInt(pulse) || 72,
      respiration: parseInt(respiration) || 16,
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 1.70,
      bmi: bmi || 24.2,
      doctorNotes,
      diagnosis,
      icdCode,
      prescription,
      advice,
      followUpDate: followUpDate || new Date().toISOString().split("T")[0]
    };

    onAddConsultation(newCons);
    setSavingStatus("ManualSaved");
    setTimeout(() => {
      setSavingStatus("Idling");
    }, 1500);

    // Clear form inputs
    setDoctorNotes("");
    setDiagnosis("");
    setPrescription("");
    setAdvice("");
    setFollowUpDate("");
  };

  const activePatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="p-6 space-y-6">
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Patient Active Queue Card & Vitals Dashboard */}
        <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-5">
          <div className="border-b-2 border-secondary pb-2.5">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-secondary animate-pulse" />
              Mgonjwa Aliyeko Mezani (Active Patient)
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary mb-1 uppercase tracking-wider">Chagua Mgonjwa Aliyopo</label>
            <select
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                const selectedP = patients.find(p => p.id === e.target.value);
                if (selectedP) {
                  setWeight(selectedP.weight.toString());
                  setHeight(selectedP.height.toString());
                }
              }}
              className="w-full p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.cardNumber})
                </option>
              ))}
            </select>
          </div>

          {activePatient ? (
            <div className="bg-light-bg p-4 rounded-xl border border-primary/10 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={activePatient.photoUrl}
                  alt={activePatient.name}
                  className="w-12 h-12 rounded-full border-2 border-secondary object-cover"
                />
                <div>
                  <h4 className="font-extrabold text-primary uppercase font-display">{activePatient.name}</h4>
                  <p className="text-[10px] text-gray-500 font-bold font-mono">{activePatient.cardNumber} • {activePatient.mrn}</p>
                </div>
              </div>
              <div className="space-y-1.5 font-semibold text-gray-700 pt-2 border-t border-primary/5">
                <div className="flex justify-between">
                  <span>Age / Jinsia:</span>
                  <span className="text-primary font-bold">{activePatient.age} Miaka / {activePatient.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span>Utaifa / Dini:</span>
                  <span className="text-primary font-bold">{activePatient.nationality} / {activePatient.religion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Njia ya Malipo:</span>
                  <span className="text-secondary font-extrabold uppercase">{activePatient.paymentMethod}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 font-semibold py-8 text-center">Tafadhali chagua au sajili mgonjwa.</p>
          )}

          {/* Vitals Input Grid */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-widest border-b border-primary/20 pb-1">
              Vipimo vya Vitals (Vital Signs Monitor)
            </h4>
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="flex flex-col">
                <label className="font-bold text-primary mb-1">BP (Blood Pressure) *</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="p-2 border-2 border-primary rounded-lg font-semibold font-mono"
                  placeholder="120/80"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-primary mb-1">Temperature (°C) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="p-2 border-2 border-primary rounded-lg font-semibold font-mono"
                  placeholder="36.5"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-primary mb-1">Pulse (SpO2/Pulse) *</label>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="p-2 border-2 border-primary rounded-lg font-semibold font-mono"
                  placeholder="72"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-primary mb-1">Respiration (BPM) *</label>
                <input
                  type="number"
                  value={respiration}
                  onChange={(e) => setRespiration(e.target.value)}
                  className="p-2 border-2 border-primary rounded-lg font-semibold font-mono"
                  placeholder="18"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-primary mb-1">Weight (kg) *</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="p-2 border-2 border-primary rounded-lg font-semibold font-mono"
                  placeholder="70"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-primary mb-1">Height (m) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="p-2 border-2 border-primary rounded-lg font-semibold font-mono"
                  placeholder="1.70"
                />
              </div>
            </div>

            {/* Computed live BMI */}
            <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-lg flex items-center justify-between text-xs">
              <span className="font-bold text-primary">Live BMI Assessment:</span>
              <span className={`font-black font-mono text-sm px-2.5 py-0.5 rounded ${
                bmi >= 18.5 && bmi < 25 ? "bg-emerald-100 text-emerald-800" : "bg-secondary/10 text-secondary"
              }`}>
                {bmi} ({bmi > 0 && bmi < 18.5 ? "Underweight" : bmi >= 18.5 && bmi < 25 ? "Normal" : bmi >= 25 && bmi < 30 ? "Overweight" : "Obese"})
              </span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Doctor Notes & Diagnosis (Integrated ICD code and auto saving) */}
        <div className="xl:col-span-2 bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b-2 border-secondary pb-2.5">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider">
              Ushauri wa Daktari & Tiba (Doctor Consultation Desk)
            </h3>
            {/* Live Auto Save Indicator */}
            <div>
              {savingStatus === "Saving" && (
                <span className="flex items-center gap-1 text-[11px] text-primary font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-secondary" />
                  Inahifadhi kiotomatiki...
                </span>
              )}
              {savingStatus === "Saved" && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Yote yamehifadhiwa (Auto-Saved)
                </span>
              )}
              {savingStatus === "ManualSaved" && (
                <span className="flex items-center gap-1 text-[11px] text-secondary font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Ushauri Umehifadhiwa EMR!
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveConsultation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-primary mb-1">Utambuzi (Diagnosis) *</label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="p-3 border-2 border-primary rounded-lg text-xs font-semibold"
                  placeholder="Mf. Osteoarthritis ya Goti la Kulia"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-primary mb-1">Nambari ya ICD-10 (ICD Code Lookup)</label>
                <select
                  value={icdCode}
                  onChange={(e) => setIcdCode(e.target.value)}
                  className="p-3 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="M19.9">M19.9 - Osteoarthritis (Unspecified)</option>
                  <option value="I10">I10 - Essential (Primary) Hypertension</option>
                  <option value="E11.9">E11.9 - Type 2 Diabetes Mellitus without complications</option>
                  <option value="K21.9">K21.9 - Gastro-esophageal reflux disease without esophagitis</option>
                  <option value="B50.9">B50.9 - Plasmodium falciparum malaria (Unspecified)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-primary mb-1">Maelezo ya Daktari (Doctor Clinical Notes) *</label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={4}
                className="p-3 border-2 border-primary rounded-lg text-xs font-semibold"
                placeholder="Andika matokeo ya vipimo vya mgonjwa, dalili za kliniki na SOAP evaluation hapa..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-primary mb-1">Tiba / Dawa Pendekezwa (Prescription) *</label>
                <textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  rows={3}
                  className="p-3 border-2 border-primary rounded-lg text-xs font-semibold font-mono"
                  placeholder="1. Mafuta ya Habbat Soda (100ml) - Kijiko 1 x 2&#10;2. Asali ya Nyuki Mwitu (Black seed) - Vijiko 2 x 3"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-primary mb-1">Ushauri Maalum kwa Mgonjwa (Advice)</label>
                <textarea
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  rows={3}
                  className="p-3 border-2 border-primary rounded-lg text-xs font-semibold"
                  placeholder="Kupunguza vyakula vyenye asidi nyingi, kunywa maji mengi na kufanya mazoezi mepesi asubuhi..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-primary mb-1">Tarehe ya Marudio (Follow-Up Date)</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="p-3 border-2 border-primary rounded-lg text-xs font-semibold"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full p-3.5 bg-secondary hover:bg-primary border-2 border-secondary hover:border-primary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Hifadhi & Peana Reseti kwa Famasia (Publish to Pharmacy)
                </button>
              </div>
            </div>

          </form>

          {/* Quick Consultation History widget for the selected patient */}
          <div className="mt-6 pt-5 border-t border-primary/20 space-y-3">
            <h4 className="text-xs font-bold text-primary font-display uppercase tracking-wider">
              Historia ya Vipimo vya Karibuni vya Mgonjwa Huyu
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {consultations.filter(c => c.patientId === selectedPatientId).length > 0 ? (
                consultations.filter(c => c.patientId === selectedPatientId).map((c) => (
                  <div key={c.id} className="p-3 bg-light-bg rounded-lg border border-primary/10 flex items-start justify-between gap-4 text-xs font-medium">
                    <div>
                      <p className="font-bold text-primary uppercase">{c.diagnosis}</p>
                      <p className="text-gray-600 mt-0.5">{c.doctorNotes}</p>
                      <p className="text-[10px] text-gray-400 font-bold font-mono mt-1">Vitals: BP {c.bp} • Temp {c.temperature}°C • Weight {c.weight}kg</p>
                    </div>
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded font-mono">
                      {c.date}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 font-semibold py-4 text-center">Hakuna vipimo vilivyopita vya mgonjwa huyu leo.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
