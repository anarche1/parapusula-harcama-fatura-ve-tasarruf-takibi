import React, { useState } from 'react';
import { X, Cloud, ArrowUp, ArrowDown, Copy, Check, ShieldCheck, Smartphone } from 'lucide-react';
import { AppDataState } from '../types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncKey: string;
  onPushToCloud: () => Promise<void>;
  onPullFromCloud: (key: string) => Promise<void>;
  lastSyncedAt?: string;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  syncKey,
  onPushToCloud,
  onPullFromCloud,
  lastSyncedAt
}) => {
  const [inputKey, setInputKey] = useState(syncKey);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(syncKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePush = async () => {
    setIsPushing(true);
    setStatusMsg(null);
    try {
      await onPushToCloud();
      setStatusMsg('Verileriniz buluta başarıyla yüklendi.');
    } catch (e: any) {
      setStatusMsg('Buluta yüklenirken hata oluştu.');
    } finally {
      setIsPushing(false);
    }
  };

  const handlePull = async () => {
    if (!inputKey.trim()) return;
    setIsPulling(true);
    setStatusMsg(null);
    try {
      await onPullFromCloud(inputKey.trim());
      setStatusMsg('Buluttaki veriler başarıyla indirildi ve eşitlendi.');
    } catch (e: any) {
      setStatusMsg('Buluttan veri çekilemedi.');
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-400" />
            <span>Bulut Senkronizasyonu (Cloud Sync)</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mt-4 text-xs">
          <p className="text-slate-400 leading-relaxed">
            Bu cihazdaki harcama, fatura ve tasarruf verilerinizi diğer Android telefonunuza veya bilgisayarınıza taşımak için ortak <b>Sync Key</b> kullanın.
          </p>

          {/* Current Sync Key */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
              Bu Cihazın Eşleşme Anahtarı (Sync Key)
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-indigo-300 text-sm">{syncKey}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 bg-slate-900 border border-slate-800 hover:text-white px-2.5 py-1 rounded-lg transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
          </div>

          {/* Sync Actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handlePush}
              disabled={isPushing || isPulling}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition disabled:opacity-50 cursor-pointer"
            >
              <ArrowUp className="w-5 h-5 text-indigo-400 mb-1" />
              <span className="font-bold text-white">Buluta Yükle</span>
              <span className="text-[10px] text-slate-500">Bu cihazı buluta gönder</span>
            </button>

            <button
              onClick={handlePull}
              disabled={isPushing || isPulling}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition disabled:opacity-50 cursor-pointer"
            >
              <ArrowDown className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="font-bold text-white">Buluttan İndir</span>
              <span className="text-[10px] text-slate-500">Bulut verisini çek</span>
            </button>
          </div>

          {/* Pull other device key */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <label className="block text-[11px] font-medium text-slate-400">
              Başka Cihazın Anahtarıyla Eşleştir:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Örn: SYNC-ABC123"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:border-indigo-500 outline-none"
              />
              <button
                onClick={handlePull}
                disabled={isPulling || !inputKey.trim()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition"
              >
                Eşle
              </button>
            </div>
          </div>

          {statusMsg && (
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-center font-medium">
              {statusMsg}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit şifreleme ve güvenli bulut senkronizasyonu</span>
          </div>
        </div>
      </div>
    </div>
  );
};
