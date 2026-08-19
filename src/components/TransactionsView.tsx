import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Download
} from 'lucide-react';
import { Transaction, Category, CurrencyCode, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyCode;
  onAddTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  currency,
  onAddTransaction,
  onDeleteTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'last_month' | 'last_7_days'>('this_month');

  // Filter logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter((tx) => {
      // 1. Search term
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(term);
        const matchesCat = tx.category.toLowerCase().includes(term);
        const matchesTag = tx.tags?.some((t) => t.toLowerCase().includes(term));
        if (!matchesDesc && !matchesCat && !matchesTag) return false;
      }

      // 2. Type
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }

      // 3. Category
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // 4. Date filter
      const txDate = new Date(tx.date);
      if (dateFilter === 'this_month') {
        return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
      } else if (dateFilter === 'last_month') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return txDate.getFullYear() === lastMonthYear && txDate.getMonth() === lastMonth;
      } else if (dateFilter === 'last_7_days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return txDate >= sevenDaysAgo;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, selectedType, selectedCategory, dateFilter]);

  const filteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const filteredNet = filteredIncome - filteredExpense;

  const handleExportCSV = () => {
    const headers = ['Tarih', 'Tür', 'Kategori', 'Açıklama', 'Tutar', 'Ödeme Yöntemi', 'Etiketler'];
    const rows = filteredTransactions.map((tx) => [
      tx.date,
      tx.type === 'income' ? 'Gelir' : 'Gider',
      `"${tx.category}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.amount,
      tx.paymentMethod,
      `"${(tx.tags || []).join(', ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `harcamalar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Gelir & Harcama Kayıtları</h2>
          <p className="text-xs text-slate-400">Tüm finansal hareketlerinizi detaylı filtreleyin ve inceleyin</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
            title="CSV İndir"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dışa Aktar</span>
          </button>
          <button
            id="btn-add-tx-main"
            onClick={onAddTransaction}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni İşlem Ekle</span>
          </button>
        </div>
      </div>

      {/* Filtered Summary Bar in Dark Theme */}
      <div className="grid grid-cols-3 gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Filtrelenen Gelir</span>
          <p className="text-sm sm:text-lg font-bold text-emerald-400 mt-1">
            +{formatCurrency(filteredIncome, currency)}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Filtrelenen Gider</span>
          <p className="text-sm sm:text-lg font-bold text-rose-400 mt-1">
            -{formatCurrency(filteredExpense, currency)}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Net Fark</span>
          <p className={`text-sm sm:text-lg font-bold mt-1 ${filteredNet >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
            {formatCurrency(filteredNet, currency)}
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Açıklama, kategori veya etiket ara (örn: Market, Kira, Netflix)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 text-slate-200 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Type Switcher */}
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-lg transition ${selectedType === 'all' ? 'bg-slate-850 text-white border border-slate-750 shadow-xs' : 'text-slate-400'}`}
            >
              Tümü
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`px-3 py-1 rounded-lg transition ${selectedType === 'expense' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400'}`}
            >
              Giderler
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`px-3 py-1 rounded-lg transition ${selectedType === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'}`}
            >
              Gelirler
            </button>
          </div>

          {/* Date Selector */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="bg-slate-950 text-slate-300 text-xs font-medium rounded-xl px-3 py-1.5 border border-slate-800 outline-none"
          >
            <option value="this_month">Bu Ay</option>
            <option value="last_7_days">Son 7 Gün</option>
            <option value="last_month">Geçen Ay</option>
            <option value="all">Tüm Zamanlar</option>
          </select>

          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 text-slate-300 text-xs font-medium rounded-xl px-3 py-1.5 border border-slate-800 outline-none"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-10 text-center text-slate-500 space-y-2">
            <Filter className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">Aradığınız kriterlere uygun işlem bulunamadı.</p>
            <p className="text-xs">Filtreleri sıfırlayabilir veya yeni bir işlem ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-slate-850/60 transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                      }`}
                    >
                      {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                        {tx.billId && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Fatura
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="text-slate-300 font-medium">{tx.category}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span className="capitalize text-slate-500">{tx.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-sm sm:text-base font-bold ${
                          isIncome ? 'text-emerald-400' : 'text-white'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </p>
                    </div>

                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition cursor-pointer"
                      title="İşlemi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
