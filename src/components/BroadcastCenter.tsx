import React, { useState, useEffect } from "react";
import { 
  Send, 
  Users, 
  User, 
  MessageSquare, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  KeyRound, 
  Settings2, 
  Info, 
  Smartphone,
  ExternalLink,
  Search,
  Check,
  History
} from "lucide-react";

interface Patient {
  id: string;
  fullName: string;
  cardNumber: string;
  phone: string;
  gender: string;
}

interface BroadcastCenterProps {
  patients: Patient[];
}

export const BroadcastCenter: React.FC<BroadcastCenterProps> = ({ patients }) => {
  // Recipient selection mode: 'all' | 'single' | 'manual'
  const [recipientMode, setRecipientMode] = useState<"all" | "single" | "manual">("all");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [manualPhoneInput, setManualPhoneInput] = useState<string>("");
  const [patientSearchTerm, setPatientSearchTerm] = useState<string>("");

  // Gateway channel: 'oasis' | 'whatsapp'
  const [gatewayChannel, setGatewayChannel] = useState<"oasis" | "whatsapp">("oasis");

  // Custom Message Body
  const [messageBody, setMessageBody] = useState<string>(
    "Habari ndugu mgonjwa wetu wa Al-Furqan Herbs Clinic, kumbuka kunywa maji ya kutosha na kufuata ushauri wa daktari. Mungu akujalie shifaa na afya njema."
  );

  // Oasis Credentials & Proxy Configuration
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
  const [selectedCategory, setSelectedCategory] = useState<string>("general");

  // Sending status / Logs
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendLogs, setSendLogs] = useState<{
    id: string;
    timestamp: string;
    recipientName: string;
    phone: string;
    channel: string;
    status: "success" | "failed" | "pending";
    details: string;
  }[]>([]);

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

  // Clean and format phone number for Tanzania (+255 or 0...)
  const formatTanzaniaPhone = (rawPhone: string): string => {
    let cleaned = rawPhone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "255" + cleaned.substring(1);
    } else if (cleaned.startsWith("7") || cleaned.startsWith("6")) {
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
      const found = patients.find(p => p.id === selectedPatientId);
      if (found) {
        return [{ id: found.id, name: found.fullName, phone: formatTanzaniaPhone(found.phone), cardNumber: found.cardNumber }];
      }
      return [];
    }

    if (recipientMode === "manual") {
      const rawNumbers = manualPhoneInput.split(/[\n,;]+/).map(n => n.trim()).filter(Boolean);
      return rawNumbers.map((num, idx) => ({
        id: `manual-${idx}`,
        name: `Namba ya Siku #${idx + 1}`,
        phone: formatTanzaniaPhone(num),
        cardNumber: "N/A"
      }));
    }

    // Default: 'all'
    return patients.map(p => ({
      id: p.id,
      name: p.fullName,
      phone: formatTanzaniaPhone(p.phone),
      cardNumber: p.cardNumber
    }));
  };

  const targetList = getTargetPatients();

  // Handle Quick Template Apply
  const applyPresetTemplate = (type: string) => {
    setSelectedCategory(type);
    if (type === "health_tip") {
      setMessageBody("Ushauri wa Afya kutoka Al-Furqan Herbs Clinic: Hakikisha unakunywa maji ya kutosha na kula matunda ili kuimarisha kinga ya mwili wako kila siku.");
    } else if (type === "appointment") {
      setMessageBody("Habari {JINA}, tunapenda kukukumbusha kuhusu miadi yako ya marejeo ya matibabu katika kliniki yetu ya Al-Furqan Herbs. Karibu tukuhudumie.");
    } else if (type === "sunnah_remedy") {
      setMessageBody("Dokezo la Tiba Asilia & Sunnah: Matumizi ya Habbat Sawdaa na Asali mbichi yanasaidia sana kuimarisha afya ya tumbo na kinga ya mwili.");
    }
  };

  // Handle Send Messages
  const handleSendBroadcast = async () => {
    if (targetList.length === 0) {
      alert("Tafadhali chagua au ingiza angalau namba moja ya mgonjwa.");
      return;
    }

    if (!messageBody.trim()) {
      alert("Tafadhali ingiza ujumbe unaotaka kutuma.");
      return;
    }

    setIsSending(true);

    const hasApiKey = Boolean(oasisApiKey && oasisApiKey.trim().length > 5);
    const sender = oasisSenderId.trim() || "ALFURQAN";

    for (const recipient of targetList) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const textToDeliver = messageBody.replace(/\{JINA\}/g, recipient.name);
      const recipientPhone = recipient.phone;

      let isSuccess = false;
      let responseDetails = "";

      if (gatewayChannel === "whatsapp") {
        // WhatsApp Web Link Mode
        const encodedText = encodeURIComponent(textToDeliver);
        const waUrl = `https://wa.me/${recipientPhone}?text=${encodedText}`;
        window.open(waUrl, "_blank");
        isSuccess = true;
        responseDetails = "Imefunguliwa kwenye WhatsApp Direct Window";
      } else if (hasApiKey) {
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
        id: Math.random().toString(36).substr(2, 9),
        timestamp: timeStr,
        recipientName: recipient.name,
        phone: recipientPhone,
        channel: gatewayChannel === "oasis" ? "Oasis Bulk API" : "WhatsApp Direct",
        status: isSuccess ? ("success" as const) : ("failed" as const),
        details: responseDetails
      };

      setSendLogs(prev => [logItem, ...prev]);
    }

    setIsSending(false);
  };

  // Filter patients in selector dropdown
  const filteredPatients = patients.filter(
    p =>
      p.fullName.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      p.cardNumber.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      p.phone.includes(patientSearchTerm)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-primary to-teal-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-emerald-700/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Mass Communication & Gateway
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Kituo cha Kutuma Ujumbe (Bulk Broadcast Center)
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
              Tuma ujumbe wa dharura, dokezo la afya, au taarifa za kliniki kwa wagonjwa wote waliosajiliwa au kwa kuingiza namba maalum za siku.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApiSettings(!showApiSettings)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Settings2 className="w-4 h-4 text-amber-300" />
              <span>Mipangilio ya Gateway (Oasis API)</span>
            </button>
          </div>
        </div>
      </div>

      {/* API Key Credentials Modal / Expandable Panel */}
      {showApiSettings && (
        <div className="bg-amber-50/90 border-2 border-amber-300/80 rounded-2xl p-5 space-y-4 text-gray-800 animate-in fade-in slide-in-from-top-4 duration-300 shadow-lg">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500 text-white rounded-lg">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Mipangilio ya API ya Oasis Technologies (bulksms.oasistech.co.tz)
                </h3>
                <p className="text-xs text-gray-600">
                  Ingiza ufunguo wako wa siri (Bearer Token) kutoka dashboard yako ya Oasis ili kutuma SMS za kweli moja kwa moja kwa wagonjwa.
                </p>
              </div>
            </div>
            <a
              href="https://bulksms.oasistech.co.tz"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1 bg-amber-200/60 px-3 py-1.5 rounded-lg"
            >
              Fungua Dashboard ya Oasis <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                API Key / Bearer Token:
              </label>
              <input
                type="password"
                value={oasisApiKey}
                onChange={(e) => setOasisApiKey(e.target.value)}
                placeholder="Ingiza API Key ya Oasis hapa..."
                className="w-full p-2.5 bg-white border-2 border-amber-300 rounded-lg text-xs font-mono font-semibold text-primary outline-none focus:border-amber-500 shadow-sm"
              />
              <p className="text-[10px] text-gray-500">
                Siri yako inahifadhiwa kwenye kivinjari chako tu kwa usalama.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                Sender ID (Jina la Mtumaji):
              </label>
              <input
                type="text"
                value={oasisSenderId}
                onChange={(e) => setOasisSenderId(e.target.value)}
                placeholder="Mfano: ALFURQAN"
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

          <div className="flex items-center justify-between text-xs pt-1">
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

      {/* Main Broadcast Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Selection Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
              <Users className="w-4 h-4 text-primary" />
              Chagua Walengwa (Recipient Target)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRecipientMode("all")}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  recipientMode === "all"
                    ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Users className="w-5 h-5" />
                  {recipientMode === "all" && <Check className="w-4 h-4 text-primary" />}
                </div>
                <div className="text-xs font-bold">Wagonjwa Wote</div>
                <div className="text-[10px] text-gray-500 font-normal">
                  Waliosajiliwa ({patients.length})
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRecipientMode("single")}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  recipientMode === "single"
                    ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <User className="w-5 h-5" />
                  {recipientMode === "single" && <Check className="w-4 h-4 text-primary" />}
                </div>
                <div className="text-xs font-bold">Mgonjwa Mmoja</div>
                <div className="text-[10px] text-gray-500 font-normal">Chagua Mgonjwa</div>
              </button>

              <button
                type="button"
                onClick={() => setRecipientMode("manual")}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  recipientMode === "manual"
                    ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <PhoneCall className="w-5 h-5" />
                  {recipientMode === "manual" && <Check className="w-4 h-4 text-primary" />}
                </div>
                <div className="text-xs font-bold">Namba za Siku</div>
                <div className="text-[10px] text-gray-500 font-normal">Ingiza Namba Ziada</div>
              </button>
            </div>

            {/* Single Patient Selection UI */}
            {recipientMode === "single" && (
              <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-gray-700 block">
                  Chagua Mgonjwa kutoka kwenye orodha:
                </label>

                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={patientSearchTerm}
                    onChange={(e) => setPatientSearchTerm(e.target.value)}
                    placeholder="Tafuta kwa jina, kadi au namba ya simu..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-primary"
                  />
                </div>

                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 outline-none focus:border-primary"
                >
                  {filteredPatients.length === 0 ? (
                    <option value="">Hakuna mgonjwa aliyepatikana</option>
                  ) : (
                    filteredPatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.cardNumber}) - {p.phone}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {/* Manual Phone Input UI */}
            {recipientMode === "manual" && (
              <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 block">
                    Ingiza au Bandika Namba za Simu za Siku (Manual Numbers):
                  </label>
                  <span className="text-[10px] bg-primary/10 text-primary font-mono px-2 py-0.5 rounded font-bold">
                    {targetList.length} Namba Iliyotambuliwa
                  </span>
                </div>
                <textarea
                  value={manualPhoneInput}
                  onChange={(e) => setManualPhoneInput(e.target.value)}
                  rows={3}
                  placeholder="Mfano: 0712345678, 0755123456, 255788990011 (tenganisha kwa koma au mstari mpya)"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-800 outline-none focus:border-primary"
                />
                <p className="text-[10px] text-gray-500">
                  * Unganisha namba kwa koma (,) au mstari mpya. Mfumo utazitambua kiatomati bila kujali formatting.
                </p>
              </div>
            )}
          </div>

          {/* Gateway Channel Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
              <Smartphone className="w-4 h-4 text-primary" />
              Njia ya Utumaji (Sending Gateway Channel)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGatewayChannel("oasis")}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  gatewayChannel === "oasis"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-sm"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs">Oasis Technologies SMS Gateway</span>
                  {gatewayChannel === "oasis" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-[10px] text-gray-500 font-normal">
                  SMS Direct kwenda kwa simu ya Mgonjwa
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGatewayChannel("whatsapp")}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  gatewayChannel === "whatsapp"
                    ? "border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-sm"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs">WhatsApp Direct Link (Bure)</span>
                  {gatewayChannel === "whatsapp" && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                </div>
                <p className="text-[10px] text-gray-500 font-normal">
                  Fungua Chat ya WhatsApp Moja kwa Moja
                </p>
              </button>
            </div>
          </div>

          {/* Quick Presets & Message Composition */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Mifano ya Dokezo na Ujumbe wa Tayari (Quick Templates)
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPresetTemplate("health_tip")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  selectedCategory === "health_tip"
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                🌿 Ushauri wa Afya
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate("appointment")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  selectedCategory === "appointment"
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-blue-50 text-primary border-blue-200 hover:bg-blue-100"
                }`}
              >
                📆 Miadi ya Kliniki
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate("sunnah_remedy")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  selectedCategory === "sunnah_remedy"
                    ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                    : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                }`}
              >
                💫 Dokezo la Tiba ya Sunnah
              </button>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 block uppercase">
                  Mwili wa Ujumbe (Message Body)
                </label>
                <span className="text-[11px] text-gray-500 font-mono">
                  {messageBody.length} Wahusika (Chars)
                </span>
              </div>
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                rows={5}
                className="w-full p-3.5 bg-gray-50 border border-gray-300 rounded-xl text-xs leading-relaxed text-gray-800 outline-none focus:border-primary focus:bg-white transition-all shadow-inner font-sans"
              />
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>* Unaweza kutumia <b>{`{JINA}`}</b> kuweka jina la mgonjwa kiatomati.</span>
                <span>Mtumaji: <b>{oasisSenderId}</b></span>
              </div>
            </div>

            {/* Action Submit Button */}
            <button
              type="button"
              disabled={isSending}
              onClick={handleSendBroadcast}
              className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 active:scale-[0.99]"
              }`}
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Inatuma Ujumbe kwa Walengwa...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>SAMBAZA UJUMBE KWA WALENGWA ({targetList.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Delivery Logs & Gateway Status */}
        <div className="space-y-6">
          {/* Gateway Status Summary Widget */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Hali ya Gateway & Recipients</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Walengwa (Target):</span>
                <span className="font-bold text-amber-300">{targetList.length} Mtu</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Njia ya Gateway:</span>
                <span className="font-bold text-emerald-400">
                  {gatewayChannel === "oasis" ? "Oasis Bulk API" : "WhatsApp Link"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Hadhi ya Server Proxy:</span>
                <span className="font-bold text-teal-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {useCorsProxy ? "CORS Proxy Enabled" : "Direct Client"}
                </span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-400">Siri ya API Key:</span>
                <span className={`font-mono font-bold ${oasisApiKey ? "text-emerald-400" : "text-amber-400"}`}>
                  {oasisApiKey ? "Imehifadhiwa (Ready)" : "Simulation Mode"}
                </span>
              </div>
            </div>
          </div>

          {/* Broadcast Activity Logs */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Kumbukumbu za Utumaji (Broadcast Logs)
              </h3>
              {sendLogs.length > 0 && (
                <button
                  onClick={() => setSendLogs([])}
                  className="text-[10px] text-red-600 font-bold hover:underline"
                >
                  Futa Logs
                </button>
              )}
            </div>

            {sendLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto stroke-[1.5]" />
                <p className="text-xs font-medium">Bado hujatuma ujumbe wowote katika kipindi hiki.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {sendLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                      log.status === "success"
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                        : "bg-rose-50/60 border-rose-200 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        {log.status === "success" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        )}
                        {log.recipientName} ({log.phone})
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 pl-5 font-mono break-all leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
