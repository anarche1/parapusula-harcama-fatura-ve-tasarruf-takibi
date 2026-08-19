import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Category, PaymentMethod, Transaction, TransactionType } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAdd
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Market & Gıda');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('kredi_karti');
  const [tagsInput, setTagsInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!description.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onAdd({
      type,
      amount: parsedAmount,
      category,
      description: description.trim(),
      date,
      paymentMethod,
      tags
    });

    setAmount('');
    setDescription('');
    setTagsInput('');
    onClose();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Yeni İşlem Ekle</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const first = categories.find((c) => c.type === 'expense');
                if (first) setCategory(first.name);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Gider (- Harcama)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                const first = categories.find((c) => c.type === 'income');
                if (first) setCategory(first.name);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Gelir (+ Gelir/Maaş)</span>
            </button>
          </div>

          {/* Amount */}
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
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-base font-bold text-white focus:border-indigo-500 outline-none"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Açıklama*
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Market alışverişi, Kira, Benzin..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:border-indigo-500 outline-none"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Ödeme Yöntemi
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:border-indigo-500 outline-none"
              >
                <option value="kredi_karti">Kredi Kartı</option>
                <option value="nakit">Nakit</option>
                <option value="banka_karti">Banka / Maaş Kartı</option>
                <option value="havale_eft">Havale / EFT</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
          </div>

          {/* Date & Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Tarih
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Etiketler (Virgülle)
              </label>
              <input
                type="text"
                placeholder="zorunlu, tatil"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
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
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
