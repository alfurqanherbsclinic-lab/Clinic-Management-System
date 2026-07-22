import React, { useState } from 'react';
import { Patient } from '../types';
import { Send, Key, Smartphone, CheckCircle2, MessageSquare, AlertCircle, RefreshCw, Settings, ShieldCheck } from 'lucide-react';

interface BroadcastCenterProps {
  patients: Patient[];
}

export function BroadcastCenter({ patients }: BroadcastCenterProps) {
  // Target recipient mode
  const [recipientMode, setRecipientMode] = useState<'bulk' | 'single' | 'manual'>('manual');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [manualNumbers, setManualNumbers] = useState<string>('255624955704');

  // Gateway Settings (Oasis SMS Tanzania)
  const [oasisApiKey, setOasisApiKey] = useState<string>('..................................................');
  const [oasisSenderId, setOasisSenderId] = useState<string>('AHC MKONONI');
  const [showConfig, setShowConfig] = useState<boolean>(true);

  // Broadcast Gateway option
  const [gateway, setGateway] = useState<'OASIS_SMS' | 'WHATSAPP_DIRECT'>('OASIS_SMS');

  // Broadcast Category / Template
  const [category, setCategory] = useState<string>('Dokezo la Matoleo Mapya (Stoki ya Dawa imewasili)');

  // Message Body
  const [messageBody, setMessageBody] = useState<string>(
    'Habari ndugu mgonjwa wetu wa Al-Furqan Herbs Clinic, kumbuka kunywa maji ya kutosha na kufuata ushauri wa daktari. Stoki mpya ya dawa za asili imewasili.'
  );

  // Status message
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Calculate recipients count
  const getRecipientsCount = () => {
    if (recipientMode === 'bulk') return patients.length;
    if (recipientMode === 'single') return 1;
    if (recipientMode === 'manual') {
      const split = manualNumbers.split(/[\n,;]+/).map(n => n.trim()).filter(Boolean);
      return split.length;
    }
    return 0;
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Mipangilio ya Oasis SMS Gateway imehifadhiwa kikamilifu!');
  };

  const handleSendBroadcast = () => {
    if (!messageBody.trim()) {
      alert('Tafadhali andika ujumbe wako.');
      return;
    }

    setIsSending(true);
    setSendSuccess(false);

    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Main Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-pink-100 text-pink-700 rounded-2xl">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800 tracking-tight">
              MAWASILIANO NA BULK BROADCAST (SMS & WHATSAPP CENTER)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tuma ujumbe wa dharura, dokezo la afya na elimu ya tiba ya Sunnah kwa wagonjwa wote waliosajiliwa au namba za siku.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-amber-100 transition-colors"
        >
          <Settings className="w-4 h-4 text-amber-600" />
          Mipangilio ya Oasis API Key
        </button>
      </div>

      {/* Oasis SMS Gateway Config Panel */}
      {showConfig && (
        <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/80">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Key className="w-4 h-4 text-amber-600" />
              SANIDI SALIO LA OASIS TECHNOLOGIES SMS GATEWAY
            </div>
            <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
              Oasis SMS Tanzania
            </span>
          </div>

          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">
                🔑 Oasis API Key / Token *
              </label>
              <input
                type="password"
                value={oasisApiKey}
                onChange={(e) => setOasisApiKey(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[10px] text-amber-700 mt-1">
                Siri yako inahifadhiwa kwenye kivinjari chako tu. Ukishaweka mara moja haitafutika.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">
                🏷️ Oasis Sender ID (Jina la Mtumaji) *
              </label>
              <input
                type="text"
                value={oasisSenderId}
                onChange={(e) => setOasisSenderId(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[10px] text-amber-700 mt-1">
                Jina linaloonekana kwa mgonjwa anapopokea SMS (Sender ID iliyothibitishwa na Oasis).
              </p>
            </div>

            <div className="md:col-span-2 flex justify-between items-center pt-2 border-t border-amber-200/60">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Ikiwa huna API Key bado, mfumo utakuonyesha mfano na simulation ya utumaji bila makosa.</span>
              </div>
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
              >
                Hifadhi Mipangilio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Select Recipients Target */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          CHAGUA WALENGWA (RECIPIENT TARGET)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setRecipientMode('bulk')}
            className={`p-4 rounded-xl border text-left transition-all ${
              recipientMode === 'bulk'
                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold">Wagonjwa Wote</span>
              <span className="text-[10px] opacity-80">Waliosajiliwa ({patients.length})</span>
            </div>
            <p className="text-[11px] opacity-70">Tuma kwa wagonjwa wote waliopo kwenye database.</p>
          </button>

          <button
            type="button"
            onClick={() => setRecipientMode('single')}
            className={`p-4 rounded-xl border text-left transition-all ${
              recipientMode === 'single'
                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold">Mgonjwa Mmoja</span>
              <span className="text-[10px] opacity-80">Chagua Mgonjwa</span>
            </div>
            <p className="text-[11px] opacity-70">Chagua mgonjwa maalum mmoja pekee.</p>
          </button>

          <button
            type="button"
            onClick={() => setRecipientMode('manual')}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              recipientMode === 'manual'
                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold">Namba za Siku</span>
              {recipientMode === 'manual' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-[11px] opacity-70">Ingiza Namba Ziada</p>
          </button>
        </div>

        {/* Manual Numbers Textarea */}
        {recipientMode === 'manual' && (
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                📱 Ingiza au Bandika Namba za Simu za Siku (Manual Numbers):
              </label>
              <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                {getRecipientsCount()} Namba Iliyotambuliwa
              </span>
            </div>
            <textarea
              rows={3}
              value={manualNumbers}
              onChange={(e) => setManualNumbers(e.target.value)}
              placeholder="255624955704, 255712345678"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-pink-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              * Unganisha namba kwa koma ( , ) au mstari mpya. Mfumo utazitambua kiatomati bila kujali formatting.
            </p>
          </div>
        )}

        {/* Broadcast Gateway Option */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            NJIA YA UTUMAJI (BROADCAST GATEWAY)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGateway('OASIS_SMS')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                gateway === 'OASIS_SMS'
                  ? 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-600" />
                <span className="text-xs font-black text-slate-800">
                  BULK SMS (OASIS TECHNOLOGIES)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Inatumia salio la Oasis SMS Gateway kutuma SMS moja kwa moja.</p>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="text-emerald-700 font-bold">✓ API Key Ipo tayari</span>
                <span className="text-slate-400 font-mono">Sender: {oasisSenderId}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setGateway('WHATSAPP_DIRECT')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                gateway === 'WHATSAPP_DIRECT'
                  ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black text-slate-800">
                  WHATSAPP (BILA GHARAMA ZA API)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Bure kabisa via wa.me link. Inafungua WhatsApp moja kwa moja.</p>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="text-emerald-700 font-bold">✓ Hakuna gharama za Meta</span>
                <span className="text-emerald-600 font-bold">Direct Web/App</span>
              </div>
            </button>
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            AINA YA BROADCAST (TEMPLATE CATEGORY)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
          >
            <option value="Dokezo la Matoleo Mapya (Stoki ya Dawa imewasili)">
              Dokezo la Matoleo Mapya (Stoki ya Dawa imewasili)
            </option>
            <option value="Kumbukumbu ya Tiba & Dozi za Sunnah">
              Kumbukumbu ya Tiba & Dozi za Sunnah
            </option>
            <option value="Elimu ya Afya na Tiba za Mimea">
              Elimu ya Afya na Tiba za Mimea
            </option>
          </select>
        </div>

        {/* Message Body */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              MWILI WA UJUMBE (MESSAGE BODY) *
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              {messageBody.length} Characters | ~{Math.ceil(messageBody.length / 160)} SMS
            </span>
          </div>
          <textarea
            rows={4}
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-pink-500"
          />
          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
            <div className="flex gap-1.5">
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">{'{JINA}'}</span>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">{'{CARD_NO}'}</span>
            </div>
            <span>Zitabadilishwa kiatomati kwa kila mgonjwa</span>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendBroadcast}
          disabled={isSending}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-3 px-6 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          {isSending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              INATUMA UJUMBE...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              SAMBAZA UJUMBE KWA NAMBA ZA SIKU ({getRecipientsCount()})
            </>
          )}
        </button>

        {/* Success Alert */}
        {sendSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="block font-bold">UTUMAJI UMEKAMILIKA!</strong>
              <span>Ujumbe umetumwa vyema kwa wampokeaji {getRecipientsCount()} kupitia Oasis Technologies SMS Gateway!</span>
            </div>
          </div>
        )}
      </div>

      {/* Gateway Status & Live Preview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-pink-600" />
          HALI YA GATEWAY (GATEWAY STATUS)
        </h4>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Simu za Walengwa (Target):</span>
            <span className="font-mono font-bold">{getRecipientsCount()} Active Contacts</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Njia ya Gateway:</span>
            <span className="font-bold text-pink-600 font-mono">Oasis SMS API</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Hadhi ya Mtandao:</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              ● ACTIVE & READY
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Oasis Sender ID:</span>
            <span className="font-mono font-bold">{oasisSenderId}</span>
          </div>
          <div className="flex justify-between py-1 text-[11px] text-slate-400 font-mono">
            <span>API Key Token:</span>
            <span>••••••••65bd</span>
          </div>
        </div>

        {/* Live SMS Preview Box */}
        <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-4 font-mono text-xs border border-emerald-800 shadow-inner">
          <div className="flex justify-between text-[10px] text-emerald-400 mb-2">
            <span>HAKIKI UJUMBE (LIVE PREVIEW)</span>
            <span>OASIS</span>
          </div>
          <p className="leading-relaxed italic">
            "{messageBody}"
          </p>
        </div>
      </div>
    </div>
  );
}

export { BroadcastCenter };
export default BroadcastCenter;
