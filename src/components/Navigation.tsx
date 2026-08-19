import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  CalendarClock,
  Target,
  Sparkles,
  Settings
} from 'lucide-react';
import { NavTab } from '../types';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingBillsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingBillsCount
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Özet', fullLabel: 'Genel Özet', icon: LayoutDashboard },
    { id: 'transactions' as NavTab, label: 'Harcamalar', fullLabel: 'Gelir & Gider', icon: ReceiptText },
    {
      id: 'bills' as NavTab,
      label: 'Faturalar',
      fullLabel: 'Ödeme Hatırlatıcı',
      icon: CalendarClock,
      badge: pendingBillsCount > 0 ? pendingBillsCount : null
    },
    { id: 'savings' as NavTab, label: 'Tasarruf', fullLabel: 'Tasarruf & Hedefler', icon: Target },
    { id: 'aicoach' as NavTab, label: 'AI Koç', fullLabel: 'AI Finans Koçu', icon: Sparkles, isAi: true },
    { id: 'settings' as NavTab, label: 'Ayarlar', fullLabel: 'Bulut & Ayarlar', icon: Settings }
  ];

  return (
    <>
      {/* Desktop Navigation Tabs */}
      <nav id="desktop-nav" className="hidden md:block bg-slate-950/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-1.5 mb-6">
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer relative ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-xs shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.fullLabel}</span>
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full">
                    {tab.badge}
                  </span>
                )}
                {tab.isAi && (
                  <span className="ml-1 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Android-Style Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 pb-safe px-2 py-1.5 shadow-2xl"
      >
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl relative transition-all duration-150 ${
                  isActive
                    ? 'text-indigo-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2px] text-indigo-400' : 'stroke-[1.8px]'}`} />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
