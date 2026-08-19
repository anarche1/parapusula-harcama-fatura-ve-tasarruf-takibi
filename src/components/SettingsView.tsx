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
  Briefcase,
  Sliders,
  Calendar,
  DollarSign,
  Plus
} from 'lucide-react';
import { AppDataState, CurrencyCode, UserSettings, SalarySchedule } from '../types';
import { exportDataAsJSON } from '../utils/storage';
import { formatCurrency } from '../utils/formatters';

interface SettingsViewProps {
  appData: AppDataState;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetData: () => void;
  onImportData: (data: AppDataState) => void;
  onOpenSyncModal: () => void;
  onOpenManageSalaries: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  appData,
  onUpdateSettings,
  onResetData,
  onImportData,
  onOpenSyncModal,
  onOpenManageSalaries
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-p76v5wmvoudvd5pubair3o-202163088218.europe-west2.run.app';

  const salaries: SalarySchedule[] = appData.settings.salaries || [
    {
      id: 'sal_1',
      title: '1. Maaş (Ana İş)',
      amount: 38000,
      dayOfMonth: 1,
      employerOrNote: 'Ana Şirket Bordro',
      autoLogIncome: true
    },
    {
      id: 'sal_2',
      title: '2. Maaş (Ek İş / Danışmanlık)',
      amount: 17000,
      dayOfMonth: 15,
      employerOrNote: 'Bilişim & Danışmanlık',
      autoLogIncome: true
    }
  ];

  const totalSalaries = salaries.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(appData.settings.syncKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
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
        <h2 className="text-xl font-bold text-white tracking-tight">Ayarlar & Maaş Planı</h2>
        <p className="text-xs text-slate-400">Çift maaş günleri, Android kurulumu, bulut senkronizasyonu ve tercihler</p>
      </div>

      {/* DUAL SALARY MANAGEMENT CARD (ÇİFT MAAŞ YÖNETİMİ) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Maaş Tarihleri & Çift Maaş Yapılandırması</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {salaries.length} Maaş Tanımlı
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                1. ve 2. maaş günlerinizi, tutarlarınızı ve kurum bilgilerinizi belirleyin
              </p>
            </div>
          </div>

          <button
            onClick={onOpenManageSalaries}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Maaş Günlerini Düzenle</span>
          </button>
        </div>

        {/* Salaries Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {salaries.map((sal, idx) => (
            <div
              key={sal.id}
              className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">{sal.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    Her ayın <b>{sal.dayOfMonth}. günü</b> {sal.employerOrNote ? `• ${sal.employerOrNote}` : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-emerald-400">
                  {formatCurrency(sal.amount, appData.settings.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
          <span>Aylık Toplam Net Maaş Geliri:</span>
          <span className="font-bold text-white text-sm">
            {formatCurrency(totalSalaries, appData.settings.currency)}
          </span>
        </div>
      </div>

      {/* ANDROID TELEFONA YÜKLEME & APK REHBERİ CARD */}
      <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Android Telefonda Kullanma & APK Rehberi</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Android Uyumlu
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Uygulama tam teşekküllü bir PWA / WebAPK altyapısına sahiptir. İki kolay yöntemle telefonunuza kurabilirsiniz:
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyUrl}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0 shadow-md shadow-indigo-600/20"
          >
            {copiedUrl ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copiedUrl ? 'Uygulama Linki Kopyalandı' : 'Uygulama Linkini Kopyala'}</span>
          </button>
        </div>

        {/* 2 Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Method 1: Instant PWA Install */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h4 className="text-xs font-bold text-white">1. Yöntem: Telefona Doğrudan Yükle (Önerilen)</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Google Chrome veya Samsung Internet ile bu adrese girin:
            </p>
            <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <li>Android telefonunuzda Chrome ile uygulama linkini açın.</li>
              <li>Sağ üstteki <b>üç nokta (⋮)</b> menüsüne dokunun.</li>
              <li><b>"Uygulamayı Yükle"</b> veya <b>"Ana Ekrana Ekle"</b> seçeneğine basın.</li>
              <li>Uygulama telefonunuza bağımsız bir uygulama ikonu olarak yüklenir ve tam ekran çalışır.</li>
            </ol>
          </div>

          {/* Method 2: Generate Signed APK via PWABuilder */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h4 className="text-xs font-bold text-white">2. Yöntem: .APK Dosyası İndirme</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Resmi <b>.apk</b> paketi oluşturmak için PWABuilder kullanabilirsiniz:
            </p>
            <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <li>Uygulama linkinizi kopyalayın.</li>
              <li><b>PWABuilder.com</b> sitesini açıp linki yapıştırın.</li>
              <li><b>"Package for Android"</b> butonuna basarak imzalı APK veya AAB dosyanızı indirin.</li>
              <li>İndirdiğiniz APK'yı Android telefonunuza kurun.</li>
            </ol>
          </div>
        </div>
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
                className="w-full flex items-center justify-center gap-2 p-2.5 bg-slate-950 hover:bg-slate-850 text-slate-200 rounded-xl border border-slate-800 text-xs font-semibold transition cursor-pointer"
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
                className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition cursor-pointer"
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
