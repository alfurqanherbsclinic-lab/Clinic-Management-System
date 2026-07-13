import React, { useState, useEffect } from "react";
import { Menu, Bell, Clock, LogOut, Calendar, ShieldCheck, User } from "lucide-react";

interface HeaderProps {
  pageTitle: string;
  onMenuToggle: () => void;
  username: string;
  userRole: string;
  onLogout: () => void;
  sessionTimeRemaining: number;
}

export default function Header({ pageTitle, onMenuToggle, username, userRole, onLogout, sessionTimeRemaining }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const notifications = [
    { id: 1, text: "Stoki ya Unga wa Uwatu ipo chini ya kiwango!", type: "alert" },
    { id: 2, text: "Mgonjwa mpya (Fatma) amepimwa CBC na matokeo yapo tayari.", type: "info" },
    { id: 3, text: "Kuhifadhi Taarifa (Auto-Backup) imekamilika kikamilifu leo.", type: "success" }
  ];

  // Helper to format remaining time
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <header className="bg-white border-b-3 border-primary px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Toggle Button for Mobile Navigation */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-light-bg rounded-lg text-primary transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Page Title */}
        <div className="title-area">
          <h2 className="text-xl lg:text-2xl font-bold font-display text-primary tracking-tight uppercase">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Right side widgets */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Live Clock Widget */}
        <div className="hidden md:flex items-center gap-2 bg-light-bg border border-primary/20 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-primary">
          <Clock className="w-4 h-4 text-secondary" />
          <span>{time.toLocaleTimeString()}</span>
        </div>

        {/* Date Widget */}
        <div className="hidden sm:flex items-center gap-2 bg-light-bg border border-primary/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-primary">
          <Calendar className="w-4 h-4 text-secondary" />
          <span>{time.toLocaleDateString("sw-TZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>

        {/* Auto Logout Countdown Indicator */}
        <div className="hidden xs:flex items-center gap-1.5 bg-secondary/5 border border-secondary/20 px-3 py-1.5 rounded-lg text-xs font-bold text-secondary">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="font-mono">Timeout: {formatTimeRemaining(sessionTimeRemaining)}</span>
        </div>

        {/* Notifications Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2.5 bg-light-bg hover:bg-gray-200 border border-primary/20 rounded-lg text-primary transition-colors cursor-pointer relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border-2 border-primary rounded-xl shadow-2xl z-50 overflow-hidden py-1">
              <div className="bg-primary text-white text-xs font-bold font-display uppercase tracking-wider px-4 py-2.5 flex justify-between items-center">
                <span>Arifa za Kliniki</span>
                <span className="bg-secondary text-[10px] px-1.5 py-0.5 rounded">3 Mpya</span>
              </div>
              <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <li key={notif.id} className="p-3 hover:bg-light-bg transition-colors">
                    <p className="text-xs text-primary font-semibold leading-relaxed">
                      {notif.text}
                    </p>
                    <span className="text-[9px] text-secondary font-mono block mt-1">Sasa hivi</span>
                  </li>
                ))}
              </ul>
              <div className="bg-light-bg text-center py-2 border-t border-gray-100">
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] text-primary hover:text-secondary font-bold"
                >
                  Funga Dirisha
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge & Quick Logout */}
        <div className="flex items-center gap-3 pl-2 border-l-2 border-gray-100">
          <div className="hidden lg:block text-right">
            <h4 className="text-xs font-bold text-primary tracking-tight">{username || "Abdu Khalifa Rehani"}</h4>
            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block -mt-0.5">
              {userRole || "Msimamizi Mkuu"}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="p-2.5 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white rounded-lg transition-all cursor-pointer"
            title="Toka kwenye Mfumo (Logout)"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
