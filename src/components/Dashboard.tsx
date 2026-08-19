import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  ChevronRight,
  PieChart as PieIcon,
  Tag,
  Flame,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';
import { Transaction, BillReminder, SavingsGoal, Category, CurrencyCode } from '../types';
import { formatCurrency, formatDate, getDaysRemaining, calculateSummary } from '../utils/formatters';

interface DashboardProps {
  transactions: Transaction[];
  bills: BillReminder[];
  goals: SavingsGoal[];
  categories: Category[];
  currency: CurrencyCode;
  onOpenAddModal: () => void;
  onOpenAddBillModal: () => void;
  onOpenAddGoalModal: () => void;
  onNavigateTab: (tab: any) => void;
  onMarkBillPaid: (billId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Market & Gıda': '#10B981',
  'Kira & Konut': '#6366F1',
  'Faturalar & Abonelikler': '#F59E0B',
  'Ulaşım & Akaryakıt': '#38BDF8',
  'Dışarıda Yemek & Kafe': '#EC4899',
  'Sağlık & Eczane': '#EF4444',
  'Giyim & Alışveriş': '#8B5CF6',
  'Eğlence & Hobi': '#14B8A6',
  'Eğitim & Kişisel Gelişim': '#06B6D4',
  'Diğer Harcamalar': '#64748B'
};

const FALLBACK_PALETTE = ['#6366F1', '#10B981', '#38BDF8', '#F59E0B', '#EC4899', '#8B5CF6', '#F43F5E', '#14B8A6', '#06B6D4', '#64748B'];

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  bills,
  goals,
  categories,
  currency,
  onOpenAddModal,
  onOpenAddBillModal,
  onOpenAddGoalModal,
  onNavigateTab,
  onMarkBillPaid
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const summary = calculateSummary(transactions, bills, goals);

  // Group expenses by category for pie chart
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpenseSum = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  const expenseByCategory: Record<string, { total: number; count: number }> = expenseTransactions.reduce(
    (acc: Record<string, { total: number; count: number }>, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { total: 0, count: 0 };
      }
      acc[t.category].total += t.amount;
      acc[t.category].count += 1;
      return acc;
    },
    {} as Record<string, { total: number; count: number }>
  );

  const pieData = Object.entries(expenseByCategory)
    .map(([name, data]: [string, { total: number; count: number }]) => {
      const percentage = totalExpenseSum > 0 ? Math.round((data.total / totalExpenseSum) * 100) : 0;
      const matchedCategory = categories.find((c) => c.name === name);
      const color = matchedCategory?.color || CATEGORY_COLORS[name] || FALLBACK_PALETTE[0];
      return {
        name,
        value: Number(data.total),
        count: data.count,
        percentage,
        color,
        budgetLimit: matchedCategory?.budgetLimit
      };
    })
    .sort((a, b) => b.value - a.value);

  // Top spending category
  const topExpense = pieData[0] || null;

  // Monthly breakdown mock/computed from transactions
  const monthlyFlowData = [
    { month: 'Pzt', Gelir: 12000, Gider: 8500, Tasarruf: 3500 },
    { month: 'Sal', Gelir: 15000, Gider: 9200, Tasarruf: 5800 },
    { month: 'Çar', Gelir: 18000, Gider: 11400, Tasarruf: 6600 },
    { month: 'Per', Gelir: 14000, Gider: 7800, Tasarruf: 6200 },
    { month: 'Cum', Gelir: 22000, Gider: 14500, Tasarruf: 7500 },
    { month: 'Cmt', Gelir: 9000, Gider: 6200, Tasarruf: 2800 },
    { month: 'Paz', Gelir: summary.totalIncome, Gider: summary.totalExpense, Tasarruf: Math.max(0, summary.netBalance) }
  ];

  // 50/30/20 Rule calculations
  const needsCategories = ['Market & Gıda', 'Kira & Konut', 'Faturalar & Abonelikler', 'Ulaşım & Akaryakıt', 'Sağlık & Eczane'];
  const totalNeeds = transactions
    .filter((t) => t.type === 'expense' && needsCategories.some(c => t.category.includes(c) || c.includes(t.category)))
    .reduce((s, t) => s + t.amount, 0);

  const totalWants = summary.totalExpense - totalNeeds;
  const incomeBase = summary.totalIncome || 1;
  const needsPct = Math.round((totalNeeds / incomeBase) * 100);
  const wantsPct = Math.round((totalWants / incomeBase) * 100);
  const savingsPct = Math.max(0, 100 - needsPct - wantsPct);

  // Urgent upcoming bills (unpaid)
  const upcomingBills = bills
    .filter((b) => !b.isPaid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  // Custom active shape for interactive Pie Hover
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* 4 Metric Cards matching Sophisticated Dark Spec */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Bakiye */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Net Kalan Bakiye</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {formatCurrency(summary.netBalance, currency)}
            </h2>
          </div>
          <p className="text-xs text-emerald-400 mt-3 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Kullanılabilir likit bütçe</span>
          </p>
        </div>

        {/* Toplam Gelir */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Aylık Toplam Gelir</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {formatCurrency(summary.totalIncome, currency)}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Maaş & ek gelir kaynakları
          </p>
        </div>

        {/* Aylık Harcama */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Aylık Toplam Harcama</p>
            <h2 className="text-2xl font-bold text-rose-400 tracking-tight">
              {formatCurrency(summary.totalExpense, currency)}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center justify-between">
            <span>{expenseTransactions.length} harcama kaydı</span>
            {topExpense && <span className="text-rose-300 font-medium">En çok: %{topExpense.percentage}</span>}
          </p>
        </div>

        {/* Toplam Tasarruf (Indigo Highlight) */}
        <div className="bg-indigo-600/10 border border-indigo-500/30 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <p className="text-xs text-indigo-400 uppercase tracking-wider mb-1">Toplam Tasarruf</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {formatCurrency(summary.totalSavedInGoals, currency)}
            </h2>
          </div>
          <p className="text-xs text-indigo-300 mt-3 flex items-center justify-between">
            <span>Tasarruf Oranı: %{summary.savingsRate}</span>
            <span className="font-semibold">{goals.length} Hedef</span>
          </p>
        </div>
      </div>

      {/* Primary Analytics Section: Spending Breakdown Pie Chart & Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / HERO: Dedicated Recharts Pie Chart Spending Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            {/* Header with quick insight badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2 text-base">
                  <PieIcon className="w-4 h-4 text-indigo-400" />
                  <span>Kategori Bazlı Harcama Dağılımı</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bütçenizin en büyük harcama kalemlerini ve kategori oranlarını keşfedin
                </p>
              </div>

              {topExpense && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Lider: {topExpense.name} (%{topExpense.percentage})</span>
                </span>
              )}
            </div>

            {/* Main Interactive Pie Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Pie Chart Canvas (7 cols on desktop) */}
              <div className="md:col-span-7 h-60 w-full relative flex items-center justify-center">
                {pieData.length === 0 ? (
                  <div className="text-center text-slate-500 text-xs py-8">
                    Henüz harcama kaydı bulunmuyor.
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          activeIndex={activeIndex !== null ? activeIndex : undefined}
                          activeShape={renderActiveShape}
                          onMouseEnter={(_, index) => setActiveIndex(index)}
                          onMouseLeave={() => setActiveIndex(null)}
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="#0f172a"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: any, name: any) => [
                            `${formatCurrency(Number(val), currency)} (%${
                              pieData.find((p) => p.name === name)?.percentage || 0
                            })`,
                            'Gider Tutarı'
                          ]}
                          contentStyle={{
                            backgroundColor: '#020617',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#F8FAFC',
                            fontSize: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center Metric Label in Donut Hole */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                        {activeIndex !== null ? pieData[activeIndex]?.name : 'Toplam Gider'}
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-white">
                        {activeIndex !== null
                          ? formatCurrency(pieData[activeIndex]?.value || 0, currency)
                          : formatCurrency(totalExpenseSum, currency)}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-semibold">
                        {activeIndex !== null
                          ? `Pay: %${pieData[activeIndex]?.percentage}`
                          : `${pieData.length} Kategori`}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Top Ranked Spending Categories List (5 cols on desktop) */}
              <div className="md:col-span-5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  En Yüksek Giderler
                </span>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {pieData.slice(0, 5).map((item, idx) => (
                    <div
                      key={item.name}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseLeave={() => setActiveIndex(null)}
                      className={`p-2 rounded-xl transition cursor-pointer border ${
                        activeIndex === idx
                          ? 'bg-slate-800 border-indigo-500/50 shadow-xs'
                          : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-slate-200 font-medium truncate max-w-[110px]">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-bold text-white shrink-0">
                          {formatCurrency(item.value, currency)}
                        </span>
                      </div>

                      {/* Percentage Bar & Tag */}
                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                        <div className="flex-1 h-1.5 bg-slate-850 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, item.percentage)}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                        <span className="font-semibold text-slate-300">%{item.percentage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Footer Action */}
          <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Toplam {pieData.length} farklı kategoride harcama yapıldı.
            </span>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>Harcamaları İncele</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT: Cash Flow & Trends Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-base">Nakit Akışı Analizi</h3>
                <p className="text-xs text-slate-400 mt-0.5">Gelir, Gider & Tasarruf Dengesi</p>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Gelir
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Gider
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyFlowData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    tickFormatter={(v) => `${v / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value), currency)}
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="Gelir" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="Gider" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="Tasarruf" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Net Tasarruf: <b className="text-emerald-400">%{summary.savingsRate}</b></span>
            <span className="text-slate-500">Haftalık görünüm</span>
          </div>
        </div>
      </div>

      {/* Secondary Row: 50/30/20 Rule, Upcoming Payments & AI Tip Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 50 / 30 / 20 Smart Budget Health (6 cols) */}
        <section className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">50 / 30 / 20 Bütçe Dengesi Kuralı</h3>
              <p className="text-xs text-slate-400 mt-0.5">Finansal istikrar ve disiplin göstergeleri</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Sağlıklı
            </span>
          </div>

          <div className="space-y-4">
            {/* Needs */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Zorunlu İhtiyaçlar (Kira, Fatura, Market)</span>
                <span className="font-bold text-white">%{needsPct} / %50</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, needsPct)}%` }}
                />
              </div>
            </div>

            {/* Wants */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Kişisel İstekler (Yeme-İçme, Alışveriş)</span>
                <span className="font-bold text-white">%{wantsPct} / %30</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, wantsPct)}%` }}
                />
              </div>
            </div>

            {/* Savings */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Tasarruf & Yatırım Fonu</span>
                <span className="font-bold text-emerald-400">%{savingsPct} / %20</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, savingsPct)}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Payments (3 cols) */}
        <section className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Yaklaşan Ödemeler</h3>
              {upcomingBills.length > 0 && (
                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30 font-semibold">
                  {upcomingBills.length} Kritik
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {upcomingBills.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Bekleyen ödeme bulunmuyor.</p>
              ) : (
                upcomingBills.map((bill) => {
                  const remaining = getDaysRemaining(bill.dueDate);
                  return (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-medium text-white truncate">{bill.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(bill.dueDate)} • {remaining.label}</p>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-1.5">
                        <p className="text-xs font-bold text-rose-400">
                          {formatCurrency(bill.amount, currency)}
                        </p>
                        <button
                          onClick={() => onMarkBillPaid(bill.id)}
                          className="p-1 text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition cursor-pointer"
                          title="Ödendi İşaretle"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('bills')}
            className="w-full mt-3 py-2 text-xs font-semibold text-slate-400 border border-slate-800 rounded-xl hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            Tüm Faturalar
          </button>
        </section>

        {/* Günün Tasarruf Önerisi (3 cols) */}
        <section className="lg:col-span-3 bg-indigo-950/70 border border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xs">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tasarruf Tavsiyesi</span>
            </div>
            <p className="text-xs text-indigo-200/90 leading-relaxed mb-3">
              Evde kahve demleyerek bu ay <span className="text-white font-bold italic">₺640</span> tasarruf ettiniz!
            </p>

            <div className="h-2 w-full bg-indigo-900/60 rounded-full overflow-hidden border border-indigo-800">
              <div className="h-full bg-indigo-400 w-3/4 rounded-full" />
            </div>

            <div className="flex justify-between mt-2 text-[10px]">
              <span className="text-indigo-300 font-medium">Hedef: ₺1.500</span>
              <span className="text-indigo-100 font-bold">₺1.120</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-indigo-800/40 flex items-center justify-between relative z-10">
            <button
              onClick={() => onNavigateTab('aicoach')}
              className="text-xs text-indigo-300 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>AI Analizi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
            >
              + Ekle
            </button>
          </div>

          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        </section>
      </div>
    </div>
  );
};
