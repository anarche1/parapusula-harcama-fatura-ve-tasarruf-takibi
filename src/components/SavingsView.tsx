import React, { useState } from 'react';
import {
  Target,
  Plus,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Trash2,
  Coffee,
  ShoppingBag,
  Zap,
  Flame
} from 'lucide-react';
import { SavingsGoal, CurrencyCode } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface SavingsViewProps {
  goals: SavingsGoal[];
  currency: CurrencyCode;
  onAddGoal: () => void;
  onDepositToGoal: (goalId: string, amount: number, note?: string) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  goals,
  currency,
  onAddGoal,
  onDepositToGoal,
  onDeleteGoal
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositNote, setDepositNote] = useState<string>('');
  const [celebrateGoal, setCelebrateGoal] = useState<string | null>(null);

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (selectedGoalId && amt > 0) {
      const goal = goals.find((g) => g.id === selectedGoalId);
      onDepositToGoal(selectedGoalId, amt, depositNote);

      if (goal && goal.currentAmount + amt >= goal.targetAmount) {
        setCelebrateGoal(goal.title);
        setTimeout(() => setCelebrateGoal(null), 4000);
      }

      setDepositAmount('');
      setDepositNote('');
      setSelectedGoalId(null);
    }
  };

  const handleQuickChallenge = (amount: number, challengeName: string) => {
    if (goals.length === 0) return;
    const targetGoal = goals.find((g) => !g.isCompleted) || goals[0];
    onDepositToGoal(targetGoal.id, amount, `Meydan Okuma: ${challengeName}`);
    setCelebrateGoal(`Tebrikler! ${challengeName} ile ${formatCurrency(amount, currency)} biriktirdin!`);
    setTimeout(() => setCelebrateGoal(null), 3500);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Celebration Alert */}
      {celebrateGoal && (
        <div className="p-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-white flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-indigo-400" />
            <div>
              <p className="font-bold text-sm">Harika Bir Başarı!</p>
              <p className="text-xs text-indigo-200">{celebrateGoal}</p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-indigo-300" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Tasarruf & Birikim Hedefleri</h2>
          <p className="text-xs text-slate-400">Hayallerinize ve acil durum fonunuza adım adım ulaşın</p>
        </div>

        <button
          id="btn-add-goal-main"
          onClick={onAddGoal}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Hedef Oluştur</span>
        </button>
      </div>

      {/* Overall Progress Banner in Sophisticated Indigo */}
      <div className="bg-indigo-950/70 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                Toplam Birikim Durumu
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {formatCurrency(totalSaved, currency)}
                <span className="text-xs font-medium text-indigo-300 ml-2">
                  / {formatCurrency(totalTarget, currency)} Hedef
                </span>
              </h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-indigo-300">%{overallProgress}</span>
              <p className="text-[11px] text-indigo-200">Genel İlerleme</p>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-950/80 rounded-full overflow-hidden border border-indigo-800/60">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
        </div>

        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Gamified Challenges */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-slate-200 text-sm">Günün Hızlı Tasarruf Meydan Okumaları</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Gereksiz bir harcamayı yapmadınız mı? Tek tıkla birikim hedefinize aktarın ve tasarrufunuzu büyütün:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleQuickChallenge(80, 'Kahveyi Evde Demleme')}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Kahveyi Evde Demledim</p>
                <p className="text-[10px] text-slate-500">Dışarıdan kahve almadım</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 group-hover:scale-105 transition">
              +{formatCurrency(80, currency)}
            </span>
          </button>

          <button
            onClick={() => handleQuickChallenge(150, 'Yemek Siparişi Yerine Ev Yemeği')}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Evde Yemek Pişirdim</p>
                <p className="text-[10px] text-slate-500">Kurye siparişini iptal ettim</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 group-hover:scale-105 transition">
              +{formatCurrency(150, currency)}
            </span>
          </button>

          <button
            onClick={() => handleQuickChallenge(300, 'Abonelik / Gereksiz Harcama İptali')}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Kullanılmayan Abonelik</p>
                <p className="text-[10px] text-slate-500">Gereksiz üyeliği kapattım</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 group-hover:scale-105 transition">
              +{formatCurrency(300, currency)}
            </span>
          </button>
        </div>
      </div>

      {/* Deposit Modal / Form Bar if Goal Selected */}
      {selectedGoalId && (
        <div className="bg-slate-900 border border-indigo-500/40 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Hedefe Para Aktar: {goals.find((g) => g.id === selectedGoalId)?.title}</span>
            </h4>
            <button
              onClick={() => setSelectedGoalId(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Vazgeç
            </button>
          </div>

          <form onSubmit={handleDepositSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Eklenecek Tutar</label>
              <input
                type="number"
                step="0.01"
                placeholder="Örn: 2500"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 text-white rounded-xl border border-slate-800 text-xs focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Açıklama / Not</label>
              <input
                type="text"
                placeholder="Örn: Maaş birikimi"
                value={depositNote}
                onChange={(e) => setDepositNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 text-white rounded-xl border border-slate-800 text-xs focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/20"
              >
                Aktarımı Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isDone = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 ${
                isDone ? 'border-emerald-500/40' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: goal.color || '#6366F1' }}
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white truncate max-w-[160px]">{goal.title}</h4>
                      <span className="text-[10px] text-slate-400">{goal.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="text-slate-600 hover:text-rose-400 p-1 transition"
                    title="Hedefi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Amount info */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Biriken / Hedef:</span>
                    <span className="font-bold text-white">
                      {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: goal.color || '#6366F1'
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>%{pct} tamamlandı</span>
                    {goal.deadline && <span>Hedef: {formatDate(goal.deadline)}</span>}
                  </div>
                </div>

                {goal.notes && (
                  <p className="text-xs text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-850 line-clamp-2 mb-3">
                    {goal.notes}
                  </p>
                )}
              </div>

              {/* Deposit Action */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {goal.deposits?.length || 0} para aktarımı
                </span>
                <button
                  onClick={() => setSelectedGoalId(goal.id)}
                  className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/40 transition cursor-pointer"
                >
                  + Para Ekle
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
