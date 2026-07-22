import React, { useState, useEffect } from "react";
import {
  Send,
  Users,
  UserCheck,
  Smartphone,
  CheckCircle,
  XCircle,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Key,
  Info,
  Trash2,
  Calendar,
  FileText,
  Clock,
  ChevronRight
} from "lucide-react";
import { Patient } from "../types";

interface BroadcastCenterProps {
  patients: Patient[];
}

function BroadcastCenter({ patients }: BroadcastCenterProps) {
  // Target recipient mode: "bulk" (all patients), "single" (individual patient), or "manual" (custom daily phone numbers)
  const [recipientMode, setRecipientMode] = useState<"bulk" | "single" | "manual">("bulk");
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients.length > 0 ? patients[0].id : ""
  );
  const [manualPhoneNumbers, setManualPhoneNumbers] = useState<string>("");

  // Gateway mode: "oasis" (API) or "whatsapp" (Direct Web Link)
  const [gateway, setGateway] = useState<"oasis" | "whatsapp">("oasis");

  // Custom Message Body
  const [message, setMessage] = useState<string>(
    "Habari ndugu mgonjwa wetu wa Al-Furqan Herbs Clinic, kumbuka kunywa maji ya kutosha na kufuata ushauri wa daktari. Kwa msaada piga 0712345678."
  );

  // Oasis Technologies Credentials
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
  const [presetCategory, setPresetCategory] = useState<"general" | "appointment" | "remedy">("general");

  // Broadcast Progress States
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentCount, setSentCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Broadcast History Logs
  const [logs, setLogs] = useState<
    {
      id: string;
      timestamp: string;
      recipient: string;
      channel: string;
      status: "success" | "failed" | "simulated";
      message: string;
      details?: string;
    }[]
  >(() => {
    const saved = localStorage.getItem("broadcast_logs");
    return saved ? JSON.parse(saved) : [];
  });

  // Save logs to localStorage
  useEffect(() => {
    localStorage.setItem("broadcast_logs", JSON.stringify(logs));
  }, [logs]);

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

  // Format phone number to international standard (255...)
  const formatTanzaniaPhone = (phoneStr: string): string => {
    let cleaned = phoneStr.replace(/\D/g, "");
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
      const target = patients.find((p) => p.id === selectedPatientId);
      return target ? [{ id: target.id, name: target.name, phone: target.phone, cardNumber: target.cardNumber }] : [];
    }
    
    if (recipientMode === "manual") {
      const rawNumbers = manualPhoneNumbers
        .split(/[\n,;]+/)
        .map((num) => num.trim())
        .filter((num) => num.length >= 8);
      
      return rawNumbers.map((num, idx) => ({
        id: `manual-${idx}`,
        name: `Namba ya Siku #${idx + 1}`,
        phone: num,
        cardNumber: `MAN-${idx + 1}`
      }));
    }

    return patients.map((p) => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      cardNumber: p.cardNumber
    }));
  };

  // Preset Template Loader
  const applyPresetTemplate = (category: "general" | "appointment" | "remedy") => {
    setPresetCategory(category);
    if (category === "general") {
      setMessage("Habari ndugu mgonjwa wetu wa Al-Furqan Herbs Clinic, kumbuka kunywa maji ya kutosha na kufuata ushauri wa daktari. Kwa msaada piga 0712345678.");
    } else if (category === "appointment") {
      setMessage("Jambo {JINA}, tunakukumbusha kuhusu miadi yako ya kliniki katika Al-Furqan Herbs Clinic. Tafadhali fika mapema siku ya tarehe uliyopangiwa.");
    } else if (category === "remedy") {
      setMessage("Ndugu {JINA}, ushauri wa tiba yako ya mitishamba kutoka Al-Furqan: Hakikisha unatumia dawa kwa mpangilio ulioshauriwa bila kuruka dozi.");
    }
  };

  // Primary Broadcast Execution Handler
  const handleSendBroadcast = async () => {
    const targets = getTargetPatients();
    if (targets.length === 0) {
      alert("Tafadhali chagua au ingiza angalau namba moja ya mgonjwa!");
      return;
    }

    if (!message.trim()) {
      alert("Tafadhali ingiza ujumbe unaotaka kutuma!");
      return;
    }

    setIsSending(true);
    setSentCount(0);
    setTotalCount(targets.length);

    const sender = oasisSenderId.trim() || "ALFURQAN";
    const hasApiKey = oasisApiKey.trim().length > 0;

    for (let i = 0; i < targets.length; i++) {
      const patient = targets[i];
      const recipientPhone = formatTanzaniaPhone(patient.phone);
      
      // Personalize message replacement tag {JINA}
      const textToDeliver = message.replace(/\{JINA\}/g, patient.name);

      let isSuccess = false;
      let responseDetails = "";

      if (gateway === "whatsapp") {
        // Open WhatsApp Web/App Direct Chat
        const encodedText = encodeURIComponent(textToDeliver);
        const waUrl = `https://wa.me/${recipientPhone}?text=${encodedText}`;
        window.open(waUrl, "_blank");
        isSuccess = true;
        responseDetails = `Imefunguliwa kwenye WhatsApp (${recipientPhone})`;
      } else {
        // Oasis Technologies Gateway API Integration
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
      }

      const logItem = {
        id: `LOG-${Date.now()}-${i}`,
        timestamp: new Date().toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" }),
        recipient: `${patient.name} (${recipientPhone})`,
        channel: gateway === "oasis" ? "Oasis Bulk API" : "WhatsApp Direct",
        status: isSuccess ? (hasApiKey || gateway === "whatsapp" ? ("success" as const) : ("simulated" as const)) : ("failed" as const),
        message: textToDeliver,
        details: responseDetails
      };

      setLogs((prev) => [logItem, ...prev]);
      setSentCount(i + 1);

      // Delay between bulk items to avoid gateway throttling
      if (targets.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    setIsSending(false);
  };

  const clearLogs = () => {
    if (confirm("Je, una uhakika unataka kufuta kumbukumbu zote za SMS?")) {
      setLogs([]);
      localStorage.removeItem("broadcast_logs");
    }
  };

  const activeTargets = getTargetPatients();

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-emerald-700/50">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none">
          <MessageSquare className="w-80 h-80 -mr-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Mass Communication & Gateway
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Kituo cha Kutuma Ujumbe (Bulk Broadcast Center)
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-2xl">
              Tuma ujumbe wa dharura, dokezo la afya, au taarifa za kliniki kwa wagonjwa wote waliosajiliwa au kwa kuingiza namba maalum za siku.
            </p>
          </div>

          <button
            onClick={() => setShowApiSettings(!showApiSettings)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl border border-white/20 text-xs font-bold backdrop-blur-sm transition-all cursor-pointer self-start md:self-auto shadow-sm"
          >
            <Key className="w-4 h-4 text-amber-300" />
            {showApiSettings ? "Funga Mipangilio" : "Mipangilio ya Gateway (Oasis API)"}
          </button>
        </div>
      </div>

      {/* API Credentials Configuration Panel */}
      {showApiSettings && (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 space-y-4 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-700" />
              <h2 className="font-bold text-amber-900 text-sm md:text-base">
                Mipangilio ya Oasis Technologies SMS Gateway (Tanzania API)
              </h2>
            </div>
            <span className="text-[11px] font-semibold bg-amber-200/60 text-amber-800 px-2.5 py-0.5 rounded-md">
              API Integration
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-900 block">
                Oasis API Bearer Token / Key:
              </label>
              <input
                type="password"
                value={oasisApiKey}
                onChange={(e) => setOasisApiKey(e.target.value)}
                placeholder="Weka Oasis API Key yako hapa..."
                className="w-full p-2.5 bg-white border-2 border-amber-300 rounded-lg text-xs font-mono font-semibold text-primary outline-none focus:border-amber-500 shadow-sm"
              />
              <p className="text-[10px] text-gray-500">
                Siri yako inahifadhiwa kwenye kivinjari chako tu kwa usalama.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-900 block">
                Approved Sender ID (Jina la Mtumaji):
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

          <div className="flex items-center justify-between text-xs text-amber-800 pt-1">
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

      {/* Main Broadcast Workstation */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-md p-6 space-y-6">
        {/* Step 1: Select Recipient Target */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-gray-500 block">
            Chagua Walengwa (Recipient Target)
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setRecipientMode("bulk")}
              className={`p-4 rounded-xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                recipientMode === "bulk"
                  ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-lg ${
                    recipientMode === "bulk" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-gray-900">Wagonjwa Wote</div>
                  <div className="text-xs text-gray-500 font-medium">Waliosajiliwa ({patients.length})</div>
                </div>
              </div>
              {recipientMode === "bulk" && <CheckCircle className="w-5 h-5 text-emerald-600" />}
            </button>

            <button
              type="button"
              onClick={() => setRecipientMode("single")}
              className={`p-4 rounded-xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                recipientMode === "single"
                  ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-lg ${
                    recipientMode === "single" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-gray-900">Mgonjwa Mmoja</div>
                  <div className="text-xs text-gray-500 font-medium">Chagua Mgonjwa</div>
                </div>
              </div>
              {recipientMode === "single" && <CheckCircle className="w-5 h-5 text-emerald-600" />}
            </button>

            <button
              type="button"
              onClick={() => setRecipientMode("manual")}
              className={`p-4 rounded-xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                recipientMode === "manual"
                  ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-lg ${
                    recipientMode === "manual" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-gray-900">Namba za Siku</div>
                  <div className="text-xs text-gray-500 font-medium">Ingiza Namba Ziada</div>
                </div>
              </div>
              {recipientMode === "manual" && <CheckCircle className="w-5 h-5 text-emerald-600" />}
            </button>
          </div>

          {/* Conditional Target Input Options */}
          {recipientMode === "single" && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
              <label className="text-xs font-bold text-gray-700 block">Chagua Mgonjwa kutoka Orodha:</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 outline-none focus:border-emerald-600 shadow-sm"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.cardNumber}) — {p.phone}
                  </option>
                ))}
              </select>
            </div>
          )}

          {recipientMode === "manual" && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700 block">
                  Ingiza au Bandika Namba za Simu za Siku (Manual Numbers):
                </label>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {getTargetPatients().length} Namba Iliyotambuliwa
                </span>
              </div>
              <textarea
                value={manualPhoneNumbers}
                onChange={(e) => setManualPhoneNumbers(e.target.value)}
                placeholder="Mfano: 0712345678, 0754000111 au kwa mstari mpya..."
                rows={3}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-800 outline-none focus:border-emerald-600 shadow-sm"
              />
              <p className="text-[11px] text-gray-500">
                * Unganisha namba kwa koma ( , ) au mstari mpya. Mfumo utazitambua kiatomati bila kujali formatting.
              </p>
            </div>
          )}
        </div>

        {/* Step 2: Gateway & Channel Selection */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-gray-500 block">
            Njia ya Utumaji (Sending Gateway Channel)
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGateway("oasis")}
              className={`p-3.5 rounded-xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                gateway === "oasis"
                  ? "border-emerald-600 bg-emerald-50/40 font-bold"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-700 text-white rounded-lg">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900">Oasis Technologies SMS Gateway</div>
                  <div className="text-[11px] text-gray-500 font-normal">SMS Direct kwenda kwa simu ya Mgonjwa</div>
                </div>
              </div>
              {gateway === "oasis" && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            </button>

            <button
              type="button"
              onClick={() => setGateway("whatsapp")}
              className={`p-3.5 rounded-xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                gateway === "whatsapp"
                  ? "border-emerald-600 bg-emerald-50/40 font-bold"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-600 text-white rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900">WhatsApp Direct Link (Bure)</div>
                  <div className="text-[11px] text-gray-500 font-normal">Fungua Chat ya WhatsApp Moja kwa Moja</div>
                </div>
              </div>
              {gateway === "whatsapp" && <CheckCircle className="w-4 h-4 text-emerald-600" />}
            </button>
          </div>
        </div>

        {/* Step 3: Message Content & Quick Templates */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-gray-500 block">
              Mifano ya Dokezo na Ujumbe wa Tayari (Quick Templates):
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => applyPresetTemplate("general")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  presetCategory === "general"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }`}
              >
                🌿 Ushauri wa Afya
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate("appointment")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  presetCategory === "appointment"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }`}
              >
                📅 Miadi ya Kliniki
              </button>
              <button
                type="button"
                onClick={() => applyPresetTemplate("remedy")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  presetCategory === "remedy"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }`}
              >
                🩺 Dokezo la Tiba ya Sunnah
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500 font-semibold">
              <span>Mwili wa Ujumbe (Message Body)</span>
              <span>{message.length} Wahusika (Chars)</span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Andika ujumbe wako hapa..."
              className="w-full p-3.5 bg-gray-50/80 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-900 outline-none focus:border-emerald-600 focus:bg-white shadow-inner transition-all"
            />
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span>* Unaweza kutumia <strong>{`{JINA}`}</strong> kuweka jina la mgonjwa kiatomati.</span>
              <span className="font-mono">Mtumaji: {oasisSenderId || "ALFURQAN"}</span>
            </div>
          </div>
        </div>

        {/* Step 4: Broadcast Action Bar */}
        <div className="pt-2">
          <button
            type="button"
            disabled={isSending || activeTargets.length === 0}
            onClick={handleSendBroadcast}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer ${
              isSending || activeTargets.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-emerald-900 active:scale-[0.99]"
            }`}
          >
            {isSending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-amber-300" />
                <span>Inatuma Ujumbe... ({sentCount}/{totalCount})</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-amber-300" />
                <span>Sambaza Ujumbe kwa Walengwa ({activeTargets.length})</span>
              </>
            )}
          </button>
        </div>

        {/* Live Status Summary Card */}
        <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono text-[11px] text-emerald-400 uppercase tracking-widest border-b border-slate-800 pb-2">
            <span>Hali ya Gateway & Recipients</span>
            <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold">
              {activeTargets.length} Mtu
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono">
            <div>
              <span className="text-slate-400">Walengwa (Target):</span>{" "}
              <strong className="text-white">
                {recipientMode === "bulk" ? "Wagonjwa Wote" : recipientMode === "single" ? "Mgonjwa Mmoja" : "Namba za Siku"}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Njia ya Gateway:</span>{" "}
              <strong className="text-emerald-300">
                {gateway === "oasis" ? "Oasis Bulk API" : "WhatsApp Direct"}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Hadhi ya Server Proxy:</span>{" "}
              <strong className={useCorsProxy ? "text-emerald-400" : "text-amber-400"}>
                {useCorsProxy ? "✓ CORS Proxy Enabled" : "Direct Mode"}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Siri ya API Key:</span>{" "}
              <strong className={oasisApiKey ? "text-emerald-400" : "text-amber-400"}>
                {oasisApiKey ? "Imehifadhiwa (Ready)" : "Simulation Only"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History & Activity Logs */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            <h2 className="font-extrabold text-gray-900 text-base">
              Kumbukumbu za Utumaji (Broadcast Logs)
            </h2>
          </div>
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Futa Logs
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-xs font-medium">
            Bado hakuna kumbukumbu za utumaji wa hivi karibuni.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <span>{log.recipient}</span>
                    <span className="text-[10px] bg-gray-200 text-gray-700 font-mono px-1.5 py-0.5 rounded">
                      {log.channel}
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px] line-clamp-1 font-sans">{log.message}</p>
                  {log.details && (
                    <div className="text-[10px] font-mono text-gray-500 bg-white p-1 rounded border border-gray-200/80 mt-1">
                      {log.details}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-[10px] text-gray-400 font-mono">{log.timestamp}</span>
                  {log.status === "success" && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      <CheckCircle className="w-3.5 h-3.5" /> Imewasilishwa
                    </span>
                  )}
                  {log.status === "simulated" && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      <Info className="w-3.5 h-3.5" /> Majaribio
                    </span>
                  )}
                  {log.status === "failed" && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                      <XCircle className="w-3.5 h-3.5" /> Imefeli
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { BroadcastCenter };
export default BroadcastCenter;
