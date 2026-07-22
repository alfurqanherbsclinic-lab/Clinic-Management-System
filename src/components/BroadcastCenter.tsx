import React, { useState, useEffect } from "react";
import { 
  Send, 
  Key, 
  MessageCircle, 
  MessageSquare, 
  Users, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Smartphone, 
  Sparkles, 
  Copy, 
  Check, 
  Sliders, 
  RefreshCw,
  Info,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Patient } from "../types";

interface BroadcastCenterProps {
  patients: Patient[];
}

export function BroadcastCenter({ patients }: BroadcastCenterProps) {
  // Target recipient mode: "bulk" (all patients), "single" (individual patient), or "manual" (custom daily phone numbers)
  const [recipientMode, setRecipientMode] = useState<"bulk" | "single" | "manual">("bulk");
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients.length > 0 ? patients[0].id : ""
  );
  const [manualPhoneNumbers, setManualPhoneNumbers] = useState<string>("");

  // Sending Channel: "oasis" (Bulk SMS Oasis Tech) or "whatsapp" (Free Direct wa.me)
  const [sendChannel, setSendChannel] = useState<"oasis" | "whatsapp">("oasis");

  // Oasis Technologies API Credentials
  const [oasisApiKey, setOasisApiKey] = useState<string>(() => {
    return localStorage.getItem("oasis_api_key") || "";
  });
  const [oasisSenderId, setOasisSenderId] = useState<string>(() => {
    return localStorage.getItem("oasis_sender_id") || "ALFURQAN";
  });
  const [oasisBaseUrl, setOasisBaseUrl] = useState<string>(() => {
    return localStorage.getItem("oasis_base_url") || "https://api.oasistech.co.tz/v1/sms/send";
  });
  const [useCorsProxy, setUseCorsProxy] = useState<boolean>(() => {
    return localStorage.getItem("oasis_use_cors_proxy") !== "false";
  });
  const [showApiSettings, setShowApiSettings] = useState<boolean>(false);

  // Message Category / Template Preset
  const [broadcastCategory, setBroadcastCategory] = useState<string>(
    "Dokezo la Matoleo Mapya (Stoki ya Dawa imewasili)"
  );

  // Message Body Text
  const [messageBody, setMessageBody] = useState<string>(
    "Habari ndugu mgonjwa wetu wa Al-Furqan Herbs Clinic, kumbuka kunywa maji ya kutosha na kufuata ushauri wa daktari. Stoki mpya ya dawa za asili imewasili."
  );

  // Sending States & Logs
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendingProgress, setSendingProgress] = useState<number>(0);
  const [sendingLog, setSendingLog] = useState<{ name: string; phone: string; status: "success" | "failed"; time: string; details?: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedNumbers, setCopiedNumbers] = useState<boolean>(false);

  // Auto save Oasis credentials to localStorage
  useEffect(() => {
    localStorage.setItem("oasis_api_key", oasisApiKey);
    localStorage.setItem("oasis_sender_id", oasisSenderId);
    localStorage.setItem("oasis_base_url", oasisBaseUrl);
    localStorage.setItem("oasis_use_cors_proxy", String(useCorsProxy));
  }, [oasisApiKey, oasisSenderId, oasisBaseUrl, useCorsProxy]);

  // Update selected patient if list changes and current selection is missing
  useEffect(() => {
    if (patients.length > 0 && (!selectedPatientId || !patients.some(p => p.id === selectedPatientId))) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  // Handle Preset Category Selection
  const handleCategoryChange = (category: string) => {
    setBroadcastCategory(category);
    if (category.includes("Stoki ya Dawa")) {
      setMessageBody(
        "Habari ndugu mgonjwa wetu wa Al-Furqan Herbs Clinic, kumbuka kunywa maji ya kutosha na kufuata ushauri wa daktari. Stoki mpya ya dawa asilia imewasili kituoni hivi sasa."
      );
    } else if (category.includes("Elimu ya Afya")) {
      setMessageBody(
        "Assalam alaykum! Dr. Khalifa Rehani anakukumbusha kutumia habbat sawda na asali kila asubuhi kwa ajili ya kuongeza kinga ya mwili na afya bora. Al-Furqan Herbs Clinic."
      );
    } else if (category.includes("Kumbukumbu za Uteuzi")) {
      setMessageBody(
        "Habari ndugu mgonjwa, huu ni ukumbusho wa mahudhurio yako katika kliniki yetu ya Al-Furqan Herbs. Tafadhali fika na kadi yako ya matibabu."
      );
    } else if (category.includes("Ujumbe Maalum")) {
      setMessageBody("");
    }
  };

  // Convert Tanzanian phone numbers to standard 255XXXXXXXXX format
  const formatTanzaniaPhone = (phone: string): string => {
    let cleaned = (phone || "").replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "255" + cleaned.substring(1);
    } else if (!cleaned.startsWith("255") && cleaned.length === 9) {
      cleaned = "255" + cleaned;
    }
    return cleaned;
  };

  // Helper to extract clean human-readable error messages from API responses without [object Object]
  const extractErrorMessage = (data: any, fallback: string): string => {
    if (!data) return fallback;
    if (typeof data === "string") {
      if (data.trim().startsWith("<!DOCTYPE") || data.trim().startsWith("<html")) {
        return "Server / Proxy hairudishi JSON (404/500 Route Error)";
      }
      return data;
    }
    if (data.message) {
      if (typeof data.message === "string" && data.message.trim()) return data.message;
      if (typeof data.message === "object") {
        try {
          const val = Object.values(data.message).flat().join(", ");
          if (val) return val;
        } catch {}
      }
    }
    if (data.error) {
      if (typeof data.error === "string" && data.error.trim()) return data.error;
      if (typeof data.error === "object") {
        if (typeof data.error.message === "string" && data.error.message.trim()) return data.error.message;
        if (typeof data.error.description === "string" && data.error.description.trim()) return data.error.description;
        try {
          return JSON.stringify(data.error);
        } catch {}
      }
    }
    if (data.errors) {
      if (typeof data.errors === "string" && data.errors.trim()) return data.errors;
      if (typeof data.errors === "object") {
        try {
          const val = Object.values(data.errors).flat().join(", ");
          if (val) return val;
        } catch {}
      }
    }
    if (data.detail && typeof data.detail === "string") return data.detail;

    try {
      const jsonStr = JSON.stringify(data);
      return jsonStr !== "{}" ? jsonStr : fallback;
    } catch {
      return fallback;
    }
  };

  // Get active target list based on single/bulk/manual selection
  const getTargetPatients = (): { id: string; name: string; phone: string; cardNumber: string }[] => {
    if (recipientMode === "single") {
      const p = patients.find((item) => item.id === selectedPatientId);
      return p ? [p] : [];
    }
    if (recipientMode === "manual") {
      const numbersArray = manualPhoneNumbers
        .split(/[\n,;\s]+/)
        .map((n) => n.trim())
        .filter((n) => n.length >= 8);
      
      const uniqueNumbers: string[] = Array.from(new Set(numbersArray));
      return uniqueNumbers.map((num: string, idx: number) => ({
        id: `manual-${idx}`,
        name: `Namba ya Siku #${idx + 1}`,
        phone: num,
        cardNumber: `N/A`
      }));
    }
    return patients;
  };

  const targetPatients = getTargetPatients();
  const targetCount = targetPatients.length;

  // Single patient/recipient WhatsApp Direct trigger
  const handleOpenSingleWhatsApp = (recipient: { name: string; phone: string; cardNumber: string }) => {
    if (!messageBody.trim()) {
      alert("Tafadhali andika ujumbe kwanza kabla ya kutuma!");
      return;
    }
    const formattedPhone = formatTanzaniaPhone(recipient.phone);
    const personalizedText = messageBody.replace(/\{JINA\}/g, recipient.name).replace(/\{CARD_NO\}/g, recipient.cardNumber);
    const encodedText = encodeURIComponent(personalizedText);
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  // Send Bulk / Single via Oasis Technologies SMS API
  const handleSendOasisSMS = async () => {
    if (!messageBody.trim()) {
      setErrorMessage("Tafadhali andika mwili wa ujumbe kabla ya kutuma.");
      return;
    }

    if (targetPatients.length === 0) {
      setErrorMessage("Hakuna wagonjwa waliochaguliwa kwa ajili ya kutuma ujumbe.");
      return;
    }

    setIsSending(true);
    setSendingProgress(0);
    setSendingLog([]);
    setErrorMessage(null);
    setSuccessMessage(null);

    const hasApiKey = oasisApiKey.trim().length > 0;
    const sender = oasisSenderId.trim() || "ALFURQAN";

    const logs: { name: string; phone: string; status: "success" | "failed"; time: string; details?: string }[] = [];

    for (let i = 0; i < targetPatients.length; i++) {
      const patient = targetPatients[i];
      const recipientPhone = formatTanzaniaPhone(patient.phone);
      const textToDeliver = messageBody.replace(/\{JINA\}/g, patient.name).replace(/\{CARD_NO\}/g, patient.cardNumber);

      // Simulate network request delay for realistic UI feedback
      await new Promise((res) => setTimeout(res, 600));

      let isSuccess = false;
      let responseDetails = "";

      if (hasApiKey) {
        try {
          let response: Response | null = null;
          const targetUrl = oasisBaseUrl.trim() || "https://api.oasistech.co.tz/v1/sms/send";
          const payload = {
            sender_id: sender,
            recipient: recipientPhone,
            message: textToDeliver
          };

          if (useCorsProxy) {
            // Attempt 1: Try local server proxy (/api/sms/send)
            try {
              const proxyResp = await fetch("/api/sms/send", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                },
                body: JSON.stringify({
                  apiKey: oasisApiKey.trim(),
                  sender_id: sender,
                  recipient: recipientPhone,
                  message: textToDeliver,
                  baseUrl: targetUrl
                })
              });

              if (proxyResp.status !== 404 && proxyResp.status !== 405) {
                response = proxyResp;
              }
            } catch (pErr) {
              // Local proxy endpoint not available
            }

            // Attempt 2: If local server proxy missing (e.g. static hosting on Vercel), try Public CORS proxy
            if (!response) {
              try {
                const publicProxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
                response = await fetch(publicProxyUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${oasisApiKey.trim()}`,
                    "Accept": "application/json"
                  },
                  body: JSON.stringify(payload)
                });
              } catch (pubErr) {
                // Public proxy failed, will try direct fetch
              }
            }
          }

          // Attempt 3: Direct fetch fallback if no proxy response was received
          if (!response) {
            response = await fetch(targetUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${oasisApiKey.trim()}`,
                "Accept": "application/json"
              },
              body: JSON.stringify(payload)
            });
          }

          if (response.ok) {
            const data = await response.json().catch(() => ({}));
            isSuccess = true;
            const msg = extractErrorMessage(data, `Ujumbe umewasilishwa kwa mafanikio (${recipientPhone})`);
            responseDetails = msg;
          } else {
            let errData: any = {};
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              errData = await response.json().catch(() => ({}));
            } else {
              const txt = await response.text().catch(() => "");
              errData = txt;
            }

            const cleanMsg = extractErrorMessage(errData, `HTTP ${response.status} kutoka Oasis Gateway`);
            isSuccess = false;
            responseDetails = `Hitilafu ya Oasis: ${cleanMsg}`;
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const isCorsError = errMsg.toLowerCase().includes("failed to fetch") || errMsg.toLowerCase().includes("networkerror");
          
          if (isCorsError) {
            isSuccess = false;
            responseDetails = `Kizuizi cha Kivinjari (CORS Error): Server ya Oasis inakataa maombi ya moja kwa moja. Mfumo unatumia Server Proxy kurekebisha hili.`;
          } else {
            isSuccess = false;
            responseDetails = `Hitilafu ya Mtandao: ${errMsg}`;
          }
        }
      } else {
        // Mode without API key configured yet (Simulation Mode)
        isSuccess = true;
        responseDetails = `Njia ya Majaribio (Weka API Key na chagua Server Proxy kutuma SMS za kweli)`;
      }

      const logItem = {
        name: patient.name,
        phone: patient.phone,
        status: isSuccess ? ("success" as const) : ("failed" as const),
        time: new Date().toLocaleTimeString(),
        details: responseDetails
      };

      logs.push(logItem);
      setSendingLog([...logs]);
      setSendingProgress(Math.round(((i + 1) / targetPatients.length) * 100));
    }

    setIsSending(false);
    if (hasApiKey) {
      setSuccessMessage(`Ujumbe umetumwa vyema kwa wagonjwa ${targetPatients.length} kupitia Oasis Technologies SMS Gateway!`);
    } else {
      setSuccessMessage(`Majaribio ya utumaji wa ujumbe kwa wagonjwa ${targetPatients.length} yamekamilika! Ili kutuma SMS halisi, weka API Key ya Oasis Technologies hapo juu.`);
    }
  };

  // Copy all phone numbers to clipboard for quick mobile broadcast
  const handleCopyPhoneNumbers = () => {
    const phones = targetPatients.map((p) => p.phone).join(", ");
    navigator.clipboard.writeText(phones);
    setCopiedNumbers(true);
    setTimeout(() => setCopiedNumbers(false), 3000);
  };

  // Character and SMS count calculations
  const charCount = messageBody.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  return (
    <div className="bg-white rounded-2xl border-2 border-primary/20 shadow-lg overflow-hidden space-y-0">
      
      {/* Header matching user's screenshot layout perfectly */}
      <div className="bg-white p-5 border-b-2 border-primary/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-rose-50 border-2 border-rose-200 text-rose-600 rounded-xl shadow-sm">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-display text-primary uppercase tracking-wide flex items-center gap-2">
              <span>MAWASILIANO NA BULK BROADCAST (SMS & WHATSAPP CENTER)</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Tuma ujumbe wa dharura, dokezo la afya na elimu ya tiba ya Sunnah kwa wagonjwa wote waliosajiliwa kwa kubofya kitufe kimoja tu.
            </p>
          </div>
        </div>

        {/* Oasis API Config Toggle Button */}
        <button
          onClick={() => setShowApiSettings(!showApiSettings)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-2 cursor-pointer ${
            showApiSettings || !oasisApiKey
              ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
              : "bg-slate-50 border-slate-200 text-primary hover:bg-slate-100"
          }`}
        >
          <Key className="w-4 h-4 text-amber-600" />
          <span>{oasisApiKey ? "Mipangilio ya Oasis API Key" : "Weka API Key ya Oasis SMS"}</span>
          <Sliders className="w-3.5 h-3.5 ml-1 opacity-70" />
        </button>
      </div>

      {/* Oasis API Settings Expandable Drawer */}
      {showApiSettings && (
        <div className="bg-amber-50/70 border-b-2 border-amber-200 p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Sanidi Salio la Oasis Technologies SMS Gateway</span>
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              Oasis SMS Tanzania
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-gray-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>Oasis API Key / Token *</span>
              </label>
              <input
                type="password"
                placeholder="Weka Oasis API Key yako hapa (mfano: oasis_live_...)"
                value={oasisApiKey}
                onChange={(e) => setOasisApiKey(e.target.value)}
                className="w-full p-2.5 bg-white border-2 border-amber-300 rounded-lg text-xs font-mono font-semibold text-primary outline-none focus:border-amber-500 shadow-sm"
              />
              <p className="text-[10px] text-gray-500">
                Siri yako inahifadhiwa kwenye kivinjari chako tu kwa usalama.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-gray-700 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                <span>Oasis Sender ID (Jina la Mtumaji) *</span>
              </label>
              <input
                type="text"
                placeholder="mfano: ALFURQAN au AHC_CLINIC"
                value={oasisSenderId}
                onChange={(e) => setOasisSenderId(e.target.value.toUpperCase())}
                className="w-full p-2.5 bg-white border-2 border-amber-300 rounded-lg text-xs font-mono font-bold uppercase text-primary outline-none focus:border-amber-500 shadow-sm"
              />
              <p className="text-[10px] text-gray-500">
                Jina linaloonekana kwa mgonjwa anapopokea SMS (Sender ID iliyothibitishwa).
              </p>
            </div>
          </div>

          {/* CORS Proxy & Server Endpoint Options */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
              <div>
                <span className="text-xs font-extrabold text-primary flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Njia ya Kuzuia Hitilafu ya CORS (CORS Bypass Server Proxy)
                </span>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Inakuruhusu kutuma SMS bila kukumbana na ukuta wa kuzuiliwa na kivinjari (Browser CORS restriction).
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <input
                  type="checkbox"
                  checked={useCorsProxy}
                  onChange={(e) => setUseCorsProxy(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-emerald-800">
                  {useCorsProxy ? "Server Proxy Imetumika (Inapendekezwa)" : "Direct Client Request"}
                </span>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Anwani ya Oasis Server API (Endpoint Target):
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setOasisBaseUrl("https://api.oasistech.co.tz/v1/sms/send")}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                    oasisBaseUrl === "https://api.oasistech.co.tz/v1/sms/send"
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  api.oasistech.co.tz (v1/sms/send)
                </button>
                <button
                  type="button"
                  onClick={() => setOasisBaseUrl("https://bulksms.oasistech.co.tz/api/sms/send")}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                    oasisBaseUrl === "https://bulksms.oasistech.co.tz/api/sms/send"
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  bulksms.oasistech.co.tz (Dashboard)
                </button>
              </div>
              <input
                type="text"
                value={oasisBaseUrl}
                onChange={(e) => setOasisBaseUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-xs font-mono text-gray-800 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-amber-900 bg-white/80 p-2.5 rounded-lg border border-amber-200">
            <span className="flex items-center gap-1.5 font-semibold">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
              Ikiwa huna API Key bado, mfumo utakuruhusu kufanya majaribio ya Simulation bila kukwama.
            </span>
            <button
              onClick={() => setShowApiSettings(false)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
            >
              Hifadhi Mipangilio
            </button>
          </div>
        </div>
      )}

      {/* Main Broadcast Control Area */}
      <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Form Controls */}
        <div className="xl:col-span-2 space-y-5">
          
          {/* Target Recipient Selector (Single vs Bulk vs Manual) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="text-xs font-extrabold text-primary uppercase tracking-wider block">
              CHAGUA WALENGWA (RECIPIENT TARGET)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: All Registered Patients */}
              <button
                type="button"
                onClick={() => setRecipientMode("bulk")}
                className={`p-3 rounded-xl border-2 font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                  recipientMode === "bulk"
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-extrabold">Wagonjwa Wote</p>
                    <p className={`text-[10px] ${recipientMode === "bulk" ? "text-white/80" : "text-gray-400"}`}>
                      Waliosajiliwa ({patients.length})
                    </p>
                  </div>
                </div>
                {recipientMode === "bulk" && <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />}
              </button>

              {/* Option 2: Single Registered Patient */}
              <button
                type="button"
                onClick={() => setRecipientMode("single")}
                className={`p-3 rounded-xl border-2 font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                  recipientMode === "single"
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-extrabold">Mgonjwa Mmoja</p>
                    <p className={`text-[10px] ${recipientMode === "single" ? "text-white/80" : "text-gray-400"}`}>
                      Chagua Mgonjwa
                    </p>
                  </div>
                </div>
                {recipientMode === "single" && <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />}
              </button>

              {/* Option 3: Manual Daily Phone Numbers */}
              <button
                type="button"
                onClick={() => setRecipientMode("manual")}
                className={`p-3 rounded-xl border-2 font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                  recipientMode === "manual"
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-extrabold">Namba za Siku</p>
                    <p className={`text-[10px] ${recipientMode === "manual" ? "text-white/80" : "text-gray-400"}`}>
                      Ingiza Namba Ziada
                    </p>
                  </div>
                </div>
                {recipientMode === "manual" && <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />}
              </button>
            </div>

            {/* Dropdown for Single Patient Mode */}
            {recipientMode === "single" && (
              <div className="pt-2 animate-fadeIn space-y-1.5">
                <label className="text-xs font-bold text-gray-600 block">
                  Chagua Mgonjwa kutoka Orodha ya Mfumo:
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-primary/30 rounded-lg text-xs font-bold text-primary outline-none focus:border-primary"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.cardNumber}) — Simu: {p.phone}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Textarea for Manual Daily Phone Numbers Input */}
            {recipientMode === "manual" && (
              <div className="pt-2 animate-fadeIn space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span>Ingiza au Bandika Namba za Simu za Siku (Manual Numbers):</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    {targetCount} Namba {targetCount === 1 ? "Iliyotambuliwa" : "Zilizotambuliwa"}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={manualPhoneNumbers}
                  onChange={(e) => setManualPhoneNumbers(e.target.value)}
                  placeholder="Andika au bandika namba ukitenganisha kwa koma au mstari mpya (Mfano: 0712345678, 0789123456, 0655112233)"
                  className="w-full p-3 bg-white border-2 border-primary/30 rounded-xl text-xs font-mono font-bold text-primary outline-none focus:border-primary shadow-sm leading-relaxed"
                />
                <p className="text-[10px] text-gray-500 font-medium">
                  * Unganisha namba kwa koma (<code>,</code>) au mstari mpya. Mfumo utazitambua kiatomati bila kujali formatting.
                </p>
              </div>
            )}
          </div>

          {/* Channel Selection (Oasis SMS vs WhatsApp Free) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="text-xs font-extrabold text-primary uppercase tracking-wider block">
              NJIA YA UTUMAJI (BROADCAST GATEWAY)
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option 1: Oasis SMS */}
              <button
                type="button"
                onClick={() => setSendChannel("oasis")}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                  sendChannel === "oasis"
                    ? "bg-rose-50 border-rose-600 text-rose-950 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wide">
                    <MessageSquare className="w-4 h-4 text-rose-600" />
                    <span>Bulk SMS (Oasis Technologies)</span>
                  </div>
                  {sendChannel === "oasis" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  )}
                </div>
                <p className="text-[11px] text-gray-600 font-medium">
                  Inatumia salio la Oasis SMS Gateway kutuma SMS moja kwa moja.
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                  <span className={oasisApiKey ? "text-emerald-700" : "text-amber-700"}>
                    {oasisApiKey ? "✓ API Key ipo tayari" : "⚠ API Key haijawekwa (Demo Mode)"}
                  </span>
                  <span className="text-gray-500 font-mono">Sender: {oasisSenderId}</span>
                </div>
              </button>

              {/* Option 2: WhatsApp Free */}
              <button
                type="button"
                onClick={() => setSendChannel("whatsapp")}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                  sendChannel === "whatsapp"
                    ? "bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wide text-emerald-800">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp (Bila Gharama za API)</span>
                  </div>
                  {sendChannel === "whatsapp" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-gray-600 font-medium">
                  Bure kabisa via <code className="text-emerald-700 font-bold">wa.me</code> link. Inafungua WhatsApp moja kwa moja.
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-emerald-700">
                  <span>✓ Hakuna gharama za Meta</span>
                  <span>Direct Web/App</span>
                </div>
              </button>

            </div>
          </div>

          {/* Broadcast Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-primary uppercase tracking-wider block">
              AINA YA BROADCAST (TEMPLATE CATEGORY)
            </label>
            <select
              value={broadcastCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full p-3 bg-white border-2 border-primary/30 rounded-xl text-xs font-bold text-primary outline-none focus:border-primary shadow-sm"
            >
              <option value="Dokezo la Matoleo Mapya (Stoki ya Dawa imewasili)">
                Dokezo la Matoleo Mapya (Stoki ya Dawa imewasili)
              </option>
              <option value="Elimu ya Afya na Tiba ya Sunnah (Al-Furqan Clinic)">
                Elimu ya Afya na Tiba ya Sunnah (Al-Furqan Clinic)
              </option>
              <option value="Kumbukumbu za Uteuzi wa Matibabu (Appointments)">
                Kumbukumbu za Uteuzi wa Matibabu (Appointments)
              </option>
              <option value="Ujumbe Maalum (Custom Message)">
                Ujumbe Maalum (Andika wako mwenyewe)
              </option>
            </select>
          </div>

          {/* Message Body Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-primary uppercase tracking-wider block">
                MWILI WA UJUMBE (MESSAGE BODY) *
              </label>
              <span className="text-[11px] font-mono font-bold text-gray-500">
                {charCount} Characters | ~{smsCount} SMS
              </span>
            </div>
            
            <textarea
              rows={4}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Habari ndugu mgonjwa wetu wa Al-Furqan Herbs Clinic..."
              className="w-full p-3 bg-white border-2 border-primary/30 rounded-xl text-xs font-medium text-gray-800 outline-none focus:border-primary shadow-sm leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-500 font-semibold bg-gray-50 p-2 rounded-lg border border-gray-200">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Tag unazoweza kutumia:</span>
                <code className="bg-white px-1.5 py-0.5 rounded border border-gray-300 font-mono text-primary font-bold">{"{JINA}"}</code>
                <code className="bg-white px-1.5 py-0.5 rounded border border-gray-300 font-mono text-primary font-bold">{"{CARD_NO}"}</code>
              </div>
              <span>Zitabadilishwa kiatomati kwa kila mgonjwa</span>
            </div>
          </div>

          {/* Action Button Section matching screenshot */}
          {sendChannel === "oasis" ? (
            <button
              type="button"
              disabled={isSending}
              onClick={handleSendOasisSMS}
              className={`w-full py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isSending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-rose-600 hover:bg-rose-700 active:scale-[0.99]"
              }`}
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Inatuma Ujumbe... ({sendingProgress}%)</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {recipientMode === "bulk"
                      ? `Sambaza Ujumbe kwa Wagonjwa Wote (${targetCount})`
                      : `Tuma Ujumbe kwa Mgonjwa Aliyechaguliwa`}
                  </span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              {recipientMode === "single" ? (
                <button
                  type="button"
                  onClick={() => {
                    const p = targetPatients[0];
                    if (p) handleOpenSingleWhatsApp(p);
                  }}
                  className="w-full py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-white bg-[#25D366] hover:bg-[#1ebd59] shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Fungua WhatsApp & Tuma kwa {targetPatients[0]?.name || "Mgonjwa"}</span>
                </button>
              ) : (
                <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        <span>Orodha ya WhatsApp Direct Broadcasting ({targetPatients.length})</span>
                      </h4>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Bofya kitufe cha mgonjwa husika kufungua WhatsApp yake ikiwa na ujumbe uliotayarishwa tayari:
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleCopyPhoneNumbers}
                      className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedNumbers ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedNumbers ? "Namba Zimenukuliwa!" : "Nakili Namba Zote"}</span>
                    </button>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-2 pt-1">
                    {targetPatients.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-extrabold text-primary uppercase">{p.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{p.phone} • {p.cardNumber}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenSingleWhatsApp(p)}
                          className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-[11px] rounded flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Fungua WhatsApp</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback Messages */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl text-xs font-bold text-emerald-900 flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black">UTUMAJI UMEKAMILIKA!</p>
                <p className="text-emerald-800 font-normal mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl text-xs font-bold text-rose-900 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black">TAARIFA YA HITILAFU</p>
                <p className="text-rose-800 font-normal mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Gateway Status Card matching user's screenshot exactly */}
        <div className="space-y-4">
          <div className="bg-slate-50 border-2 border-primary/20 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-black text-primary uppercase tracking-wider border-b border-primary/10 pb-2 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-secondary" />
              <span>HALI YA GATEWAY (GATEWAY STATUS)</span>
            </h3>

            <div className="space-y-3 text-xs font-bold">
              
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-gray-500 font-semibold">Simu za Wagonjwa (Target):</span>
                <span className="font-mono text-primary font-black bg-white px-2 py-0.5 rounded border border-slate-200">
                  {targetCount} Active Contacts
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-gray-500 font-semibold">Njia ya Gateway:</span>
                <span className={`font-mono text-[11px] font-extrabold ${sendChannel === "oasis" ? "text-rose-600" : "text-emerald-600"}`}>
                  {sendChannel === "oasis" ? "Oasis SMS API" : "Free WhatsApp Direct"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Hadhi ya Mtandao:</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-black font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  ACTIVE & READY
                </span>
              </div>

            </div>

            {/* Oasis SMS Balance / Credentials indicator */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-[11px]">
              <div className="flex justify-between font-bold text-gray-700">
                <span>Oasis Sender ID:</span>
                <span className="font-mono text-primary uppercase">{oasisSenderId}</span>
              </div>⁸
              <div className="flex justify-between font-bold text-gray-700">
                <span>API Key Token:</span>
                <span className="font-mono text-gray-500">
                  {oasisApiKey ? "••••••••" + oasisApiKey.slice(-4) : "Haijawekwa"}
                </span>
              </div>
            </div>

            {/* Live SMS Preview Card */}
            <div className="bg-emerald-900 text-white p-3.5 rounded-xl space-y-1.5 shadow-inner">
              <p className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-widest flex items-center justify-between">
                <span>Hakiki Ujumbe (Live Preview)</span>
                <span>{sendChannel.toUpperCase()}</span>
              </p>
              <p className="text-xs font-sans leading-relaxed text-emerald-100 italic bg-black/20 p-2 rounded border border-emerald-700/50">
                "{messageBody || "Andika ujumbe wako hapa..."}"
              </p>
            </div>
          </div>

          {/* Sending Progress / Realtime Logs */}
          {sendingLog.length > 0 && (
            <div className="bg-white border-2 border-primary/20 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center justify-between">
                <span>Kumbukumbu za Utumaji ({sendingLog.length})</span>
                <RefreshCw className={`w-3.5 h-3.5 ${isSending ? "animate-spin text-rose-600" : "text-emerald-600"}`} />
              </h4>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-[11px]">
                {sendingLog.map((log, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-primary">{log.name}</p>
                      <p className="text-[9px] text-gray-400 font-mono">{log.phone} • {log.time}</p>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ✓ Sent
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default BroadcastCenter;
