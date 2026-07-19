import React, { useState, useEffect, useRef } from "react";
import { 
  UserPlus, 
  Search, 
  Printer, 
  Download, 
  Camera, 
  Fingerprint, 
  Sparkles, 
  Trash2, 
  AlertTriangle, 
  Mail, 
  FileText, 
  User, 
  Activity,
  HeartHandshake
} from "lucide-react";
import { Patient } from "../types";

interface PatientsViewProps {
  patients: Patient[];
  onAddPatient: (newPatient: Patient) => void;
  onDeletePatient: (id: string) => void;
}

export default function PatientsView({ patients, onAddPatient, onDeletePatient }: PatientsViewProps) {
  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Mwanaume");
  const [address, setAddress] = useState("");
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Mke");
  const [occupation, setOccupation] = useState("");
  const [religion, setReligion] = useState("Islam");
  const [nationality, setNationality] = useState("Tanzanian");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [email, setEmail] = useState("");
  const [hasInsurance, setHasInsurance] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insurancePolicy, setInsurancePolicy] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [referralSource, setReferralSource] = useState("Kujisajili Mwenyewe");
  const [guardian, setGuardian] = useState("N/A");
  const [maritalStatus, setMaritalStatus] = useState("Hajaoa");
  const [nextOfKin, setNextOfKin] = useState("");

  // States for live interactive features
  const [searchQuery, setSearchQuery] = useState("");
  const [duplicateAlert, setDuplicateAlert] = useState(false);
  const [bmi, setBmi] = useState(0);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);

  // Automatic calculation of BMI when weight or height updates
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

  // Duplicate patient name detection
  useEffect(() => {
    if (name.trim()) {
      const exists = patients.some(p => p.name.toLowerCase().trim() === name.toLowerCase().trim());
      setDuplicateAlert(exists);
    } else {
      setDuplicateAlert(false);
    }
  }, [name, patients]);

  // Generate Automatic Patient IDs, MRNs, and Card Numbers
  const generateAutomaticIDs = () => {
    const nextIdNum = patients.length + 1;
    const pad = (num: number, size: number) => {
      let s = "000" + num;
      return s.substring(s.length - size);
    };
    return {
      id: `AF-${pad(nextIdNum, 3)}`,
      cardNumber: `AHC-${pad(nextIdNum, 3)}`,
      mrn: `MRN-2026-${pad(nextIdNum, 4)}`
    };
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ids = generateAutomaticIDs();

    const newPatient: Patient = {
      id: ids.id,
      cardNumber: ids.cardNumber,
      mrn: ids.mrn,
      name,
      phone,
      age: parseInt(age) || 30,
      gender,
      address,
      photoUrl,
      fingerprintPlaceholder: fingerprintEnabled,
      emergencyContact: {
        name: emergencyName || "N/A",
        phone: emergencyPhone || "N/A",
        relation: emergencyRelation
      },
      occupation: occupation || "N/A",
      religion,
      nationality,
      bloodGroup,
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 1.70,
      bmi: bmi || 24.2,
      email: email || "N/A",
      insurance: {
        hasInsurance,
        provider: insuranceProvider,
        policyNumber: insurancePolicy
      },
      paymentMethod,
      referralSource,
      guardian,
      maritalStatus,
      nextOfKin: nextOfKin || `${emergencyName} (${emergencyRelation})`,
      registrationDate: new Date().toISOString().split("T")[0]
    };

    onAddPatient(newPatient);
    setSelectedPatient(newPatient);

    // Reset Form Fields
    setName("");
    setPhone("");
    setAge("");
    setAddress("");
    setWeight("");
    setHeight("");
    setEmail("");
    setEmergencyName("");
    setEmergencyPhone("");
    setOccupation("");
    setNextOfKin("");
    setHasInsurance(false);

    alert(`Mgonjwa JIPYA amesajiliwa kikamilifu! ID yake ni ${newPatient.id}, Namba ya Kadi ni ${newPatient.cardNumber}.`);
  };

  // Mock AI Background Removal & Image Enhancement
  const triggerAiProcessing = () => {
    setAiProcessing(true);
    setAiStatus("AI inakata picha na kubadilisha background kuwa Nyekundu ya Al-Furqan...");
    setTimeout(() => {
      setAiProcessing(false);
      setPhotoUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
      setAiStatus("Imekamilika kikamilifu! Picha imeboreshwa kwa usalama na background imebadilishwa.");
    }, 1500);
  };

  // Trigger simulated camera capture
  const toggleCamera = () => {
    setCameraActive(true);
    setTimeout(() => {
      setCameraActive(false);
      setPhotoUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80");
      alert("Picha imerekodiwa kwa kutumia kamera ya mbele ya kifaa kwa usahihi.");
    }, 2000);
  };

  // Filter patients based on query
  const filteredPatients = patients.filter(
    p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery)
  );

  return (
    <div className="p-6 space-y-6">
      
      {/* Search Header for patients */}
      <div className="bg-white p-4 rounded-xl border-2 border-primary flex flex-col sm:flex-row items-center gap-4 shadow-sm justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-60" />
          <input
            type="text"
            placeholder="Tafuta mgonjwa aliyepo kwa jina au namba ya simu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 p-2.5 bg-white border-2 border-primary rounded-lg text-sm font-semibold outline-none"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Chapisha Orodha
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Comprehensive HIS Patient Registration Form */}
        <div className="xl:col-span-2 bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider bg-primary text-white p-3.5 rounded flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-secondary" />
            USAJILI WA HOSPITALI - COMPREHENSIVE PATIENT REGISTRATION FORM
          </h3>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            
            {/* Duplication check banner */}
            {duplicateAlert && (
              <div className="bg-amber-50 border-l-4 border-secondary p-3 rounded text-xs text-secondary font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Kumbuka: Kuna mgonjwa tayari mwenye jina hili katika mfumo!</span>
              </div>
            )}

            {/* Segment A: Taarifa za Msingi */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-widest border-b border-primary/20 pb-1">
                A. Taarifa za Msingi (Primary Information)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">Jina Kamili *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                    placeholder="Mf. Juma Shaban"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">Namba ya Simu *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                    placeholder="Mf. 07XXXXXXXX"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-primary mb-1">Umri *</label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                      placeholder="Miaka"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-primary mb-1">Jinsia *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                    >
                      <option>Mwanaume</option>
                      <option>Mwanamke</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">Mahali Anapoishi (Anwani) *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                    placeholder="Mf. Gungu, Kigoma"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">Barua Pepe (Email)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                    placeholder="mfano@alfurqan.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-primary mb-1">Utaifa (Nationality)</label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-primary mb-1">Dini (Religion)</label>
                    <select
                      value={religion}
                      onChange={(e) => setReligion(e.target.value)}
                      className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                    >
                      <option>Islam</option>
                      <option>Christian</option>
                      <option>Mengineyo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Segment B: Taarifa za Afya & VIPIMO vya Msingi */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-widest border-b border-primary/20 pb-1">
                B. Vipimo vya Msingi (Vitals & Clinical Data)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">Weight (Kilo) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                    placeholder="65"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">Height (Mita) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                    placeholder="1.70"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">BMI (Computed)</label>
                  <div className="p-2.5 bg-light-bg border-2 border-primary/30 rounded-lg text-xs font-bold text-primary font-mono text-center">
                    {bmi > 0 ? bmi : "0.0"} ({bmi > 0 && bmi < 18.5 ? "Underweight" : bmi >= 18.5 && bmi < 25 ? "Normal" : bmi >= 25 && bmi < 30 ? "Overweight" : bmi >= 30 ? "Obese" : "N/A"})
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">Kundi la Damu</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                  >
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
                <div className="flex flex-col col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-primary mb-1">Kazi (Occupation)</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                    placeholder="Mf. Mkulima"
                  />
                </div>
              </div>
            </div>

            {/* Segment C: Mfumo wa Malipo & Bima */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-widest border-b border-primary/20 pb-1">
                C. Malipo & Bima (Billing & Insurance Details)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">Njia ya Malipo</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                  >
                    <option>Cash</option>
                    <option>Mobile Money</option>
                    <option>Bank Transfer</option>
                    <option>Insurance</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end pb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-primary">
                    <input
                      type="checkbox"
                      checked={hasInsurance}
                      onChange={(e) => setHasInsurance(e.target.checked)}
                      className="w-4 h-4 rounded border-primary text-secondary focus:ring-secondary"
                    />
                    <span>Mgonjwa anatumia Bima?</span>
                  </label>
                </div>
                {hasInsurance && (
                  <>
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-primary mb-1">Mtoa Bima (Provider)</label>
                      <select
                        value={insuranceProvider}
                        onChange={(e) => setInsuranceProvider(e.target.value)}
                        className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                      >
                        <option value="NHIF">NHIF (Mifuko ya Kitaifa)</option>
                        <option value="AAR">AAR Insurance</option>
                        <option value="Jubilee">Jubilee Insurance</option>
                        <option value="Strategies">Strategies Insurance</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-primary mb-1">Namba ya Kadi ya Bima</label>
                      <input
                        type="text"
                        value={insurancePolicy}
                        onChange={(e) => setInsurancePolicy(e.target.value)}
                        className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                        placeholder="Namba ya Kadi"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Segment D: Dharura, Uhusiano, Picha na Biometria */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-widest border-b border-primary/20 pb-1">
                D. Dharura & Picha za Usalama (Emergency & Security Photo)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">Mtu wa Karibu / Dharura *</label>
                  <input
                    type="text"
                    required
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                    placeholder="Mf. Salma Hassan"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">Simu ya Mtu wa Karibu *</label>
                  <input
                    type="text"
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                    placeholder="Mf. 07XXXXXXXX"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">Uhusiano (Relation)</label>
                  <select
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                  >
                    <option>Mke</option>
                    <option>Mume</option>
                    <option>Baba</option>
                    <option>Mama</option>
                    <option>Mtoto</option>
                    <option>Ndugu mwingine</option>
                  </select>
                </div>
              </div>

              {/* Photo upload / Camera capture options */}
              <div className="bg-light-bg p-4 rounded-lg border-2 border-dashed border-primary/30 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-14 h-14 rounded-full border-2 border-secondary object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-primary">Picha ya Kitambulisho cha Hospitali</p>
                      <p className="text-[10px] text-gray-500">Mgonjwa anapaswa kuwa na picha yenye background nyekundu.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={toggleCamera}
                      className="px-3.5 py-2 bg-primary hover:bg-secondary text-white font-bold text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Piga Picha
                    </button>
                    <button
                      type="button"
                      onClick={triggerAiProcessing}
                      disabled={aiProcessing}
                      className="px-3.5 py-2 bg-secondary text-white font-bold text-xs rounded flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Ondoa Background ya AI
                    </button>
                    <button
                      type="button"
                      onClick={() => setFingerprintEnabled(!fingerprintEnabled)}
                      className={`px-3.5 py-2 font-bold text-xs rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                        fingerprintEnabled ? "bg-emerald-600 text-white" : "bg-gray-200 text-primary border border-primary/20"
                      }`}
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      Biometric (Alama za Vidole)
                    </button>
                  </div>
                </div>
                {aiStatus && (
                  <p className="text-[11px] text-emerald-700 font-bold font-mono text-center">
                    {aiProcessing ? "⚡ " : "✅ "}{aiStatus}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-4 bg-secondary hover:bg-primary border-2 border-secondary hover:border-primary text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              Sajili Mgonjwa & Tengeneza Kadi ya Premium (Save & Create Card)
            </button>

          </form>
        </div>

        {/* Right 1 Column: Live Premium Printable Patient Card Preview */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border-2 border-primary shadow-sm text-center">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
              HAKIKI KADI YA PREMIUM (PATIENT DIGITAL BADGE)
            </h4>

            {selectedPatient ? (
              <div className="flex flex-col items-center">
                {/* 1. The Premium Printable Patient Card Element */}
                <div className="patient-card w-[320px] bg-white border-2 border-primary rounded-2xl shadow-xl overflow-hidden text-center pb-4 select-none">
                  
                  {/* Top Header Row with Clinic Title & Logo */}
                  <div className="w-12 h-12 flex items-center justify-center">
  <img src="/taaag3.png" alt="Logo" className="w-full h-full object-contain" />
</div>
                  <div className="text-left leading-tight">
                      <h2 className="text-sm font-black font-display text-primary tracking-tight">A-lfurqan HerbsClinic</h2>
                      <p className="text-[9px] text-secondary font-bold uppercase tracking-wider">Tiba Asili na Sunnah</p>
                    </div>
                  </div>

                  {/* Gradient Backed Photo Wrapper */}
                  <div className="bg-gradient-to-br from-primary to-[#1c4e6b] h-20 relative border-b-4 border-secondary flex justify-center items-center">
                    <img
                      src={selectedPatient.photoUrl || photoUrl}
                      alt={selectedPatient.name}
                      className="w-20 h-20 rounded-full border-3 border-white object-cover shadow-md absolute bottom-[-40px] left-1/2 -translate-x-1/2 z-10"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="px-6 pt-12 pb-3 text-center space-y-3">
                    <div>
                      <h3 className="text-base font-extrabold text-primary font-display tracking-tight uppercase line-clamp-1">
                        {selectedPatient.name}
                      </h3>
                      <span className="inline-block bg-secondary/5 border border-secondary/20 rounded-full px-3 py-0.5 text-[10px] font-extrabold text-secondary mt-1 font-mono uppercase tracking-widest">
                        {selectedPatient.cardNumber}
                      </span>
                    </div>

                    <div className="border-t-2 border-dashed border-primary/20 pt-3 text-left space-y-1.5 text-xs font-semibold text-gray-700">
                      <div className="flex justify-between">
                        <span className="text-primary opacity-70">MRN:</span>
                        <span className="font-bold text-primary font-mono">{selectedPatient.mrn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary opacity-70">Age / Jinsia:</span>
                        <span className="font-bold text-primary">{selectedPatient.age} Yrs / {selectedPatient.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary opacity-70">Simu ya Mgonjwa:</span>
                        <span className="font-bold text-primary font-mono">{selectedPatient.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary opacity-70">Location:</span>
                        <span className="font-bold text-primary truncate max-w-[150px]">{selectedPatient.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary opacity-70">Blood Group / BMI:</span>
                        <span className="font-bold text-secondary font-mono">{selectedPatient.bloodGroup} / {selectedPatient.bmi}</span>
                      </div>
                    </div>

                    {/* QR Code section */}
                    <div className="border-t-2 border-dashed border-primary/20 pt-3 flex items-center justify-between">
                      <div className="text-left space-y-0.5">
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Scan kwa Utambuzi</p>
                        <p className="text-[9px] text-secondary font-black tracking-widest uppercase">Siri & Usalama</p>
                        <p className="text-[8px] text-primary font-bold">Chini ya: Dr. Khalifa Rehani</p>
                        {selectedPatient.fingerprintPlaceholder && (
                          <span className="inline-flex items-center gap-1 text-[8px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-1 rounded">
                            <Fingerprint className="w-2.5 h-2.5" /> Biometric Secured
                          </span>
                        )}
                      </div>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${selectedPatient.cardNumber}`}
                        alt="QR"
                        className="w-12 h-12 p-0.5 bg-white border border-primary rounded shadow-inner"
                      />
                    </div>
                  </div>

                </div>

                                  {/* Printable Action Keys */}
                  <div className="mt-4 flex flex-col gap-2 w-full max-w-[320px]">
                    <button
                      onClick={() => window.print()}
                      className="p-3 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >

                    <Printer className="w-4 h-4" />
                    Chapisha Kadi Sasa (A4 / Card Ready)
                  </button>
                  <button
                    onClick={() => {
                      alert("Picha ya kadi imeandaliwa! Inajumuisha layout ya plastic-card, tayari kwa kutumwa moja kwa moja kwa WhatsApp.");
                    }}
                    className="p-3 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    Tuma Kadi kwa WhatsApp / Barua Pepe
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 font-semibold py-12">Sajili mgonjwa kwanza ili uone kadi yake hapa.</p>
            )}
          </div>

          {/* Quick lookup list of recently registered patients */}
          <div className="bg-white p-4 rounded-xl border-2 border-primary shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-primary font-display uppercase tracking-wider flex items-center justify-between">
              <span>Wagonjwa Waliopo ({patients.length})</span>
              <FileText className="w-4 h-4 text-secondary" />
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredPatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedPatient?.id === p.id 
                      ? "bg-secondary/10 border-secondary" 
                      : "bg-light-bg hover:bg-gray-200 border-primary/15"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={p.photoUrl}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover border border-primary/20"
                    />
                    <div>
                      <p className="text-xs font-bold text-primary leading-tight uppercase line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-secondary font-mono font-bold mt-0.5">{p.cardNumber} • {p.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Je, una uhakika unataka kufuta taarifa za ${p.name}?`)) {
                        onDeletePatient(p.id);
                        if (selectedPatient?.id === p.id) {
                          setSelectedPatient(patients[0] || null);
                        }
                      }
                    }}
                    className="p-1.5 text-primary hover:text-secondary hover:bg-secondary/10 rounded transition-colors"
                    title="Futa Mgonjwa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
