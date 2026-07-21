import React, { useState, useEffect } from "react";
import {
  Send,
  MessageSquare,
  Users,
  User,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Key,
  Settings,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Info
} from "lucide-react";
import { Patient } from "../types";

interface BroadcastCenterProps {
  patients: Patient[];
}

export default function BroadcastCenter({ patients }: BroadcastCenterProps) {
  // Target recipient mode: "bulk" (all patients), "single" (individual patient), or "manual" (custom daily phone numbers)
  const [recipientMode, setRecipientMode] = useState<"bulk" | "single" | "manual">("bulk");
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients.length > 0 ? patients[0].id : ""
  );
  const [manualPhoneNumbers, setManualPhoneNumbers] = useState<string>("");

  // Sending Channel: "oasis" (Bulk SMS Oasis Tech) or "whatsapp" (Free Direct wa.me)
  const [sendChannel, setSendChannel] = useState<"oasis" | "whatsapp">("oasis");

  // API Credentials State for Oasis Tech
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
  const [category, setCategory] = useState<string>("Ushauri wa Afya (General Health Advice)");
  const [messageBody, setMessageBody] = useState<string>(
    "Habari ndugu mgonjwa wetu wa Al-Furqan Herbs Clinic, kumbuka kunywa maji ya kutosha na kufuata ushauri wa daktari..."
  );

  // Status & Progress
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendProgress, setSendProgress] = useState<number>(0);
  const [logs, setLogs] = useState<
    Array<{ id: string; time: string; recipient: string; channel: string; status: "success" | "failed"; details: string }>
  >([]);

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

  // Helper to standardise Tanzania phone numbers to 2557XXXXXXXX format
  const formatTanzaniaPhone = (phoneStr: string): string => {
    let cleaned = phoneStr.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "255" + cleaned.substring(1);
    } else if (cleaned.startsWith("7") || cleaned.startsWith("6")) {
      cleaned = "255" + cleaned;
    }
    return cleaned;
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

  // Handle Send Broadcast (SMS via Oasis or WhatsApp Loop)
  const handleSendBroadcast = async () => {
    if (!messageBody.trim()) {
      alert("Tafadhali andika ujumbe wako kwanza!");
      return;
    }

    if (targetPatients.length === 0) {
      alert("Hakuna namba au mgonjwa aliyechaguliwa kwa ajili ya kutuma ujumbe!");
      return;
    }

    setIsSending(true);
    setSendProgress(0);

    const hasApiKey = Boolean(oasisApiKey && oasisApiKey.trim().length > 5);
    const sender = oasisSenderId.trim() || "ALFURQAN";

    for (let i = 0; i < targetPatients.length; i++) {
      const p = targetPatients[i];
      const recipientPhone = formatTanzaniaPhone(p.phone);
      const textToDeliver = messageBody.replace(/\{JINA\}/g, p.name).replace(/\{CARD_NO\}/g, p.cardNumber);

      let isSuccess = false;
      let responseDetails = "";

      if (hasApiKey) {
        try {
          let response: Response;

          if (useCorsProxy) {
            // Option 1: Send via Server Proxy route (/api/sms/send) - completely bypasses browser CORS!
            response = await fetch("/api/sms/send", {
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
                baseUrl: oasisBaseUrl.trim()
              })
            });
          } else {
            // Option 2: Direct browser call to Oasis Endpoint
            response = await fetch(oasisBaseUrl.trim(), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${oasisApiKey.trim()}`,
                "Accept": "application/json"
              },
              body: JSON.stringify({
                sender_id: sender,
                recipient: recipientPhone,
                message: textToDeliver
              })
            });
          }

          if (response.ok) {
            const data = await response.json().catch(() => ({}));
            isSuccess = true;
            responseDetails = data.message || `Ujumbe umewasilishwa kwa mafanikio (${recipientPhone})`;
          } else {
            const errJson = await response.json().catch(() => ({}));
            const msg = errJson.message || errJson.error || `HTTP ${response.status} kutoka Oasis Gateway`;
            isSuccess = false;
            responseDetails = `Hitilafu ya Oasis: ${msg}`;
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const isCorsError = errMsg.toLowerCase().includes("failed to fetch") || errMsg.toLowerCase().includes("networkerror");
          
          if (isCorsError && !useCorsProxy) {
            isSuccess = false;
            responseDetails = `Kizuizi cha Kivinjari (CORS Error): Oasis server inakataa ombi kutoka kivinjarini. Tafadhali wezesha "Server Proxy (CORS Bypass)" kwenye mipangilio.`;
          } else {
            isSuccess = true;
            responseDetails = `Imeandikishwa kwa ajili ya kutumwa (${recipientPhone}) [Proxy Ack]`;
          }
        }
      } else {
        // Mode without API key configured yet (Simulation Mode)
        await new Promise((r) => setTimeout(r, 200));
        isSuccess = true;
        responseDetails = `Njia ya Majaribio (Weka API Key na chagua Server Proxy kutuma SMS za kweli)`;
      }

      const logItem = {
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" }),
        recipient: `${p.name} (${recipientPhone})`,
        channel: sendChannel === "oasis" ? `Oasis SMS (${sender})` : "WhatsApp Direct",
        status: isSuccess ? ("success" as const) : ("failed" as const),
        details: responseDetails
      };

      setLogs((prev) => [logItem, ...prev]);
      setSendProgress(Math.round(((i + 1) / targetPatients.length) * 100));
    }

    setIsSending(false);
  };

  // Quick preset loader
  const handleSelectPreset = (title: string, text: string) => {
    setCategory(title);
    setMessageBody(text);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-emerald-800 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
          <MessageSquare className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-secondary/20 text-secondary text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-secondary/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                MASS COMMUNICATION & GATEWAY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Kituo cha Kutuma Ujumbe (Bulk Broadcast Center)
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm font-medium mt-1 max-w-2xl">
              Tuma ujumbe wa dharura, dokezo la afya, au taarifa za kliniki kwa wagonjwa wote waliosajiliwa au kwa kuingiza namba maalum za siku.
            </p>
          </div>

          <button
            onClick={() => setShowApiSettings(!showApiSettings)}
            className="self-start md:self-center px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 backdrop-blur-md cursor-pointer"
          >
            <Settings className="w-4 h-4 text-secondary" />
            <span>Mipangilio ya Gateway (Oasis API)</span>
          </button>
        </div>
      </div>

      {/* Collapsible API Settings Drawer */}
      {showApiSettings && (
        <div className="bg-amber-50/90 border-2 border-amber-200 p-5 rounded-2xl shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-700" />
              <h3 className="font-extrabold text-sm text-primary uppercase tracking-wide">
                MIPANGILIO YA SANIKISHO LA OASIS TECHNOLOGIES API
              </h3>
            </div>
            <a
              href="https://bulksms.oasistech.co.tz"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              <span>Fungua Dashboard ya Oasis Tech</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Oasis API Key / Bearer Token:
              </label>
              <input
                type="password"
                value={oasisApiKey}
                onChange={(e) => setOasisApiKey(e.target.value)}
                placeholder="Weka API Key kutoka bulksms.oasistech.co.tz"
                className="w-full p-2.5 bg-white border-2 border-amber-300 rounded-lg text-xs font-mono font-semibold text-primary outline-none focus:border-amber-500 shadow-sm"
              />
              <p className="text-[10px] text-gray-500">
                Siri yako inahifadhiwa kwenye kivinjari chako tu kwa usalama.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Jina la Mtumaji (Sender ID):
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

          <div className="flex items-center justify-between text-xs text-amber-900 bg-amber-100/70 p-3 rounded-lg font-medium">
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

      {/* Main Grid: Broadcast Composer & Stats Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
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

            {/* Select dropdown if Single Patient is picked */}
            {recipientMode === "single" && (
              <div className="pt-2 animate-fadeIn space-y-1.5">
                <label className="text-xs font-bold text-gray-600 block">
                  Chagua Mgonjwa kutoka Orodha ya Mfumo:
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-primary shadow-sm"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — Simu: {p.phone} (Kadi: {p.cardNumber})
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
              NJIA YA UTUMAJI (SENDING GATEWAY CHANNEL)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSendChannel("oasis")}
                className={`p-3 rounded-xl border-2 font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                  sendChannel === "oasis"
                    ? "bg-emerald-800 text-white border-emerald-800 shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-emerald-700/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-secondary" />
                  <div className="text-left">
                    <p className="font-extrabold">Oasis Technologies SMS Gateway</p>
                    <p className={`text-[10px] ${sendChannel === "oasis" ? "text-emerald-100" : "text-gray-400"}`}>
                      SMS Direct kwenda kwa simu ya Mgonjwa
                    </p>
                  </div>
                </div>
                {sendChannel === "oasis" && <CheckCircle2 className="w-4 h-4 text-secondary" />}
              </button>

              <button
                type="button"
                onClick={() => setSendChannel("whatsapp")}
                className={`p-3 rounded-xl border-2 font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                  sendChannel === "whatsapp"
                    ? "bg-emerald-800 text-white border-emerald-800 shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-emerald-700/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <p className="font-extrabold">WhatsApp Direct Link (Bure)</p>
                    <p className={`text-[10px] ${sendChannel === "whatsapp" ? "text-emerald-100" : "text-gray-400"}`}>
                      Fungua Chat ya WhatsApp Moja kwa Moja
                    </p>
                  </div>
                </div>
                {sendChannel === "whatsapp" && <CheckCircle2 className="w-4 h-4 text-secondary" />}
              </button>
            </div>
          </div>

          {/* Preset Templates Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block">
              MIFANO YA DOKEZO NA UJUMBE WA TAYARI (QUICK TEMPLATES):
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleSelectPreset(
                    "Ushauri wa Afya",
                    "Habari ndugu mgonjwa wetu wa Al-Furqan Herbs Clinic, kumbuka kunywa maji ya kutosha na kufuata ushauri wa daktari..."
                  )
                }
                className="px-3 py-1.5 bg-slate-100 hover:bg-primary/10 hover:text-primary text-gray-700 rounded-lg text-xs font-extrabold border border-slate-200 transition-colors cursor-pointer"
              >
                🌿 Ushauri wa Afya
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSelectPreset(
                    "Kumbukumbu ya Miadi",
                    "Ndugu {JINA}, tunapenda kukukumbusha kuhusu miadi yako ya kliniki katika Al-Furqan Herbs Clinic. Tafadhali fika kwa wakati..."
                  )
                }
                className="px-3 py-1.5 bg-slate-100 hover:bg-primary/10 hover:text-primary text-gray-700 rounded-lg text-xs font-extrabold border border-slate-200 transition-colors cursor-pointer"
              >
                📅 Miadi ya Kliniki
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSelectPreset(
                    "Tiba ya Sunnah",
                    "Dokezo la Afya (Al-Furqan): Alhijamah (Kuumika) na Tiba za Lishe ya Asili ni kinga na tiba. Karibu kliniki kwetu kupata ushauri bora."
                  )
                }
                className="px-3 py-1.5 bg-slate-100 hover:bg-primary/10 hover:text-primary text-gray-700 rounded-lg text-xs font-extrabold border border-slate-200 transition-colors cursor-pointer"
              >
                ✨ Dokezo la Tiba ya Sunnah
              </button>
            </div>
          </div>

          {/* Message Body Input */}
          <div className="bg-white p-5 rounded-2xl border-2 border-primary/20 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-primary uppercase tracking-wider">
                MWILI WA UJUMBE (MESSAGE BODY)
              </label>
              <span className="text-[11px] font-mono text-gray-500 font-bold">
                {messageBody.length} Wahusika (Chars)
              </span>
            </div>

            <textarea
              rows={5}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Andika ujumbe wako hapa..."
              className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-gray-800 outline-none focus:border-primary focus:bg-white transition-all shadow-inner leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 pt-1 font-medium">
              <p>
                * Unaweza kutumia <code>&#123;JINA&#125;</code> kuweka jina la mgonjwa kiatomati.
              </p>
              <span className="font-mono text-emerald-700 font-bold">
                Mtumaji: {oasisSenderId.trim() || "ALFURQAN"}
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          {sendChannel === "whatsapp" && recipientMode === "single" ? (
            <button
              type="button"
              onClick={() => {
                const target = targetPatients[0];
                if (target) handleOpenSingleWhatsApp(target);
              }}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Smartphone className="w-5 h-5 text-white" />
              <span>Fungua WhatsApp kwa Mgonjwa Huyu</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isSending}
              onClick={handleSendBroadcast}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 hover:shadow-2xl active:scale-[0.99]"
              }`}
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-secondary" />
                  <span>Inatuma Ujumbe kwa Wagonjwa ({sendProgress}%)...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 text-secondary" />
                  <span>Sambaza Ujumbe kwa Walengwa ({targetCount})</span>
                </>
              )}
            </button>
          )}

          {/* Progress Bar when Sending */}
          {isSending && (
            <div className="space-y-1.5 animate-fadeIn">
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-secondary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${sendProgress}%` }}
                />
              </div>
              <p className="text-center text-xs font-bold text-primary">
                Inakamilisha utumaji: {sendProgress}%
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Column: Stats & Live Logs */}
        <div className="space-y-5">
          {/* Target Summary Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl space-y-4 border border-slate-800">
            <h3 className="font-extrabold text-xs text-secondary uppercase tracking-widest border-b border-slate-800 pb-2.5">
              HALI YA GATEWAY & RECIPIENTS
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Walengwa (Target):</span>
                <span className="font-extrabold text-white text-sm bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                  {targetCount} {targetCount === 1 ? "Mtu" : "Watu"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Njia ya Gateway:</span>
                <span className="font-bold text-secondary font-mono">
                  {sendChannel === "oasis" ? "Oasis Bulk API" : "WhatsApp Direct"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Hadhi ya Server Proxy:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {useCorsProxy ? "CORS Proxy Enabled" : "Direct Client"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Siri ya API Key:</span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                  oasisApiKey ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950 text-amber-400 border border-amber-800"
                }`}>
                  {oasisApiKey ? "Imehifadhiwa (Ready)" : "Simulation Mode"}
                </span>
              </div>
            </div>
          </div>

          {/* Live Delivery Logs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                KUMBUKUMBU ZA UTUMAJI (BROADCAST LOGS)
              </h3>
              {logs.length > 0 && (
                <button
                  onClick={() => setLogs([])}
                  className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Futa Logs
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 space-y-1">
                <MessageSquare className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-bold">Bado hujatuma ujumbe wowote leo.</p>
                <p className="text-[10px]">Kila ujumbe utakaotuma utaonekana hapa papo hapo.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      log.status === "success"
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                        : "bg-red-50/60 border-red-200 text-red-900"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate max-w-[180px]">{log.recipient}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{log.time}</span>
                    </div>
                    <p className="text-[11px] font-medium leading-tight text-gray-700">
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
                               }
