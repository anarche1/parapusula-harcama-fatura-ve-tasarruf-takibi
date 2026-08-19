import React, { useState } from 'react';
import { X, Calendar, Bell } from 'lucide-react';
import { BillReminder, Category, RecurrenceType } from '../types';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (bill: Omit<BillReminder, 'id' | 'isPaid' | 'paidDate'>) => void;
}

export const AddBillModal: React.FC<AddBillModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAdd
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Faturalar & Abonelikler');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('monthly');
  const [autoLogExpense, setAutoLogExpense] = useState(true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!title.trim() || !dueDate) return;

    onAdd({
      title: title.trim(),
      amount: parsedAmount,
      category,
      dueDate,
      recurrence,
      autoLogExpense,
      reminderDaysBefore,
      notes: notes.trim()
    });

    setTitle('');
    setAmount('');
    setDueDate('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <span>Fatura & Düzenli Ödeme Ekle</span>
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
              Fatura / Ödeme Adı*
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Ev Kirası, Doğalgaz Faturası, Netflix..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tutar (₺)*
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:border-indigo-500 outline-none"
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
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Son Ödeme Tarihi*
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tekrar Periyodu
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:border-indigo-500 outline-none"
              >
                <option value="monthly">Her Ay (Aylık)</option>
                <option value="weekly">Her Hafta</option>
                <option value="yearly">Yılda Bir</option>
                <option value="once">Tek Seferlik</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Notlar / Açıklama
            </label>
            <input
              type="text"
              placeholder="Örn: Otomatik ödemede değil, IBAN'a havale"
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
              Faturayı Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
