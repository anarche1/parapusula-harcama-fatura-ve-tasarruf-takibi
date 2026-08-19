import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Clock,
  Bell,
  Trash2,
  Calendar
} from 'lucide-react';
import { BillReminder, CurrencyCode } from '../types';
import { formatCurrency, formatDate, getDaysRemaining } from '../utils/formatters';

interface BillsViewProps {
  bills: BillReminder[];
  currency: CurrencyCode;
  onAddBill: () => void;
  onTogglePaid: (billId: string) => void;
  onDeleteBill: (billId: string) => void;
}

export const BillsView: React.FC<BillsViewProps> = ({
  bills,
  currency,
  onAddBill,
  onTogglePaid,
  onDeleteBill
}) => {
  const [filter, setFilter] = useState<'pending' | 'paid' | 'all'>('pending');
  const [notificationGranted, setNotificationGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const handleRequestNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationGranted(true);
        new Notification('ParaPusula Ödeme Bildirimleri Aktif!', {
          body: 'Yaklaşan faturalarınız ve ödemeleriniz günü geldiğinde hatırlatılacaktır.'
        });
      }
    }
  };

  const pendingBills = bills.filter((b) => !b.isPaid);
  const paidBills = bills.filter((b) => b.isPaid);

  const totalPendingAmount = pendingBills.reduce((s, b) => s + b.amount, 0);
  const totalPaidAmount = paidBills.reduce((s, b) => s + b.amount, 0);

  const displayedBills = bills
    .filter((b) => {
      if (filter === 'pending') return !b.isPaid;
      if (filter === 'paid') return b.isPaid;
      return true;
    })
    .sort((a, b) => {
      if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <span>Ödeme & Fatura Hatırlatıcıları</span>
            {pendingBills.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {pendingBills.length} Kritik
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">
            Kira, kredi kartı, abonelik ve fatura son ödeme günlerini asla kaçırmayın
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!notificationGranted && (
            <button
              onClick={handleRequestNotification}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-indigo-300 border border-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-850 transition"
              title="Mobil Bildirimleri Aç"
            >
              <Bell className="w-3.5 h-3.5 text-indigo-400" />
              <span>Bildirimleri Aç</span>
            </button>
          )}
          <button
            id="btn-add-bill-main"
            onClick={onAddBill}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Fatura Ekle</span>
          </button>
        </div>
      </div>

      {/* 2 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Bekleyen Ödemeler</p>
            <h3 className="text-2xl font-bold text-rose-400">
              {formatCurrency(totalPendingAmount, currency)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {pendingBills.length} adet ödenmemiş fatura var
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tamamlanan Ödemeler</p>
            <h3 className="text-2xl font-bold text-emerald-400">
              {formatCurrency(totalPaidAmount, currency)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {paidBills.length} adet fatura ödendi
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilter('pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            filter === 'pending'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Bekleyenler ({pendingBills.length})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            filter === 'paid'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Ödenenler ({paidBills.length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Tümü ({bills.length})
        </button>
      </div>

      {/* Bill List */}
      <div className="space-y-3">
        {displayedBills.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl p-10 text-center border border-slate-800 space-y-2">
            <CalendarClock className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">Bu filtrede herhangi bir fatura bulunmuyor.</p>
            <p className="text-xs text-slate-500">Yeni bir fatura veya düzenli ödeme ekleyerek takibe başlayın.</p>
          </div>
        ) : (
          displayedBills.map((bill) => {
            const remaining = getDaysRemaining(bill.dueDate);
            const recurrenceLabel = {
              monthly: 'Aylık',
              weekly: 'Haftalık',
              yearly: 'Yıllık',
              once: 'Tek Sefer'
            }[bill.recurrence];

            return (
              <div
                key={bill.id}
                className={`p-4 rounded-2xl border transition-all duration-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  bill.isPaid
                    ? 'bg-slate-900/60 border-slate-800/80 opacity-60'
                    : remaining.isOverdue
                    ? 'bg-slate-900 border-rose-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => onTogglePaid(bill.id)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition cursor-pointer ${
                      bill.isPaid
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'border border-slate-700 text-slate-600 hover:border-indigo-500 hover:text-indigo-400'
                    }`}
                    title={bill.isPaid ? 'Ödenmedi olarak işaretle' : 'Ödendi olarak işaretle'}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-medium truncate ${bill.isPaid ? 'line-through text-slate-500' : 'text-white'}`}>
                        {bill.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 text-slate-400 border border-slate-800">
                        {recurrenceLabel}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>{bill.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Son Gün: {formatDate(bill.dueDate)}
                      </span>
                      {!bill.isPaid && (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          remaining.isOverdue
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : remaining.days <= 3
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}>
                          {remaining.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <p className={`text-base font-bold ${bill.isPaid ? 'text-slate-500' : 'text-rose-400'}`}>
                      {formatCurrency(bill.amount, currency)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onTogglePaid(bill.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                        bill.isPaid
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                      }`}
                    >
                      {bill.isPaid ? 'Geri Al' : 'Ödendi'}
                    </button>

                    <button
                      onClick={() => onDeleteBill(bill.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
