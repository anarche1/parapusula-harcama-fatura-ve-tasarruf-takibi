import React, { useState } from 'react';
import {
  Cloud,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Smartphone,
  Check,
  Copy,
  Moon,
  Sun,
  KeyRound,
  Trash2
} from 'lucide-react';
import { AppDataState, CurrencyCode, UserSettings } from '../types';
import { exportDataAsJSON } from '../utils/storage';

interface SettingsViewProps {
  appData: AppDataState;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetData: () => void;
  onImportData: (data: AppDataState) => void;
  onOpenSyncModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  appData,
  onUpdateSettings,
  onResetData,
  onImportData,
  onOpenSyncModal
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(appData.settings.syncKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.transactions && parsed.bills && parsed.goals) {
            onImportData(parsed);
            alert('Yedek başarıyla yüklendi!');
          } else {
            alert('Geçersiz dosya formatı.');
          }
        } catch (err) {
          alert('Dosya okunurken bir hata oluştu.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Ayarlar & Bulut Senkronizasyonu</h2>
        <p className="text-xs text-slate-400">Veri güvenliği, cihaz senkronizasyonu ve uygulama tercihleri</p>
      </div>

      {/* Cloud Sync Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Güvenli Bulut Senkronizasyonu</h3>
              <p className="text-xs text-slate-400">Android ve masaüstü cihazlarınız arasında şifreli veri aktarımı</p>
            </div>
          </div>
          <button
            onClick={onOpenSyncModal}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Senkronize Et
          </button>
        </div>

        {/* Sync Key Box */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Cihaz Senkronizasyon Anahtarı (Sync Key)</span>
            <span className="text-xs font-mono font-bold text-indigo-300">{appData.settings.syncKey}</span>
          </div>
          <button
            onClick={handleCopyKey}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg transition"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? 'Kopyalandı' : 'Kopyala'}</span>
          </button>
        </div>
      </div>

      {/* Preferences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Currency & Financial Targets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Finansal Tercihler & Hedefler</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Para Birimi</label>
              <select
                value={appData.settings.currency}
                onChange={(e) => onUpdateSettings({ currency: e.target.value as CurrencyCode })}
                className="w-full bg-slate-950 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-800 outline-none"
              >
                <option value="TRY">Türk Lirası (₺ TRY)</option>
                <option value="USD">Amerikan Doları ($ USD)</option>
                <option value="EUR">Euro (€ EUR)</option>
                <option value="GBP">İngiliz Sterlini (£ GBP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Aylık Hedef Gelir</label>
              <input
                type="number"
                value={appData.settings.monthlyIncomeGoal}
                onChange={(e) => onUpdateSettings({ monthlyIncomeGoal: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Aylık Tasarruf Hedefi</label>
              <input
                type="number"
                value={appData.settings.savingsMonthlyTarget}
                onChange={(e) => onUpdateSettings({ savingsMonthlyTarget: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-800 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Backup & Data Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Veri Yedekleme & İçe/Dışa Aktarma</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Verilerinizi istediğiniz zaman bilgisayarınıza veya telefonunuza JSON dosyası olarak indirebilirsiniz.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => exportDataAsJSON(appData)}
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-slate-950 hover:bg-slate-850 text-slate-200 rounded-xl border border-slate-800 text-xs font-semibold transition"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>JSON Olarak Yedek İndir</span>
              </button>

              <label className="w-full flex items-center justify-center gap-2 p-2.5 bg-slate-950 hover:bg-slate-850 text-slate-200 rounded-xl border border-slate-800 text-xs font-semibold transition cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Yedek Dosyası Yükle</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-3 border-t border-slate-800">
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onResetData();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                >
                  Tüm Verileri Sıfırla
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  İptal
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Uygulama Verilerini Varsayılana Sıfırla</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
