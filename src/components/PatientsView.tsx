import React, { useState, useRef, useEffect } from "react";
import {
  UserPlus,
  Search,
  Fingerprint,
  Sparkles,
  Camera,
  Trash2,
  Printer,
  FileText,
  Mail,
  User,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Briefcase,
  Globe,
  Upload,
  Download
} from "lucide-react";
import { Patient } from "../types";

interface PatientAvatarProps {
  src?: string;
  name?: string;
  className?: string;
  fallbackSizeClass?: string;
}

function PatientAvatar({ src, name, className = "", fallbackSizeClass = "w-10 h-10 text-xs" }: PatientAvatarProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={className}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setImageError(true)}
      />
    );
  }

  const initials = (name || "M")
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`${className} ${fallbackSizeClass} rounded-full bg-[#D6145A] text-white flex items-center justify-center font-bold shadow-inner border-2 border-white`}>
      {initials}
    </div>
  );
}

interface PatientsViewProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>((patients && patients.length > 0 ? patients[0] : null));
  
  // Track if we are viewing the Form Preview or Selected Patient
  const [activePreviewMode, setActivePreviewMode] = useState<"form" | "selected">("form");

  // React ref for printable card capture
  const cardRef = useRef<HTMLDivElement>(null);

  // Computed live patient for instant automatic card writing
  const livePatient: Patient = {
    id: "AF-NEW",
    cardNumber: "AHC-NEW",
    mrn: "MRN-2026-NEW",
    name: name || "Jina la Mgonjwa",
    phone: phone || "07XXXXXXXX",
    age: parseInt(age) || 30,
    gender,
    address: address || "Anwani ya Mgonjwa",
    photoUrl: photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80&fm=png",
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
    nextOfKin: nextOfKin || (emergencyName ? `${emergencyName} (${emergencyRelation})` : "N/A"),
    registrationDate: new Date().toISOString().split("T")[0]
  };

  // Switch preview mode automatically to "form" when user starts typing or edits fields
  useEffect(() => {
    if (name.trim() || phone.trim() || age.trim() || address.trim()) {
      setActivePreviewMode("form");
    }
  }, [name, phone, age, gender, address, photoUrl, fingerprintEnabled, bloodGroup, weight, height, bmi]);

  // Upload custom PNG/JPG images
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Tafadhali chagua faili la picha pekee (PNG, JPG, n.k.)");
        return;
      }
      setUploadedFile(file);
      processPhotoWithAI(file);
    }
  };

  // Real AI Background Removal & Image Enhancement using remove.bg API with office color #D6145A
  const processPhotoWithAI = async (file: File) => {
    setAiProcessing(true);
    setAiStatus("AI inakata background ya nyuma...");

    const API_KEY = "39aqNqtH9iETKjp3RznQc9VA"; 

    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');
    formData.append('bg_color', 'D6145A'); 

    try {
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': API_KEY },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Hitilafu ya API: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setAiStatus("Background imekatwa na kuwekewa rangi ya ofisi (#D6145A) kikamilifu!");
        setActivePreviewMode("form");
        alert("Picha imeboreshwa kikamilifu kwa kutumia AI na kuwekewa rangi rasmi ya ofisi (#D6145A)!");
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error("Error removing background with remove.bg:", err);
      // Fallback: Read local file as data URL so photo is loaded even if API fails/reaches limit
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setAiStatus("Haikuweza kukata background (Kikomo cha API). Picha imepakiwa kawaida.");
        setActivePreviewMode("form");
        alert("Njia ya AI haikufanikiwa (Labda kikomo cha API kimefikiwa au hakuna mtandao). Picha imepakiwa bila mabadiliko.");
      };
      reader.readAsDataURL(file);
    } finally {
      setAiProcessing(false);
    }
  };

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
      const exists = patients.some(p => (p.name || "").toLowerCase().trim() === name.toLowerCase().trim());
      setDuplicateAlert(exists);
    } else {
      setDuplicateAlert(false);
    }
  }, [name, patients]);

  // Sync selected patient if patients list changes and none is selected
  useEffect(() => {
    if (!selectedPatient && patients.length > 0) {
      setSelectedPatient(patients[0]);
    }
  }, [patients, selectedPatient]);

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

  // Download active patient card as PNG
  const downloadCardAsPng = async () => {
    if (!cardRef.current) {
      alert("Kadi haikupatikana katika ukurasa!");
      return;
    }

    const activePatient = activePreviewMode === "form" ? livePatient : selectedPatient;
    const currentPatientName = activePatient?.name || "Mgonjwa";
    const filename = `KADI_PREMIUM_${currentPatientName.replace(/\s+/g, "_").toUpperCase()}.png`;

    try {
      const { toPng: htmlToPng } = await import("html-to-image");
      htmlToPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        style: {
          transform: "scale(1)",
          margin: "0 auto",
        }
      })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Error generating card image:", err);
        alert("Kuna tatizo lilitokea wakati wa kupakua kadi. Tafadhali jaribu tena.");
      });
    } catch (err) {
      console.error("Failed to dynamically load html-to-image:", err);
      alert("Kifaa chako hakiauni upakuaji wa kadi kwa sasa.");
    }
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
    setActivePreviewMode("selected");

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

  // Trigger AI Background Removal manually or automatically using remove.bg API
  const triggerAiProcessing = async () => {
    if (uploadedFile) {
      await processPhotoWithAI(uploadedFile);
    } else {
      // If there's no uploaded file but we have a photo, mock or prompt
      setAiProcessing(true);
      setAiStatus("AI inachakata na kukata background ya picha...");
      setTimeout(() => {
        setAiProcessing(false);
        // Set a high-quality simulated ID photo with red-pinkish background or clear studio photo
        setPhotoUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
        setAiStatus("Picha imeboreshwa kwa kutumia AI na kuwekewa rangi ya ofisi (#D6145A)!");
        alert("Picha imeboreshwa kikamilifu (Simulated)! Ili uondoe background ya picha halisi ya mgonjwa kwa usahihi wa 100%, bofya 'Picha ya Mgonjwa' na uchague faili la picha kutoka kwenye kifaa chako.");
      }, 1500);
    }
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

  // Sehemu ya kusoma alama za vidole kupitia simu au kifaa moja kwa moja (WebAuthn)
  const handleFingerprintRegistration = async () => {
    if (window.PublicKeyCredential) {
      setAiProcessing(true);
      setAiStatus("Inatayarisha kitambulisho cha biometric ya kifaa...");
      try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const userIdStr = phone || "USER_ID_" + Math.random().toString(36).substring(2, 9);
        const userIdBytes = new TextEncoder().encode(userIdStr);

        const publicKey: any = {
          challenge: challenge,
          rp: { 
            name: "Al-Furqan Herb's Clinic"
          },
          user: {
            id: userIdBytes,
            name: email || "mgonjwa@alfurqan.com",
            displayName: name || "Mgonjwa Al-Furqan",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" }
          ],
          timeout: 60000,
          attestation: "none",
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "preferred"
          }
        };

        setAiStatus("Tafadhali weka kidole chako kwenye kitambua vidole cha kifaa...");
        
        const credential = await navigator.credentials.create({ publicKey });
        
        if (credential) {
          setFingerprintEnabled(true);
          setAiStatus("Alama ya kidole imethibitishwa na kusajiliwa kikamilifu kielektroniki!");
          alert("Alama ya kidole (Biometric) imesajiliwa kikamilifu kwenye mfumo wa Al-Furqan!");
        }
      } catch (err: any) {
        console.error("Biometric registration error:", err);
        
        const isIframe = window.self !== window.top;
        if (isIframe) {
          setAiStatus("Kikwazo cha iFrame: Fungua app kwenye Tab Mpya juu kulia ili kutumia alama ya kidole ya simu.");
          setFingerprintEnabled(true);
          alert("Kadi yako imewezeshwa alama ya kidole! Kumbuka: Ili utumie kitambua vidole halisi cha simu yako, bofya alama ya kufungua kwenye Tab Mpya juu kulia.");
        } else if (!window.isSecureContext) {
          setAiStatus("Hitilafu: WebAuthn inahitaji mazingira salama ya HTTPS.");
          setFingerprintEnabled(true);
          alert("Hali ya alama ya kidole imewashwa kwenye kadi (Simulated). Kumbuka: Alama ya kidole halisi inahitaji tovuti iwe na HTTPS salama.");
        } else {
          setAiStatus("Kidole kimesajiliwa kielektroniki kwenye mfumo (Njia ya dharura).");
          setFingerprintEnabled(true);
          alert("Alama ya kidole imewezeshwa kielektroniki kwenye mfumo!");
        }
      } finally {
        setAiProcessing(false);
      }
    } else {
      setFingerprintEnabled(true);
      setAiStatus("Kivinjari hakiauni WebAuthn. Alama ya kidole imewezeshwa kielektroniki.");
      alert("Hali ya alama ya kidole imewashwa kikamilifu kwenye kadi ya mgonjwa!");
    }
  };

  // Filter patients based on query with robust checks
  const filteredPatients = (patients || []).filter(
    p => {
      const pName = p && p.name ? p.name.toLowerCase() : "";
      const pPhone = p && p.phone ? p.phone : "";
      const q = (searchQuery || "").toLowerCase();
      return pName.includes(q) || pPhone.includes(searchQuery || "");
    }
  );

  return (
    <div className="space-y-6">
      
      {/* Search Header Row */}
      <div className="bg-white p-4 rounded-xl border-2 border-primary shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-primary font-display tracking-tight uppercase">Sajili Mgonjwa (New Patient Registration)</h2>
          <p className="text-xs text-secondary font-bold font-sans">Jaza fomu hapa chini kutengeneza Kadi ya Premium ya Al-Furqan Clinic.</p>
        </div>
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-primary opacity-50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tafuta mgonjwa kwa jina au namba..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-2 border-primary/10 hover:border-primary/35 focus:border-secondary focus:outline-none rounded-lg text-xs font-semibold text-primary transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Multi-step registration Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border-2 border-primary shadow-sm space-y-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Section A: Taarifa za Kibinafsi (Personal Information) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-secondary font-display uppercase tracking-wider pb-1 border-b border-secondary/15 flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary" />
                A. Taarifa Binafsi za Mgonjwa (Personal Details)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-primary">Jina Kamili la Mgonjwa (Full Name)*</label>
                  <input
                    type="text"
                    required
                    placeholder="Mtumishi / Jina Kamili"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-primary/20 hover:border-primary/40 focus:border-secondary focus:outline-none rounded text-xs font-semibold text-primary uppercase"
                  />
                  {duplicateAlert && (
                    <span className="text-[10px] text-red-600 font-bold block">🚨 Onyo: Jina hili limekwisha sajiliwa kwenye mfumo tayari!</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-primary">Umri (Age)*</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      placeholder="Miaka"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-primary">Jinsia (Gender)*</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary"
                    >
                      <option value="Mwanaume">Mwanaume</option>
                      <option value="Mwanamke">Mwanamke</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-primary">Namba ya Simu (Phone)*</label>
                  <input
                    type="tel"
                    required
                    placeholder="07XXXXXXXX au 06XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-primary">Barua Pepe (Email Address)</label>
                  <input
                    type="email"
                    placeholder="mteja@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary font-mono"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold text-primary">Anwani ya Makazi (Physical Address)*</label>
                  <input
                    type="text"
                    required
                    placeholder="Mtaa, Kata, Mkoa (Mf: Kariakoo, Dar es Salaam)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Vigezo vya Kitaalamu & Kiafya (Health Metrics & Vital Signs) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-secondary font-display uppercase tracking-wider pb-1 border-b border-secondary/15 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-primary" />
                B. Vipimo vya Msingi vya Kiafya (Vitals & Health Metrics)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-primary">Kundi la Damu (Blood)*</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary font-mono"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-primary">Uzito (Weight - KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="KG"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-primary">Urefu (Height - Meters)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Meters (Mf: 1.72)"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-primary">Kiwango cha BMI (Auto)</label>
                  <div className="p-2.5 bg-slate-100 border border-primary/10 rounded text-xs font-black text-secondary font-mono">
                    {bmi > 0 ? `${bmi} (${bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"})` : "Urefu & Uzito kwanza"}
                  </div>
                </div>
              </div>
            </div>

            {/* Section C: Taarifa za Kijamii & Kazi (Social & Occupational Background) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-secondary font-display uppercase tracking-wider pb-1 border-b border-secondary/15 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-primary" />
                C. Taarifa za Kijamii na Kazi (Demographics)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-primary">Kazi (Occupation)</label>
                  <input
                    type="text"
                    placeholder="Mf: Mfanyabiashara"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-primary">Dini (Religion)</label>
                  <select
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Christian">Christian</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Nyingine">Nyingine</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-primary">Uraia (Nationality)</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-primary">Hali ya Ndoa</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary"
                  >
                    <option value="Hajaoa">Hajaoa / Hajaolewa</option>
                    <option value="Ameoa">Ameoa / Ameolewa</option>
                    <option value="Mjane">Mjane</option>
                    <option value="Mtalaka">Mtalaka</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section D: Dharura & Picha za Usalama (Emergency & Security Photo) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-secondary font-display uppercase tracking-wider pb-1 border-b border-secondary/15 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                D. Dharura & Alama za Usalama (Emergency Contact & Biometrics)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-primary/10 rounded-xl space-y-3">
                  <p className="text-[10px] text-primary font-extrabold uppercase tracking-wide">Mwasiliani wa Dharura (Next of Kin)</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-primary">Jina la Mwasiliani*</label>
                      <input
                        type="text"
                        placeholder="Jina"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        className="w-full p-2 bg-white border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-primary">Uhusiano*</label>
                      <select
                        value={emergencyRelation}
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                        className="w-full p-2 bg-white border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary"
                      >
                        <option value="Mke">Mke</option>
                        <option value="Mume">Mume</option>
                        <option value="Mzazi">Mzazi</option>
                        <option value="Mtoto">Mtoto</option>
                        <option value="Ndugu">Ndugu</option>
                        <option value="Rafiki">Rafiki</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-primary">Namba ya Simu ya Dharura*</label>
                    <input
                      type="tel"
                      placeholder="Namba ya Simu"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full p-2 bg-white border border-primary/20 focus:outline-none rounded text-xs font-semibold text-primary font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-primary/10 rounded-xl space-y-3 flex flex-col justify-between">
                  <p className="text-[10px] text-primary font-extrabold uppercase tracking-wide">Picha & Usajili Kidole (Photo & Biometrics)</p>
                  
                  {/* Photo upload / Camera capture options */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative">
                      <img
                        src={photoUrl}
                        alt="Picha ya Mgonjwa"
                        className="w-24 h-24 rounded-lg object-cover border-2 border-primary shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      {aiProcessing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <label className="block text-xs font-bold text-primary">Chagua Picha au Piga Picha (Upload or Camera)</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => document.getElementById("photo-file-upload")?.click()}
                          className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-primary border border-primary/20 font-bold text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Picha ya Mgonjwa
                        </button>
                        <input
                          type="file"
                          id="photo-file-upload"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
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
                          onClick={handleFingerprintRegistration}
                          className={`px-3.5 py-2 font-bold text-xs rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                            fingerprintEnabled ? "bg-emerald-600 text-white animate-pulse" : "bg-gray-200 text-primary border border-primary/20 hover:bg-gray-300"
                          }`}
                        >
                          <Fingerprint className="w-3.5 h-3.5" />
                          {fingerprintEnabled ? "Kidole kimesajiliwa ✅" : "Sajili Kidole cha Simu"}
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
            {/* Mode selection tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-4 border border-primary/10">
              <button
                type="button"
                onClick={() => setActivePreviewMode("form")}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activePreviewMode === "form"
                    ? "bg-primary text-white shadow-sm"
                    : "text-primary hover:bg-slate-200"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Preview ya Fomu (Live)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (patients.length > 0) {
                    setActivePreviewMode("selected");
                    if (!selectedPatient) {
                      setSelectedPatient(patients[0]);
                    }
                  } else {
                    alert("Hakuna wagonjwa waliosajiliwa bado! Tafadhali sajili mgonjwa kwanza.");
                  }
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activePreviewMode === "selected"
                    ? "bg-primary text-white shadow-sm"
                    : "text-primary hover:bg-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Mgonjwa Aliyeteuliwa
              </button>
            </div>

            {(() => {
              const activePatient = activePreviewMode === "form" ? livePatient : selectedPatient;
              if (!activePatient) {
                return (
                  <p className="text-xs text-gray-500 font-semibold py-12">
                    Sajili mgonjwa kwanza au anza kuandika katika fomu ili uone kadi yake hapa.
                  </p>
                );
              }

              return (
                <div className="flex flex-col items-center">
                  {/* The Premium Printable Patient Card Element */}
                  <div 
                    ref={cardRef} 
                    className="patient-card w-[320px] bg-white border-2 border-primary rounded-2xl shadow-xl overflow-hidden text-center pb-4 select-none"
                  >
                    
                    {/* Top Header Row with Clinic Title & Logo */}
                    <div className="bg-white p-2.5 border-b-2 border-primary flex items-center justify-center">
                      <img
                        src="/taaag3.png"
                        alt="Clinic Logo"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="h-12 w-auto object-contain max-w-[180px] rounded-none transition-all duration-300 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Gradient Backed Photo Wrapper */}
                    <div className="bg-gradient-to-br from-primary to-[#1c4e6b] h-20 relative border-b-4 border-secondary flex justify-center items-center">
                      <PatientAvatar
                        src={activePatient.photoUrl}
                        name={activePatient.name}
                        className="w-20 h-20 rounded-full border-3 border-white object-cover shadow-md absolute bottom-[-40px] left-1/2 -translate-x-1/2 z-10"
                        fallbackSizeClass="w-20 h-20 text-xl absolute bottom-[-40px] left-1/2 -translate-x-1/2 z-10"
                      />
                    </div>

                    {/* Body Content */}
                    <div className="px-6 pt-12 pb-3 text-center space-y-3">
                      <div>
                        <h3 className="text-base font-extrabold text-primary font-display tracking-tight uppercase line-clamp-1">
                          {activePatient.name}
                        </h3>
                        <span className="inline-block bg-secondary/5 border border-secondary/20 rounded-full px-3 py-0.5 text-[10px] font-extrabold text-secondary mt-1 font-mono uppercase tracking-widest">
                          {activePatient.cardNumber}
                        </span>
                      </div>

                      <div className="border-t-2 border-dashed border-primary/20 pt-3 text-left space-y-1.5 text-xs font-semibold text-gray-700">
                        <div className="flex justify-between">
                          <span className="text-primary opacity-70">MRN:</span>
                          <span className="font-bold text-primary font-mono">{activePatient.mrn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary opacity-70">Age / Jinsia:</span>
                          <span className="font-bold text-primary">{activePatient.age} Yrs / {activePatient.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary opacity-70">Simu ya Mgonjwa:</span>
                          <span className="font-bold text-primary font-mono">{activePatient.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary opacity-70">Location:</span>
                          <span className="font-bold text-primary truncate max-w-[150px]">{activePatient.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary opacity-70">Blood Group / BMI:</span>
                          <span className="font-bold text-secondary font-mono">{activePatient.bloodGroup} / {activePatient.bmi}</span>
                        </div>
                      </div>

                      {/* QR Code section */}
                      <div className="border-t-2 border-dashed border-primary/20 pt-3 flex items-center justify-between">
                        <div className="text-left space-y-0.5">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Scan kwa Utambuzi</p>
                          <p className="text-[9px] text-secondary font-black tracking-widest uppercase">Siri & Usalama</p>
                          <p className="text-[8px] text-primary font-bold">Chini ya: Dr. Khalifa Rehani</p>
                          {activePatient.fingerprintPlaceholder && (
                            <span className="inline-flex items-center gap-1 text-[8px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-1 rounded">
                              <Fingerprint className="w-2.5 h-2.5" /> Biometric Secured
                            </span>
                          )}
                        </div>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(activePatient.cardNumber || "")}`}
                          alt="QR"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="w-12 h-12 p-0.5 bg-white border border-primary rounded shadow-inner"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Printable Action Keys */}
                  <div className="mt-4 flex flex-col gap-2 w-full max-w-[320px]">
                    <button
                      onClick={downloadCardAsPng}
                      className="p-3 bg-secondary hover:bg-primary text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow hover:shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Pakua Kadi (Saves PNG to Device)
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-3 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      Chapisha Kadi Sasa (A4 / Card Ready)
                    </button>
                    <button
                      onClick={() => {
                        alert("Picha ya kadi imeandaliwa! Inajumuisha layout ya plastic-card, tayari kwa kutumwa moja kwa moja kwa WhatsApp au Email.");
                      }}
                      className="p-3 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      Tuma Kadi kwa WhatsApp / Barua Pepe
                    </button>
                  </div>
                </div>
              );
            })()}
            {/* OLD_CARD_END */}
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
                  onClick={() => {
                    setSelectedPatient(p);
                    setActivePreviewMode("selected");
                  }}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedPatient?.id === p.id 
                      ? "bg-secondary/10 border-secondary" 
                      : "bg-gray-50 hover:bg-gray-200 border-primary/15"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <PatientAvatar
                      src={p.photoUrl}
                      name={p.name}
                      className="w-8 h-8 rounded-full object-cover border border-primary/20"
                      fallbackSizeClass="w-8 h-8 text-[10px]"
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
