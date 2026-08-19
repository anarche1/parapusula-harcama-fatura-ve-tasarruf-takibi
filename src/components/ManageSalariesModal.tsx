import React, { useState } from 'react';
import { X, Briefcase, Plus, Trash2, Calendar, DollarSign, Check, Clock } from 'lucide-react';
import { SalarySchedule, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ManageSalariesModalProps {
  isOpen: boolean;
  onClose: () => void;
  salaries: SalarySchedule[];
  currency: CurrencyCode;
  onSaveSalaries: (salaries: SalarySchedule[]) => void;
}

export const ManageSalariesModal: React.FC<ManageSalariesModalProps> = ({
  isOpen,
  onClose,
  salaries,
  currency,
  onSaveSalaries
}) => {
  const [items, setItems] = useState<SalarySchedule[]>(() => {
    if (salaries && salaries.length > 0) return salaries;
    return [
      {
        id: 'sal_1',
        title: '1. Maaş (Ana İş)',
        amount: 35000,
        dayOfMonth: 1,
        employerOrNote: 'Ana Şirket',
        autoLogIncome: true
      },
      {
        id: 'sal_2',
        title: '2. Maaş (Ek İş / Danışmanlık)',
        amount: 15000,
        dayOfMonth: 15,
        employerOrNote: 'Ek İş / Proje',
        autoLogIncome: true
      }
    ];
  });

  if (!isOpen) return null;

  const handleAddSalary = () => {
    const nextNum = items.length + 1;
    const newSalary: SalarySchedule = {
      id: 'sal_' + Date.now(),
      title: `${nextNum}. Maaş (Ek Gelir)`,
      amount: 10000,
      dayOfMonth: nextNum === 2 ? 15 : 20,
      employerOrNote: '',
      autoLogIncome: true
    };
    setItems([...items, newSalary]);
  };

  const handleRemove = (id: string) => {
    if (items.length <= 1) {
      alert('En az 1 maaş kaydı bulunmalıdır.');
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, field: keyof SalarySchedule, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSave = () => {
    onSaveSalaries(items);
    onClose();
  };

  const totalMonthlySalary = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Maaş Tarihleri & Çift Maaş Planı</h3>
              <p className="text-xs text-slate-400">1. ve 2. Maaş günlerinizi ve tutarlarınızı yapılandırın</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Info & Total Preview */}
          <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-xs text-indigo-200 font-medium">Toplam Beklenen Aylık Maaş:</span>
            </div>
            <span className="text-sm font-extrabold text-white">
              {formatCurrency(totalMonthlySalary, currency)}
            </span>
          </div>

          {/* Salary Items List */}
          <div className="space-y-3">
            {items.map((salary, index) => (
              <div
                key={salary.id}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {index === 0 ? '1. Maaş (Ana Gelir)' : index === 1 ? '2. Maaş (Ek Gelir)' : `${index + 1}. Maaş`}
                    </span>
                  </div>

                  {items.length > 1 && (
                    <button
                      onClick={() => handleRemove(salary.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer"
                      title="Bu maaşı sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Title */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Maaş Tanımı / Başlık</label>
                    <input
                      type="text"
                      value={salary.title}
                      onChange={(e) => handleChange(salary.id, 'title', e.target.value)}
                      placeholder="Örn: Ana İş Maaşı"
                      className="w-full bg-slate-900 text-white text-xs rounded-lg px-3 py-2 border border-slate-800 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  {/* Day of Month */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Maaş Günü (Her Ayın Kaçı?)
                    </label>
                    <select
                      value={salary.dayOfMonth}
                      onChange={(e) => handleChange(salary.id, 'dayOfMonth', parseInt(e.target.value, 10))}
                      className="w-full bg-slate-900 text-white text-xs rounded-lg px-3 py-2 border border-slate-800 focus:border-indigo-500 outline-none"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          Her ayın {day}. günü {day === 1 ? '(Ay Başı)' : day === 15 ? '(Ay Ortası)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Aylık Net Tutar ({currency})</label>
                    <input
                      type="number"
                      value={salary.amount}
                      onChange={(e) => handleChange(salary.id, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="35000"
                      className="w-full bg-slate-900 text-white text-xs rounded-lg px-3 py-2 border border-slate-800 focus:border-indigo-500 outline-none font-bold"
                    />
                  </div>

                  {/* Note/Employer */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Kurum / Açıklama</label>
                    <input
                      type="text"
                      value={salary.employerOrNote || ''}
                      onChange={(e) => handleChange(salary.id, 'employerOrNote', e.target.value)}
                      placeholder="Örn: X Holding / Proje B"
                      className="w-full bg-slate-900 text-white text-xs rounded-lg px-3 py-2 border border-slate-800 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Another Salary Button */}
          <button
            onClick={handleAddSalary}
            className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 text-indigo-400 hover:text-indigo-300 border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yeni Maaş / Ek Gelir Tarihi Ekle</span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Maaş Planını Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
