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
  Zap,
  Bell,
  Clock,
  Cloud,
  FileCode,
  Pill,
  CheckCheck,
  Trash2,
  Edit3,
  Save,
  X
} from "lucide-react";
import { Patient } from "../types";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

interface BroadcastCenterProps {
  patients: Patient[];
}

interface FirebaseReminder {
  id: string;
  jinaMgonjwa: string;
  nambaSimu: string;
  dawaAlizopewa: string;
  maraNgapiKwaSiku: string;
  mudaAsubuhi: string;
  mudaMchana: string;
  mudaJioni: string;
  sikuZaUkumbusho: number;
  tareheYaKuanza: string;
  tareheYaKumaliza: string;
  maelezoYaZiada: string;
  haliYaUkumbusho: string;
  tareheIliyowashwa: string;
  mudaWaMwishoKutuma?: string;
}

export function BroadcastCenter({ patients }: BroadcastCenterProps) {
  // Main view tab: "broadcast" (Bulk / Manual SMS) or "reminders" (Firebase Medication Reminders Engine)
  const [activeTab, setActiveTab] = useState<"broadcast" | "reminders">("broadcast");

  // Target recipient mode: "bulk" (all patients), "single" (individual patient), "manual" (custom daily phone numbers), or "reminders" (medication reminder patients)
  const [recipientMode, setRecipientMode] = useState<"bulk" | "single" | "manual" | "reminders">("bulk");
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients.length > 0 ? patients[0].id : ""
  );
  const [manualPhoneNumbers, setManualPhoneNumbers] = useState<string>("");

  // Sending Channel: "oasis" (Bulk SMS Oasis Tech) or "whatsapp" (Free Direct wa.me)
  const [sendChannel, setSendChannel] = useState<"oasis" | "whatsapp">("oasis");

  // Oasis Technologies API Credentials
  const [oasisApiKey, setOasisApiKey] = useState<string>(() => {
    return localStorage.getItem("oasis_api_key") || "39029312930192310239120391203921";
  });
  const [oasisSenderId, setOasisSenderId] = useState<string>(() => {
    const saved = localStorage.getItem("oasis_sender_id");
    return (!saved || saved === "ALFURQAN") ? "AHC MKONONI" : saved;
  });
  const [oasisBaseUrl, setOasisBaseUrl] = useState<string>(() => {
    const saved = localStorage.getItem("oasis_base_url");
    if (!saved || saved.includes("api.oasistech.co.tz/v1")) {
      return "https://bulksms.oasistech.co.tz/api/sms";
    }
    return saved;
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
  const [isTestingApi, setIsTestingApi] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    statusCode?: number;
    rawResponse?: string;
    message: string;
  } | null>(null);
  const [sendingProgress, setSendingProgress] = useState<number>(0);
  const [sendingLog, setSendingLog] = useState<{ name: string; phone: string; status: "success" | "failed"; time: string; details?: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedNumbers, setCopiedNumbers] = useState<boolean>(false);

  // --- FIREBASE PATIENT REMINDERS STATES ---
  const [firebaseReminders, setFirebaseReminders] = useState<FirebaseReminder[]>([]);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [editSubhiTime, setEditSubhiTime] = useState<string>("08:00");
  const [editMchanaTime, setEditMchanaTime] = useState<string>("14:00");
  const [editJioniTime, setEditJioniTime] = useState<string>("20:00");
  const [showCloudFunctionModal, setShowCloudFunctionModal] = useState<boolean>(false);
  const [reminderDispatchLogs, setReminderDispatchLogs] = useState<{ id: string; name: string; phone: string; time: string; status: "success" | "failed"; detail: string }[]>([]);

  // --- AUTOMATED IN-APP CRON / AUTO-DISPATCHER ENGINE ---
  const [autoDispatcherEnabled, setAutoDispatcherEnabled] = useState<boolean>(() => {
    return localStorage.getItem("oasis_auto_dispatcher") !== "false";
  });
  const [lastCronCheck, setLastCronCheck] = useState<string>("");
  const [sentTodayKeys, setSentTodayKeys] = useState<Set<string>>(() => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const stored = localStorage.getItem(`oasis_sent_keys_${today}`);
      if (stored) return new Set(JSON.parse(stored));
    } catch (e) {
      console.error("Error loading sentTodayKeys:", e);
    }
    return new Set();
  });

  // Helper to persist sentTodayKeys
  const markKeyAsSentToday = (key: string) => {
    const today = new Date().toISOString().split("T")[0];
    setSentTodayKeys((prev) => {
      const updated = new Set(prev).add(key);
      try {
        localStorage.setItem(`oasis_sent_keys_${today}`, JSON.stringify(Array.from(updated)));
      } catch (e) {
        console.error("Error saving sentTodayKeys:", e);
      }
      return updated;
    });
  };

  // Auto save Auto-Dispatcher setting
  useEffect(() => {
    localStorage.setItem("oasis_auto_dispatcher", String(autoDispatcherEnabled));
  }, [autoDispatcherEnabled]);

  // Background timer checking active reminder slots every 15 seconds
  useEffect(() => {
    if (!autoDispatcherEnabled) return;

    const parseTimeToMinutes = (timeStr: string): number | null => {
      if (!timeStr) return null;
      const trimmed = timeStr.trim();
      const isPM = /pm/i.test(trimmed);
      const isAM = /am/i.test(trimmed);
      const cleanStr = trimmed.replace(/[^\d:]/g, "");
      const parts = cleanStr.split(":");
      if (parts.length < 2) return null;

      let hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (isNaN(hours) || isNaN(minutes)) return null;

      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const checkScheduledSlots = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMinutes = currentHours * 60 + currentMinutes;

      const localYear = now.getFullYear();
      const localMonth = String(now.getMonth() + 1).padStart(2, "0");
      const localDay = String(now.getDate()).padStart(2, "0");
      const todayLocalDateStr = `${localYear}-${localMonth}-${localDay}`;

      const currentHHMM = `${String(currentHours).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`;
      const currentHHMMSS = `${currentHHMM}:${String(now.getSeconds()).padStart(2, "0")}`;
      setLastCronCheck(currentHHMMSS);

      // Filter out duplicate active reminders for the same phone number (keep newest)
      const phoneMap = new Map<string, FirebaseReminder>();
      firebaseReminders
        .filter((r) => r.haliYaUkumbusho === "HAI")
        .forEach((r) => {
          const cleanPhone = (r.nambaSimu || "").replace(/[^\d]/g, "");
          if (!cleanPhone) return;
          const existing = phoneMap.get(cleanPhone);
          if (!existing) {
            phoneMap.set(cleanPhone, r);
          } else {
            const timeNew = new Date(r.tareheIliyowashwa || 0).getTime();
            const timeOld = new Date(existing.tareheIliyowashwa || 0).getTime();
            if (timeNew >= timeOld) {
              phoneMap.set(cleanPhone, r);
            }
          }
        });

      const activeList = Array.from(phoneMap.values());

      activeList.forEach((reminder) => {
        const slots = [
          { label: "Subhi (Asubuhi)", time: reminder.mudaAsubuhi },
          { label: "Mchana", time: reminder.mudaMchana },
          { label: "Jioni", time: reminder.mudaJioni }
        ];

        slots.forEach((slot) => {
          if (!slot.time || !slot.time.trim()) return;
          const slotMinutes = parseTimeToMinutes(slot.time);
          if (slotMinutes === null) return;

          // Trigger STRICTLY when current clock time equals exact scheduled slot time (0 to 1 min window)
          // Difference must be >= 0 (never before scheduled time) and <= 1 (exact minute)
          const minutesDiff = currentTotalMinutes - slotMinutes;
          if (minutesDiff >= 0 && minutesDiff <= 1) {
            const cleanTime = slot.time.trim();
            const cleanPhone = (reminder.nambaSimu || "").replace(/[^\d]/g, "");
            const dedupeKey = `${todayLocalDateStr}_${cleanPhone}_${slot.label}_${cleanTime}`;
            if (!sentTodayKeys.has(dedupeKey)) {
              markKeyAsSentToday(dedupeKey);
              handleTriggerSingleReminderSMS(reminder, `âš¡ Auto-Cron (${slot.label})`, false);
            }
          }
        });
      });
    };

    checkScheduledSlots();
    const interval = setInterval(checkScheduledSlots, 15000);
    return () => clearInterval(interval);
  }, [autoDispatcherEnabled, firebaseReminders, sentTodayKeys]);

  // Auto save Oasis credentials to localStorage
  useEffect(() => {
    localStorage.setItem("oasis_api_key", oasisApiKey);
    localStorage.setItem("oasis_sender_id", oasisSenderId);
    localStorage.setItem("oasis_base_url", oasisBaseUrl);
    localStorage.setItem("oasis_use_cors_proxy", String(useCorsProxy));
  }, [oasisApiKey, oasisSenderId, oasisBaseUrl, useCorsProxy]);

  // Real-time listener for Firebase Firestore collection 'patient_reminders'
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(
        collection(db, "patient_reminders"),
        (snapshot) => {
          const list: FirebaseReminder[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as FirebaseReminder);
          });
          setFirebaseReminders(list);
        },
        (err) => {
          console.error("Firestore patient_reminders error:", err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase listener initialization failed:", e);
    }
  }, []);

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
    } else if (category.includes("Ukumbusho wa Dawa - Asubuhi")) {
      setMessageBody(
        "Assalam Alaykum / Habari Ndg {JINA}, huu ni ukumbusho wa Al-Furqan Herbs Clinic wa kunywa dawa zako za ASUPUHI kwa wakati na maji ya kutosha. Afya bora ni mtaji wako!"
      );
    } else if (category.includes("Ukumbusho wa Dawa - Mchana/Jioni")) {
      setMessageBody(
        "Assalam Alaykum / Habari Ndg {JINA}, huu ni ukumbusho wa Al-Furqan Herbs Clinic wa kunywa dawa yako ya MCHANA / JIONI. Kula chakula na kunywa dawa kwa wakati kulingana na ushauri wa daktari."
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

  // Trigger Instant Medication Reminder SMS via Oasis API
  const handleTriggerSingleReminderSMS = async (reminder: FirebaseReminder, slotLabel: string = "Asubuhi", showAlert: boolean = true) => {
    setSendingReminderId(reminder.id);
    const recipientPhone = formatTanzaniaPhone(reminder.nambaSimu);
    const sender = oasisSenderId.trim() || "AHC MKONONI";

    const customMessage = `Assalam Alaykum / Habari Ndg ${reminder.jinaMgonjwa}, huu ni ukumbusho wa Al-Furqan Herbs Clinic wa kunywa dawa zako: ${reminder.dawaAlizopewa}. Maelezo: ${reminder.maelezoYaZiada || "Kunywa kwa wakati na maji ya kutosha"}. Awamu: ${slotLabel}. Afya bora ni mtaji wako!`;

    try {
      const targetUrl = oasisBaseUrl.trim() || "https://bulksms.oasistech.co.tz/api/sms/send";
      const response = await executeOasisSmsRequest(
        targetUrl,
        oasisApiKey,
        sender,
        recipientPhone,
        customMessage
      );

      const rawText = await response.text();
      let parsedJson: any = {};
      try { parsedJson = JSON.parse(rawText); } catch {}

      const isSuccess = response.ok;
      const detailMsg = isSuccess
        ? `Ujumbe umetumwa Oasis kwa mafanikio (${recipientPhone})`
        : extractErrorMessage(parsedJson, `HTTP ${response.status} Error`);

      const logEntry = {
        id: `${reminder.id}-${Date.now()}`,
        name: reminder.jinaMgonjwa,
        phone: reminder.nambaSimu,
        time: new Date().toLocaleTimeString(),
        status: isSuccess ? ("success" as const) : ("failed" as const),
        detail: `[${slotLabel}] ${detailMsg}`
      };

      setReminderDispatchLogs(prev => [logEntry, ...prev]);

      // Update Firestore document with timestamp of last sent SMS
      try {
        await updateDoc(doc(db, "patient_reminders", reminder.id), {
          mudaWaMwishoKutuma: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to update timestamp in Firestore:", err);
      }

      if (showAlert) {
        if (isSuccess) {
          alert(`âœ… Imefanikiwa! Ukumbusho wa SMS (${slotLabel}) umetumwa kwa ${reminder.jinaMgonjwa} (${recipientPhone}) kupitia Oasis SMS Gateway.`);
        } else {
          alert(`âŒ Imeshindikana kutuma SMS kwa ${reminder.jinaMgonjwa}: ${detailMsg}`);
        }
      }
    } catch (err: any) {
      if (showAlert) {
        alert(`Hitilafu ya mtandao: ${err.message}`);
      }
    } finally {
      setSendingReminderId(null);
    }
  };

  // Batch send medication reminders to ALL active patients now
  const handleBatchSendAllActiveReminders = async (slotLabel: string = "Asubuhi") => {
    const activeList = firebaseReminders.filter((r) => r.haliYaUkumbusho === "HAI");
    if (activeList.length === 0) {
      alert("Hakuna wagonjwa wenye ratiba za ukumbusho zilizo HAI (Active) kwa sasa.");
      return;
    }

    if (!oasisApiKey.trim()) {
      alert("âš ï¸ Oasis API Key haijawekwa! Tafadhali weka API Key kwenye Mipangilio ya Oasis API Key kwanza.");
      setShowApiSettings(true);
      return;
    }

    const confirmSend = window.confirm(
      `Unakaribia kutuma ukumbusho wa SMS (${slotLabel}) kwa wagonjwa wote ${activeList.length} waliopo kwenye mfumo wa Firebase. Unapenda kuendelea?`
    );
    if (!confirmSend) return;

    for (let i = 0; i < activeList.length; i++) {
      const reminder = activeList[i];
      await handleTriggerSingleReminderSMS(reminder, `Batch ${slotLabel}`, false);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    alert(`âœ… Mchakato wa kutuma ukumbusho wa SMS (${slotLabel}) kwa wagonjwa wote ${activeList.length} umekamilika! Angalia kumbukumbu za utumaji hapo chini.`);
  };

  // Toggle Reminder Active/Inactive Status in Firestore
  const handleToggleReminderStatus = async (reminder: FirebaseReminder) => {
    const newStatus = reminder.haliYaUkumbusho === "HAI" ? "IMESITISHWA" : "HAI";
    try {
      await updateDoc(doc(db, "patient_reminders", reminder.id), {
        haliYaUkumbusho: newStatus
      });
      alert(`Hali ya ukumbusho ya ${reminder.jinaMgonjwa} imebadilishwa kuwa: ${newStatus}`);
    } catch (err: any) {
      alert("Hitilafu katika kubadilisha hali: " + err.message);
    }
  };

  // Delete Reminder document from Firestore
  const handleDeleteReminder = async (reminderId: string, name: string) => {
    if (!window.confirm(`Unauhakika unataka kufuta kabisa ratiba ya ukumbusho ya ${name}?`)) return;
    try {
      await deleteDoc(doc(db, "patient_reminders", reminderId));
      alert(`âœ… Ratiba ya ukumbusho ya ${name} imefutwa kikamilifu kutoka Firebase Database.`);
    } catch (err: any) {
      alert("Hitilafu wakati wa kufuta ratiba: " + err.message);
    }
  };

  // Start editing times for a reminder card
  const handleStartEditingTimes = (reminder: FirebaseReminder) => {
    setEditingReminderId(reminder.id);
    setEditSubhiTime(reminder.mudaAsubuhi || "08:00");
    setEditMchanaTime(reminder.mudaMchana || "14:00");
    setEditJioniTime(reminder.mudaJioni || "20:00");
  };

  // Save updated times directly to Firestore doc
  const handleSaveUpdatedTimes = async (reminderId: string, name: string) => {
    try {
      await updateDoc(doc(db, "patient_reminders", reminderId), {
        mudaAsubuhi: editSubhiTime,
        mudaMchana: editMchanaTime,
        mudaJioni: editJioniTime,
        tareheIliyowashwa: new Date().toISOString()
      });
      setEditingReminderId(null);
      alert(`âœ… Muda mpya wa ukumbusho wa ${name} umehifadhiwa kikamilifu:\nâ˜€ï¸ Asubuhi: ${editSubhiTime}\nðŸŒ¤ï¸ Mchana: ${editMchanaTime}\nðŸŒ™ Jioni: ${editJioniTime}`);
    } catch (err: any) {
      alert("Hitilafu wakati wa kuhifadhi muda mpya: " + err.message);
    }
  };

  // Get active target list based on single/bulk/manual/reminders selection
  const getTargetPatients = (): { id: string; name: string; phone: string; cardNumber: string }[] => {
    if (recipientMode === "reminders") {
      return firebaseReminders
        .filter((r) => r.haliYaUkumbusho === "HAI")
        .map((r, idx) => ({
          id: r.id || `rem-${idx}`,
          name: r.jinaMgonjwa,
          phone: r.nambaSimu,
          cardNumber: `Dawa: ${r.dawaAlizopewa}`
        }));
    }
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

  // Helper function to execute Oasis API requests with server proxy (send.js) and direct fallback
  const executeOasisSmsRequest = async (
    targetUrl: string,
    apiKey: string,
    senderId: string,
    recipientPhone: string,
    messageText: string
  ): Promise<Response> => {
    const serverPayload = {
      apiKey: apiKey.trim(),
      from: senderId,
      to: recipientPhone,
      text: messageText,
      baseUrl: targetUrl
    };

    let response: Response | null = null;

    // 1. Primary: Try calling server API route /api/sms/send (send.js)
    try {
      const apiResp = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(serverPayload)
      });
      if (apiResp.status !== 404 && apiResp.status !== 405) {
        response = apiResp;
      }
    } catch (err) {
      // Server proxy call failed or not found
    }

    // 2. Fallback: If /api/sms/send unavailable, try public CORS proxy or direct fetch
    if (!response) {
      const directPayload = {
        sender_id: senderId,
        sender: senderId,
        from: senderId,
        recipient: recipientPhone,
        mobile: recipientPhone,
        to: recipientPhone,
        message: messageText,
        text: messageText,
        api_key: apiKey.trim(),
        apiKey: apiKey.trim()
      };

      if (useCorsProxy) {
        try {
          const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
          const res = await fetch(corsProxyUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey.trim()}`,
              "Accept": "application/json"
            },
            body: JSON.stringify(directPayload)
          });
          const contentType = res.headers.get("content-type") || "";
          if (!contentType.includes("text/html")) {
            response = res;
          }
        } catch (e) {
          // Cors proxy failed
        }
      }

      if (!response) {
        response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey.trim()}`,
            "Accept": "application/json"
          },
          body: JSON.stringify(directPayload)
        });
      }
    }

    return response;
  };

  // Test Connection with Oasis API
  const handleTestOasisConnection = async () => {
    if (!oasisApiKey.trim()) {
      setErrorMessage("Tafadhali ingiza Oasis API Key hapo juu ili kuweza kupima muunganiko!");
      setShowApiSettings(true);
      return;
    }

    setIsTestingApi(true);
    setTestResult(null);
    setErrorMessage(null);

    const testPhone = "255712000000";
    const sender = oasisSenderId.trim() || "AHC MKONONI";
    const targetUrl = oasisBaseUrl.trim() || "https://bulksms.oasistech.co.tz/api/sms/send";

    try {
      const resp = await executeOasisSmsRequest(
        targetUrl,
        oasisApiKey,
        sender,
        testPhone,
        "Jaribio la muunganiko wa mfumo wa Al-Furqan Herbs Clinic na Oasis SMS Gateway."
      );

      const rawText = await resp.text();
      let parsedJson: any = null;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {}

      if (resp.ok) {
        setTestResult({
          success: true,
          statusCode: resp.status,
          rawResponse: rawText,
          message: `âœ… Muunganiko na Oasis Umefanikiwa! Server imerejesha HTTP ${resp.status}. Majibu ya Oasis: ${extractErrorMessage(parsedJson, rawText)}`
        });
      } else {
        const errorMsg = extractErrorMessage(parsedJson, rawText);
        setTestResult({
          success: false,
          statusCode: resp.status,
          rawResponse: rawText,
          message: `âŒ Oasis Gateway Imerejesha Majibu Yenye Makosa (HTTP ${resp.status}): ${errorMsg}. Tafadhali hakikisha API Key yako ni sahihi, Sender ID ('${sender}') imesajiliwa Oasis, na salio la SMS lipo.`
        });
      }
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        message: `Hitilafu ya Kuunganisha: ${errStr}`
      });
    } finally {
      setIsTestingApi(false);
    }
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

    const hasApiKey = oasisApiKey.trim().length > 0;
    if (!hasApiKey) {
      setShowApiSettings(true);
      setErrorMessage("âš ï¸ API Key ya Oasis haijawekwa! Ili SMS zitoke kwenda Oasis na ziwafikie wateja kwenye simu, lazima uingize API Key yako kwanza kwenye Mipangilio ya Oasis API Key hapo juu.");
      return;
    }

    setIsSending(true);
    setSendingProgress(0);
    setSendingLog([]);
    setErrorMessage(null);
    setSuccessMessage(null);

    const sender = oasisSenderId.trim() || "AHC MKONONI";
    const logs: { name: string; phone: string; status: "success" | "failed"; time: string; details?: string }[] = [];

    for (let i = 0; i < targetPatients.length; i++) {
      const patient = targetPatients[i];
      const recipientPhone = formatTanzaniaPhone(patient.phone);
      const textToDeliver = messageBody.replace(/\{JINA\}/g, patient.name).replace(/\{CARD_NO\}/g, patient.cardNumber);

      // Delay between SMS dispatches
      await new Promise((res) => setTimeout(res, 500));

      let isSuccess = false;
      let responseDetails = "";

      try {
        const targetUrl = oasisBaseUrl.trim() || "https://bulksms.oasistech.co.tz/api/sms/send";
        const response = await executeOasisSmsRequest(
          targetUrl,
          oasisApiKey,
          sender,
          recipientPhone,
          textToDeliver
        );

        const rawText = await response.text();
        let parsedData: any = {};
        try {
          parsedData = JSON.parse(rawText);
        } catch {
          parsedData = rawText;
        }

        if (response.ok) {
          isSuccess = true;
          const msg = extractErrorMessage(parsedData, `Ujumbe umewasilishwa Oasis kwa mafanikio (${recipientPhone})`);
          responseDetails = `HTTP ${response.status}: ${msg}`;
        } else {
          isSuccess = false;
          const cleanMsg = extractErrorMessage(parsedData, `HTTP ${response.status} kutoka Oasis Gateway`);
          responseDetails = `Hitilafu ya Oasis (HTTP ${response.status}): ${cleanMsg}`;
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        isSuccess = false;
        responseDetails = `Hitilafu ya Mtandao: ${errMsg}`;
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
    const successfulCount = logs.filter(l => l.status === "success").length;
    const failedCount = logs.filter(l => l.status === "failed").length;

    if (failedCount === 0) {
      setSuccessMessage(`Ujumbe umewasilishwa kwa mafanikio kwa wagonjwa wote ${successfulCount} kupitia Oasis Technologies SMS Gateway!`);
    } else if (successfulCount > 0) {
      setSuccessMessage(`Ujumbe umewasilishwa kwa wagonjwa ${successfulCount}. Hata hivyo, wagonjwa ${failedCount} walipata hitilafu (Angalia kumbukumbu upande wa kulia).`);
    } else {
      setErrorMessage(`Utumaji kwenda Oasis umefeli kwa wagonjwa wote. Sababu kuu: ${logs[0]?.details || "Hujaiweka API Key au Sender ID 'AHC MKONONI' haijasajiliwa Oasis"}`);
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
                  onClick={() => setOasisBaseUrl("https://bulksms.oasistech.co.tz/api/sms")}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                    oasisBaseUrl === "https://bulksms.oasistech.co.tz/api/sms"
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  bulksms.oasistech.co.tz (/api/sms)
                </button>
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

          {/* Test Connection Button & Result Display */}
          <div className="bg-white p-3 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-black text-gray-800">
                  JARIBU MUUNGANIKO WA OASIS API (TEST CONNECTION)
                </p>
                <p className="text-[10px] text-gray-500">
                  Pima ikiwa API Key na Sender ID '<strong>{oasisSenderId}</strong>' zinafanya kazi na Oasis.
                </p>
              </div>

              <button
                type="button"
                disabled={isTestingApi}
                onClick={handleTestOasisConnection}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isTestingApi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Inapima...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-200" />
                    <span>Jaribu Muunganiko Sasa</span>
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold space-y-1.5 animate-fadeIn ${
                  testResult.success
                    ? "bg-emerald-50 border border-emerald-300 text-emerald-900"
                    : "bg-rose-50 border border-rose-300 text-rose-900"
                }`}
              >
                <div className="flex items-center gap-2 font-black">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{testResult.message}</span>
                </div>

                {testResult.rawResponse && (
                  <details className="mt-1">
                    <summary className="text-[10px] font-mono cursor-pointer text-gray-600 hover:underline">
                      Onyesha Raw JSON Response kutoka Oasis Server
                    </summary>
                    <pre className="p-2 bg-black/80 text-emerald-300 rounded font-mono text-[10px] overflow-x-auto mt-1 whitespace-pre-wrap">
                      {testResult.rawResponse}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-amber-900 bg-white/80 p-2.5 rounded-lg border border-amber-200">
            <span className="flex items-center gap-1.5 font-semibold">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
              Ingiza API Key ya Oasis hapo juu ili SMS zitoke kwenda kwenye website ya Oasis.
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

      {/* Sub Navigation Bar: Bulk Broadcast vs Patient Medication Reminders */}
      <div className="bg-emerald-950 p-2.5 flex flex-col sm:flex-row border-b border-emerald-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("broadcast")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "broadcast"
              ? "bg-amber-400 text-emerald-950 shadow-md"
              : "bg-emerald-900/60 text-emerald-200 hover:bg-emerald-900"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>BROADCAST CENTER (SMS NA WHATSAPP)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reminders")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            activeTab === "reminders"
              ? "bg-amber-400 text-emerald-950 shadow-md"
              : "bg-emerald-900/60 text-emerald-200 hover:bg-emerald-900"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>RATIBA ZA UKUMBUSHO WA DAWA (FIREBASE ENGINE)</span>
          {firebaseReminders.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
              {firebaseReminders.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: BULK BROADCAST & DIRECT MESSAGING */}
      {activeTab === "broadcast" && (
        <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Form Controls */}
        <div className="xl:col-span-2 space-y-5">
          
          {/* Target Recipient Selector (Single vs Bulk vs Manual) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="text-xs font-extrabold text-primary uppercase tracking-wider block">
              CHAGUA WALENGWA (RECIPIENT TARGET)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

              {/* Option 4: Medication Reminders (Firebase Engine) */}
              <button
                type="button"
                onClick={() => {
                  setRecipientMode("reminders");
                  setActiveTab("reminders");
                }}
                className={`p-3 rounded-xl border-2 font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                  recipientMode === "reminders" || activeTab === "reminders"
                    ? "bg-amber-500 text-emerald-950 border-amber-600 shadow-md"
                    : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 flex-shrink-0 text-emerald-950" />
                  <div className="text-left">
                    <p className="font-extrabold">Ukumbusho wa Dawa</p>
                    <p className="text-[10px] text-emerald-950 font-bold">
                      Firebase Sync ({firebaseReminders.length})
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-950 flex-shrink-0" />
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
                      {p.name} ({p.cardNumber}) â€” Simu: {p.phone}
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
                    {oasisApiKey ? "âœ“ API Key ipo tayari" : "âš  API Key haijawekwa (Demo Mode)"}
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
                  <span>âœ“ Hakuna gharama za Meta</span>
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
              <option value="Ukumbusho wa Dawa - Asubuhi">
                ðŸ’Š Ukumbusho wa Kunywa Dawa - Asubuhi
              </option>
              <option value="Ukumbusho wa Dawa - Mchana/Jioni">
                ðŸŒ™ Ukumbusho wa Kunywa Dawa - Mchana / Jioni
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
            <div className="space-y-2">
              {!oasisApiKey.trim() && (
                <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-900 font-semibold flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-extrabold text-amber-950">âš ï¸ TANBIHI: Oasis API Key Haijawekwa!</p>
                    <p className="text-[11px] leading-relaxed">
                      Ili SMS hizi zifike kwenye website ya Oasis Technology na ziwafikie wateja kwenye simu, bofya{" "}
                      <button
                        type="button"
                        onClick={() => setShowApiSettings(true)}
                        className="underline font-black text-amber-800 hover:text-amber-950 cursor-pointer"
                      >
                        'Weka API Key ya Oasis SMS'
                      </button>{" "}
                      hapo juu na uingize Oasis API Key yako na Sender ID <strong>AHC MKONONI</strong>.
                    </p>
                  </div>
                </div>
              )}

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
            </div>
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
                          <p className="text-[10px] text-gray-500 font-mono">{p.phone} â€¢ {p.cardNumber}</p>
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
              </div>
              <div className="flex justify-between font-bold text-gray-700">
                <span>API Key Token:</span>
                <span className="font-mono text-gray-500">
                  {oasisApiKey ? "â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" + oasisApiKey.slice(-4) : "Haijawekwa"}
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
            <div className="bg-white border-2 border-primary/20 p-4 rounded-2xl space-y-3 shadow-xs">
              <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center justify-between border-b border-gray-100 pb-2">
                <span>Kumbukumbu za Utumaji Oasis ({sendingLog.length})</span>
                <RefreshCw className={`w-3.5 h-3.5 ${isSending ? "animate-spin text-rose-600" : "text-emerald-600"}`} />
              </h4>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 text-[11px]">
                {sendingLog.map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
                      log.status === "success"
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                        : "bg-rose-50/70 border-rose-200 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-primary uppercase">{log.name}</span>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                          log.status === "success"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-rose-100 text-rose-800 border-rose-300"
                        }`}
                      >
                        {log.status === "success" ? "âœ“ Imewasilishwa Oasis" : "âœ• Hitilafu"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                      <span>{log.phone}</span>
                      <span>{log.time}</span>
                    </div>

                    {log.details && (
                      <p
                        className={`text-[10px] font-medium leading-tight p-1.5 rounded border mt-0.5 ${
                          log.status === "success"
                            ? "bg-white/80 text-emerald-800 border-emerald-200"
                            : "bg-white/80 text-rose-800 border-rose-200"
                        }`}
                      >
                        {log.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
      )}

      {/* TAB 2: FIREBASE PATIENT MEDICATION REMINDERS DISPATCHER */}
      {activeTab === "reminders" && (
        <div className="p-6 space-y-6 animate-fadeIn">
          {/* Top Banner Info */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 rounded-2xl border-2 border-emerald-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm sm:text-base font-display text-amber-300 uppercase tracking-wide">
                  UTUMAJI WA UKUMBUSHO WA DAWA (FIREBASE FIRESTORE SYNC)
                </h3>
              </div>
              <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                Hapa ni orodha ya ratiba zote za ukumbusho wa dawa zilizohifadhiwa Firebase kutoka kwenye ukurasa wa <strong>Orodha ya Wagonjwa</strong>.
                Unaweza kutuma ujumbe wa ukumbusho wa papo hapo kwa kila mgonjwa kupitia Oasis SMS Gateway, au kuweka utumaji wa kiotomatiki wa kila siku (Firebase Cloud Function / Cron Job).
              </p>
            </div>

            <button
              onClick={() => setShowCloudFunctionModal(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <FileCode className="w-4 h-4" />
              <span>Soma Code ya Utumaji wa Kiotomatiki (Cloud Function)</span>
            </button>
          </div>

          {/* LIVE AUTO-DISPATCHER CONTROL PANEL & BATCH CONTROLS */}
          <div className="bg-emerald-50 border-2 border-emerald-300 p-4 sm:p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-emerald-200 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-xs sm:text-sm uppercase tracking-wide">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-400 animate-pulse" />
                  <span>MFUMO WA UTUMAJI WA KIOTOMATIKI WA KIVINJARI (LIVE IN-APP AUTO-DISPATCHER)</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Ukiwa umewashwa, mfumo utakagua ratiba za leo kila baada ya sekunde 30 na kutuma SMS za Subhi (08:00), Mchana (14:00), au Jioni (20:00) kiotomatiki.
                </p>
              </div>

              {/* Toggle Auto-Dispatcher */}
              <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-2 rounded-xl border-2 border-emerald-300 shadow-xs">
                <input
                  type="checkbox"
                  checked={autoDispatcherEnabled}
                  onChange={(e) => setAutoDispatcherEnabled(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
                <span className="text-xs font-black uppercase text-emerald-950">
                  {autoDispatcherEnabled ? "ðŸŸ¢ Auto-Dispatcher Imewashwa (Active)" : "ðŸ”´ Auto-Dispatcher Imesitishwa"}
                </span>
              </label>
            </div>

            {/* Live Status Indicators & Quick Batch Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-emerald-900">
                <span className="bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-xs flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Kukagua kwa Mwisho: <strong>{lastCronCheck || "Saa ya Sasa"}</strong></span>
                </span>
                <span className="bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-xs flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span>Wagonjwa Walio Active: <strong>{firebaseReminders.filter(r => r.haliYaUkumbusho === "HAI").length}</strong></span>
                </span>
              </div>

              {/* Quick Batch Actions & Memory Reset */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    localStorage.removeItem(`oasis_sent_keys_${today}`);
                    setSentTodayKeys(new Set());
                    alert("âœ… Kumbukumbu za utumaji wa kiotomatiki za leo zimesafishwa! Sasa unaweza kujaribu mabadiliko ya muda tena.");
                  }}
                  title="Futa kumbukumbu za utumaji wa kiotomatiki za leo ili uweze kujaribu tena muda mpya"
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Safisha Memory ya Leo</span>
                </button>
                <span className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-wider hidden sm:inline ml-1">
                  Batch:
                </span>
                <button
                  onClick={() => handleBatchSendAllActiveReminders("Subhi (Asubuhi)")}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Subhi Yote</span>
                </button>
                <button
                  onClick={() => handleBatchSendAllActiveReminders("Mchana / Jioni")}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Jioni Yote</span>
                </button>
              </div>
            </div>
          </div>

          {/* List of Firebase Reminders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-700" />
                <h4 className="font-extrabold text-sm text-primary uppercase tracking-wider">
                  RATIBA ZOTE ZILIZOPO FIREBASE ({firebaseReminders.length})
                </h4>
              </div>
              <span className="text-xs font-semibold text-gray-500">
                Inasasishwa kiotomatiki (Real-time Firestore)
              </span>
            </div>

            {firebaseReminders.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-3">
                <Pill className="w-12 h-12 text-slate-400 mx-auto" />
                <h5 className="font-extrabold text-primary text-sm">Hakuna Ratiba za Ukumbusho Bado</h5>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Ili kutengeneza ukumbusho mpya, nenda kwenye ukurasa wa <strong>Orodha ya Wagonjwa</strong>, chagua mgonjwa, kisha bonyeza kitufe cha <strong>"Kumbusha Dawa (Set Reminder)"</strong> na ujaze fomu.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {firebaseReminders.map((reminder) => {
                  const isSendingThis = sendingReminderId === reminder.id;
                  const isNoteActive = reminder.haliYaUkumbusho === "HAI";

                  return (
                    <div
                      key={reminder.id}
                      className={`bg-white rounded-2xl border-2 p-4 space-y-3 transition-all shadow-sm ${
                        isNoteActive
                          ? "border-emerald-200 hover:border-emerald-400"
                          : "border-gray-200 bg-gray-50/70 opacity-75"
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between border-b border-gray-100 pb-2.5">
                        <div>
                          <h5 className="font-extrabold text-sm text-primary flex items-center gap-1.5">
                            <User className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>{reminder.jinaMgonjwa}</span>
                          </h5>
                          <p className="text-xs text-gray-600 font-mono font-bold mt-0.5">
                            ðŸ“ž {reminder.nambaSimu}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleReminderStatus(reminder)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border cursor-pointer transition-colors ${
                              isNoteActive
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                                : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
                            }`}
                          >
                            {isNoteActive ? "HAI (ACTIVE)" : "IMESITISHWA"}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteReminder(reminder.id, reminder.jinaMgonjwa)}
                            title="Futa ratiba hii kabisa kutoka Firebase"
                            className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 text-xs text-gray-700">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 font-medium">
                          <span className="font-bold text-primary block text-[11px] uppercase tracking-wider mb-0.5">ðŸ’Š Dawa Alizopewa:</span>
                          <span className="text-emerald-950 font-semibold">{reminder.dawaAlizopewa || "Haikutajwa"}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                            <span className="font-bold text-amber-900 block">Mara kwa siku:</span>
                            <span className="font-black text-amber-950">{reminder.maraNgapiKwaSiku || "Kila Siku"}</span>
                          </div>

                          <div className="bg-sky-50 p-2 rounded-lg border border-sky-200">
                            <span className="font-bold text-sky-900 block">Siku za matumizi:</span>
                            <span className="font-black text-sky-950">{reminder.sikuZaUkumbusho || 7} Siku</span>
                          </div>
                        </div>

                        {/* Timeslots (Display or Inline Edit) */}
                        {editingReminderId === reminder.id ? (
                          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-300 space-y-2 animate-fadeIn">
                            <span className="text-[11px] font-extrabold text-amber-950 block">âœï¸ Badilisha Nyakati za SMS:</span>
                            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                              <div>
                                <label className="block font-bold text-amber-900 mb-0.5">Asubuhi:</label>
                                <input
                                  type="time"
                                  value={editSubhiTime}
                                  onChange={(e) => setEditSubhiTime(e.target.value)}
                                  className="w-full p-1 bg-white border border-amber-400 rounded font-mono font-bold"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-amber-900 mb-0.5">Mchana:</label>
                                <input
                                  type="time"
                                  value={editMchanaTime}
                                  onChange={(e) => setEditMchanaTime(e.target.value)}
                                  className="w-full p-1 bg-white border border-amber-400 rounded font-mono font-bold"
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-amber-900 mb-0.5">Jioni:</label>
                                <input
                                  type="time"
                                  value={editJioniTime}
                                  onChange={(e) => setEditJioniTime(e.target.value)}
                                  className="w-full p-1 bg-white border border-amber-400 rounded font-mono font-bold"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-1.5 pt-1">
                              <button
                                onClick={() => setEditingReminderId(null)}
                                className="px-2 py-1 bg-gray-200 text-gray-700 font-bold text-[10px] rounded cursor-pointer"
                              >
                                Ghairi
                              </button>
                              <button
                                onClick={() => handleSaveUpdatedTimes(reminder.id, reminder.jinaMgonjwa)}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded cursor-pointer flex items-center gap-1"
                              >
                                <Save className="w-3 h-3" />
                                Hifadhi Muda
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[11px] bg-slate-100 p-2 rounded-lg text-slate-700 font-medium">
                            <div className="flex items-center gap-2">
                              <span>â° Subhi: <strong>{reminder.mudaAsubuhi || "--:--"}</strong></span>
                              <span>Mchana: <strong>{reminder.mudaMchana || "--:--"}</strong></span>
                              <span>Jioni: <strong>{reminder.mudaJioni || "--:--"}</strong></span>
                            </div>
                            <button
                              onClick={() => handleStartEditingTimes(reminder)}
                              title="Badilisha muda wa ukumbusho"
                              className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer ml-1"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {reminder.mudaWaMwishoKutuma && (
                          <div className="text-[10px] text-gray-500 flex items-center gap-1 font-mono pt-1">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mwisho Kutumwa SMS: {new Date(reminder.mudaWaMwishoKutuma).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Trigger SMS */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tuma Papo Hapo:</span>
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            disabled={isSendingThis}
                            onClick={() => handleTriggerSingleReminderSMS(reminder, "Subhi (Asubuhi)")}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow-sm cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {isSendingThis ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            <span>SMS Subhi</span>
                          </button>

                          <button
                            disabled={isSendingThis}
                            onClick={() => handleTriggerSingleReminderSMS(reminder, "Mchana")}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] shadow-sm cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {isSendingThis ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            <span>SMS Mchana</span>
                          </button>

                          <button
                            disabled={isSendingThis}
                            onClick={() => handleTriggerSingleReminderSMS(reminder, "Jioni")}
                            className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[10px] shadow-sm cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {isSendingThis ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            <span>SMS Jioni</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dispatch Logs */}
          {reminderDispatchLogs.length > 0 && (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h5 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>KUMBUKUMBU YA UTUMAJI WA UKUMBUSHO (DISPATCH LOGS)</span>
              </h5>
              <div className="max-h-48 overflow-y-auto space-y-2 text-xs font-mono">
                {reminderDispatchLogs.map((log) => (
                  <div key={log.id} className="p-2 rounded bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{log.name}</span> ({log.phone}) - <span className="text-amber-300">{log.time}</span>
                      <p className="text-[11px] text-slate-300">{log.detail}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === "success" ? "bg-emerald-900 text-emerald-200" : "bg-rose-900 text-rose-200"}`}>
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CLOUD FUNCTION / CRON JOB GUIDE MODAL */}
      {showCloudFunctionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border-2 border-emerald-600 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-500" />
                <h3 className="font-black text-base text-primary uppercase">
                  Jinsi ya Kuweka Utumaji wa Kiotomatiki (Cron / Cloud Function)
                </h3>
              </div>
              <button
                onClick={() => setShowCloudFunctionModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer font-bold text-lg"
              >
                âœ•
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
              <p>
                Ili ujumbe wa ukumbusho wa dawa uwe unajituma kiotomatiki <strong>kila siku asubuhi, mchana, na jioni bila wewe kubonyeza kitufe</strong>, unahitaji kuweka <strong>Firebase Cloud Function Scheduled Cron Job</strong>.
              </p>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto space-y-2">
                <span className="text-amber-400 font-bold block">// Code ya Firebase Cloud Function (index.js):</span>
                <pre className="text-[11px] font-mono text-emerald-300 leading-relaxed">{`const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

exports.scheduledMedicationReminder = functions.pubsub
  .schedule("0 8,14,20 * * *")
  .timeZone("Africa/Dar_es_Salaam")
  .onRun(async (context) => {
    const db = admin.firestore();
    const snapshot = await db.collection("patient_reminders")
      .where("haliYaUkumbusho", "==", "HAI")
      .get();

    snapshot.forEach(async (docSnap) => {
      const r = docSnap.data();
      const msg = "Habari " + r.jinaMgonjwa + ", huu ni ukumbusho wa Al-Furqan Herbs Clinic wa kunywa dawa: " + r.dawaAlizopewa;
      
      await axios.post("https://bulksms.oasistech.co.tz/api/sms/send", {
        api_key: "YOUR_OASIS_API_KEY",
        service_id: 0,
        sender_id: "AHC MKONONI",
        mobile: r.nambaSimu,
        sms: msg
      });
    });
  });`}</pre>
              </div>

              <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl space-y-1 text-amber-900 font-medium">
                <span className="font-extrabold flex items-center gap-1">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Njia Rahisi Basi za Kila Siku (Kutoka kwenye Mfumo):</span>
                </span>
                <p>
                  Kwa sasa, ukiwa kwenye mfumo huu, unaweza pia kutumia vitufe vya <strong>"SMS Subhi"</strong> na <strong>"SMS Jioni"</strong> kwenye orodha iliyopo hapo juu ili kutuma ukumbusho papo hapo kupitia Oasis SMS Gateway.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowCloudFunctionModal(false)}
                className="px-5 py-2.5 bg-primary hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer"
              >
                Nimeelewa (Funga)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default BroadcastCenter;
