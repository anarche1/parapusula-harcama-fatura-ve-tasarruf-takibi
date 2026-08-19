import React from 'react';
import { Cloud, CloudCheck, Bell, Plus, Moon, Sun, Smartphone } from 'lucide-react';
import { CurrencyCode } from '../types';

interface HeaderProps {
  currency: CurrencyCode;
  theme?: 'light' | 'dark';
  isCloudSynced: boolean;
  isSyncing: boolean;
  onToggleTheme: () => void;
  onChangeCurrency: (c: CurrencyCode) => void;
  onOpenCloudSync: () => void;
  pendingBillsCount?: number;
  onNavigateToBills?: () => void;
  onOpenAddModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  theme,
  isCloudSynced,
  isSyncing,
  onToggleTheme,
  onChangeCurrency,
  onOpenCloudSync,
  pendingBillsCount = 0,
  onNavigateToBills,
  onOpenAddModal
}) => {
  const isDark = theme === 'dark' || true;

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand with Sophisticated Dark Style */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 tracking-tight">
            <span>S</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight uppercase text-indigo-400">
                ParaPusula
              </h1>
              <span className="text-xs font-normal text-slate-500 hidden md:inline italic">
                Sophisticated Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Kişisel Finans & Akıllı Bütçe Yönetimi</p>
          </div>
        </div>

        {/* Controls & Cloud Status */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Cloud Sync Status Pill */}
          <button
            id="btn-cloud-sync"
            onClick={onOpenCloudSync}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-900 hover:bg-slate-850 px-3 py-1.5 rounded-full border border-slate-800 transition cursor-pointer"
            title="Bulut Senkronizasyon Durumu"
          >
            <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : isCloudSynced ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="hidden sm:inline">
              {isSyncing ? 'Eşitleniyor...' : isCloudSynced ? 'Bulut Senkronizasyonu Aktif' : 'Buluta Bağlan'}
            </span>
          </button>

          {/* Currency Selector Pill */}
          <select
            id="currency-selector"
            value={currency}
            onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
            className="bg-slate-900 text-slate-300 text-xs font-semibold rounded-full px-3 py-1.5 border border-slate-800 outline-none hover:border-slate-700 transition cursor-pointer"
            title="Para Birimi"
          >
            <option value="TRY">₺ TRY</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
          </select>

          {/* Pending Bills Indicator */}
          {onNavigateToBills && (
            <button
              id="btn-bill-alerts"
              onClick={onNavigateToBills}
              className="relative p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800/80 transition"
              title="Fatura Bildirimleri"
            >
              <Bell className="w-4 h-4" />
              {pendingBillsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingBillsCount}
                </span>
              )}
            </button>
          )}

          {/* Theme Toggle */}
          <button
            id="btn-theme-toggle"
            onClick={onToggleTheme}
            className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition"
            title={theme === 'dark' ? 'Açık Mod' : 'Karanlık Mod'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Profile Badge */}
          <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 font-bold text-xs flex items-center justify-center shadow-xs">
            PP
          </div>
        </div>
      </div>
    </header>
  );
};
