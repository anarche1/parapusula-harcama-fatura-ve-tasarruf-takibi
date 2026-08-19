import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { SavingsGoal } from '../types';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<SavingsGoal, 'id' | 'isCompleted' | 'deposits' | 'createdAt'>) => void;
}

const PRESET_COLORS = ['#6366F1', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B', '#F43F5E'];

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Güvence');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount);
    if (isNaN(parsedTarget) || parsedTarget <= 0) return;
    if (!title.trim()) return;

    const parsedInitial = parseFloat(initialAmount) || 0;

    onAdd({
      title: title.trim(),
      targetAmount: parsedTarget,
      currentAmount: parsedInitial,
      deadline: deadline || undefined,
      category,
      icon: 'Target',
      color,
      notes: notes.trim() || undefined
    });

    setTitle('');
    setTargetAmount('');
    setInitialAmount('');
    setDeadline('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Yeni Tasarruf Hedefi</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Hedef Başlığı*
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Acil Durum Fonu, Tatil, Yeni Telefon..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Hedef Tutar (₺)*
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Mevcut Birikim (₺)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Hedef Tarihi (Opsiyonel)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:border-indigo-500 outline-none"
              >
                <option value="Güvence">Güvence / Acil Durum</option>
                <option value="Tatil">Tatil & Gezi</option>
                <option value="Teknoloji">Elektronik & Araç</option>
                <option value="Eğitim">Eğitim & Kişisel</option>
                <option value="Yatırım">Yatırım & Gelecek</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Tema Rengi
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition cursor-pointer ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Notlar
            </label>
            <input
              type="text"
              placeholder="Örn: Yüksek faizli vadeli hesapta biriktirilecek"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              Hedefi Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
