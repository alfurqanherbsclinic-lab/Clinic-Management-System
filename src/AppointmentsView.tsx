import React, { useState } from "react";
import { Calendar, UserCheck, MessageSquareCode, Clock, Plus, Trash2, CheckCircle2, ShieldCheck } from "lucide-react";
import { Patient, Appointment } from "../types";

interface AppointmentsViewProps {
  patients: Patient[];
  appointments: Appointment[];
  onAddAppointment: (newApt: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onUpdateStatus: (id: string, status: Appointment["status"]) => void;
}

export default function AppointmentsView({ 
  patients, 
  appointments, 
  onAddAppointment, 
  onDeleteAppointment,
  onUpdateStatus
}: AppointmentsViewProps) {
  const [patientId, setPatientId] = useState(patients[0]?.id || "");
  const [doctorName, setDoctorName] = useState("Dr. Abdu Khalifa Rehani");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00 AM");

  const [reminderPatient, setReminderPatient] = useState<Appointment | null>(null);
  const [smsTemplate, setSmsTemplate] = useState("");

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === patientId);
    if (!pat) return;

    // Automatic queue number calculation for today
    const todayAppointments = appointments.filter(a => a.date === date);
    const queueNumber = todayAppointments.length + 1;

    const newApt: Appointment = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      patientId,
      patientName: pat.name,
      patientPhone: pat.phone,
      doctorName,
      date,
      time,
      queueNumber,
      status: "Scheduled"
    };

    onAddAppointment(newApt);
    alert(`Miadi ya ${pat.name} imeratibiwa! Namba ya msururu ni Q-${queueNumber}.`);
  };

  const handleGenerateReminder = (apt: Appointment) => {
    setReminderPatient(apt);
    setSmsTemplate(
      `Habari ${apt.patientName}, hili ni dokezo kutoka Al-Furqan Herb's Clinic. Una miadi na ${apt.doctorName} mnamo tarehe ${apt.date} saa ${apt.time}. Namba yako ya msururu leo ni Q-${apt.queueNumber}. Karibu sana!`
    );
  };

  const handleSendReminder = (method: "SMS" | "WhatsApp") => {
    if (!reminderPatient) return;
    alert(`Kikumbusho kimetumwa kikamilifu kwa ${reminderPatient.patientName} kupitia ${method}!`);
    setReminderPatient(null);
  };

  return (
    <div className="p-6 space-y-6">
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Appointments table scheduler */}
        <div className="xl:col-span-2 bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-primary/20 pb-3">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary animate-pulse" />
              Sajili & Ratiba ya Miadi (Appointments Calendar Schedule)
            </h3>
            <span className="bg-primary text-white text-xs px-2.5 py-0.5 rounded font-mono font-bold">
              Total {appointments.length} Miadi
            </span>
          </div>

          <div className="table-responsive">
            <table className="text-left w-full text-xs font-semibold">
              <thead>
                <tr>
                  <th className="p-3">Msururu #</th>
                  <th className="p-3">Mgonjwa</th>
                  <th className="p-3">Daktari</th>
                  <th className="p-3">Tarehe & Saa</th>
                  <th className="p-3">Hali (Status)</th>
                  <th className="p-3">Zana (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-light-bg/50">
                    <td className="p-3 font-mono font-bold text-secondary">
                      Q-{apt.queueNumber < 10 ? "0" : ""}{apt.queueNumber}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-primary uppercase">{apt.patientName}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{apt.patientPhone}</div>
                    </td>
                    <td className="p-3 text-gray-600">{apt.doctorName}</td>
                    <td className="p-3 text-primary">
                      <div>{apt.date}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">{apt.time}</div>
                    </td>
                    <td className="p-3">
                      <select
                        value={apt.status}
                        onChange={(e) => onUpdateStatus(apt.id, e.target.value as Appointment["status"])}
                        className="p-1 border border-primary rounded bg-white text-[11px] font-bold text-primary"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Consultation">Consultation</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleGenerateReminder(apt)}
                          className="px-2 py-1 bg-secondary text-white font-bold rounded text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <MessageSquareCode className="w-3 h-3" />
                          Remind
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Je, una uhakika unataka kufuta miadi hii?")) {
                              onDeleteAppointment(apt.id);
                            }
                          }}
                          className="p-1 bg-gray-200 text-primary hover:bg-secondary hover:text-white rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: New Appointment booking and Reminder simulation */}
        <div className="space-y-4">
          
          <div className="bg-white p-5 rounded-xl border-2 border-primary shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display uppercase tracking-wider border-b-2 border-secondary pb-2">
              Panga Miadi Mpya (Book Appointment)
            </h3>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-primary mb-1">Mgonjwa *</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                  required
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.cardNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-primary mb-1">Chagua Daktari Bingwa</label>
                <select
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="Dr. Abdu Khalifa Rehani">Dr. Abdu Khalifa Rehani (Sunnah Specialist)</option>
                  <option value="Dr. Khalifa Rehani">Dr. Khalifa Rehani (EMR Specialist)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">Tarehe ya Miadi</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-primary mb-1">Muda (Time Slot)</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="p-2.5 border-2 border-primary rounded-lg text-xs font-semibold bg-white"
                  >
                    <option>08:00 AM</option>
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>02:00 PM</option>
                    <option>03:00 PM</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-secondary hover:bg-primary border-2 border-secondary hover:border-primary text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" />
                Hifadhi na Toa Namba ya Msururu
              </button>
            </form>
          </div>

          {/* SMS / WhatsApp Reminder Simulator Panel */}
          {reminderPatient && (
            <div className="bg-emerald-50 border-2 border-emerald-500 p-5 rounded-xl text-xs space-y-3.5">
              <h4 className="font-extrabold text-emerald-900 uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 animate-bounce" />
                Dokezo la Kikumbusho (SMS/WA Dispatcher)
              </h4>
              <p className="font-medium text-gray-700">Mgonjwa: <span className="font-bold">{reminderPatient.patientName}</span></p>
              
              <textarea
                value={smsTemplate}
                onChange={(e) => setSmsTemplate(e.target.value)}
                rows={4}
                className="w-full p-2 border-2 border-emerald-300 rounded bg-white text-[11px] font-semibold text-gray-800"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleSendReminder("SMS")}
                  className="w-1/2 p-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded cursor-pointer text-center text-[10px]"
                >
                  Tuma kama SMS ya Simu
                </button>
                <button
                  onClick={() => handleSendReminder("WhatsApp")}
                  className="w-1/2 p-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded cursor-pointer text-center text-[10px]"
                >
                  Tuma kama WhatsApp
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
