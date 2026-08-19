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
  ArrowRight,
  AlertTriangle,
  Clock,
  CreditCard,
  Zap,
  Briefcase,
  Sliders,
  DollarSign,
  Gift
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
import { Transaction, BillReminder, SavingsGoal, Category, CurrencyCode, SalarySchedule } from '../types';
import { formatCurrency, formatDate, getDaysRemaining, calculateSummary, getSalaryCountdown } from '../utils/formatters';

interface DashboardProps {
  transactions: Transaction[];
  bills: BillReminder[];
  goals: SavingsGoal[];
  categories: Category[];
  currency: CurrencyCode;
  salaries?: SalarySchedule[];
  onOpenAddModal: () => void;
  onOpenAddBillModal: () => void;
  onOpenAddGoalModal: () => void;
  onNavigateTab: (tab: any) => void;
  onMarkBillPaid: (billId: string) => void;
  onOpenManageSalaries: () => void;
  onLogSalaryIncome: (salary: SalarySchedule) => void;
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
  salaries = [],
  onOpenAddModal,
  onOpenAddBillModal,
  onOpenAddGoalModal,
  onNavigateTab,
  onMarkBillPaid,
  onOpenManageSalaries,
  onLogSalaryIncome
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const summary = calculateSummary(transactions, bills, goals);

  // Default 2 salaries if none provided
  const activeSalaries: SalarySchedule[] = salaries.length > 0 ? salaries : [
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

  // Urgent upcoming bills (unpaid), sorted by urgency
  const upcomingBills = bills
    .filter((b) => !b.isPaid)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Check how many are urgent (overdue or <= 3 days)
  const urgentBillsCount = bills.filter((b) => {
    if (b.isPaid) return false;
    const r = getDaysRemaining(b.dueDate);
    return r.isOverdue || r.isDueToday || r.days <= 3;
  }).length;

  // Total expected monthly salary
  const totalExpectedMonthlySalary = activeSalaries.reduce((sum, s) => sum + s.amount, 0);

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
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Kalan Bakiye */}
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

        {/* Aylık Toplam Gelir */}
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

        {/* Aylık Toplam Harcama */}
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

        {/* Toplam Tasarruf */}
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

      {/* DUAL SALARY CALENDAR & COUNTDOWN WIDGET (ÇİFT MAAŞ TAKVİMİ) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">Çift Maaş Takvimi & Geri Sayım</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {activeSalaries.length} Maaş Kayıtlı
                </span>
              </div>
              <p className="text-xs text-slate-400">
                1. ve 2. maaş tarihleriniz, kalan gün sayaçları ve hızlı gelir ekleme
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden sm:block pr-2">
              <span className="text-[10px] text-slate-400 block">Toplam Aylık Maaş</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {formatCurrency(totalExpectedMonthlySalary, currency)}
              </span>
            </div>
            <button
              onClick={onOpenManageSalaries}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Maaşları Düzenle</span>
            </button>
          </div>
        </div>

        {/* Salary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSalaries.map((sal, idx) => {
            const countdown = getSalaryCountdown(sal.dayOfMonth);
            const isSoon = countdown.daysLeft <= 3;

            return (
              <div
                key={sal.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 ${
                  countdown.isToday
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : isSoon
                    ? 'bg-indigo-950/30 border-indigo-500/40'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-extrabold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {sal.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {sal.employerOrNote || 'Düzenli Gelir'} • Her ayın {sal.dayOfMonth}. günü
                    </p>
                  </div>

                  {/* Countdown Badge */}
                  {countdown.isToday ? (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 animate-pulse shrink-0 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-300" />
                      BUGÜN MAAŞ GÜNÜ!
                    </span>
                  ) : (
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold shrink-0 border ${
                        isSoon
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {countdown.daysLeft === 1 ? 'Yarın!' : `${countdown.daysLeft} Gün Kaldı`}
                    </span>
                  )}
                </div>

                {/* Amount & Quick Action */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Net Tutar</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {formatCurrency(sal.amount, currency)}
                    </span>
                  </div>

                  {/* Fast 'Maaş Yattı' Button */}
                  <button
                    onClick={() => onLogSalaryIncome(sal)}
                    className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                    title="Bu maaşı bütçenize gelir olarak ekleyin"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Maaş Yattı (Gelire Ekle)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Analytics Section: Spending Breakdown Pie Chart & Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Dedicated Recharts Pie Chart Spending Breakdown (7 cols) */}
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
              {/* Pie Chart Canvas */}
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

              {/* Top Ranked Spending Categories List */}
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

      {/* Secondary Row: 50/30/20 Rule & UPCOMING BILLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 50 / 30 / 20 Smart Budget Health (5 cols) */}
        <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">50 / 30 / 20 Bütçe Kuralı</h3>
                <p className="text-xs text-slate-400 mt-0.5">Finansal disiplin ve denge göstergeleri</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Sağlıklı
              </span>
            </div>

            <div className="space-y-4">
              {/* Needs */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Zorunlu İhtiyaçlar (%50)</span>
                  <span className="font-bold text-white">%{needsPct}</span>
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
                  <span className="text-slate-300 font-medium">Kişisel İstekler (%30)</span>
                  <span className="font-bold text-white">%{wantsPct}</span>
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
                  <span className="text-slate-300 font-medium">Tasarruf & Yatırım (%20)</span>
                  <span className="font-bold text-emerald-400">%{savingsPct}</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, savingsPct)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-800">
            Gelirinizin en az %20'sini birikime ayırarak finansal özgürlüğünüzü güvenceye alın.
          </p>
        </section>

        {/* UPCOMING BILLS WITH URGENCY BADGES & QUICK 'ŞİMDİ ÖDE' BUTTON (7 cols) */}
        <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            {/* Header with Urgency Counter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span>Vadesi Yaklaşan Faturalar & Ödemeler</span>
                  </h3>
                  <p className="text-xs text-slate-400">Son ödeme tarihi yaklaşan kritik borç ve faturalar</p>
                </div>
              </div>

              {urgentBillsCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full border border-rose-500/40 font-bold animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{urgentBillsCount} Acil Ödeme</span>
                </span>
              ) : (
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
                  Geciken Yok
                </span>
              )}
            </div>

            {/* List of Bills with Visual Urgency Badges & Quick Pay Button */}
            <div className="space-y-2.5">
              {upcomingBills.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
                  Bekleyen kritik ödeme bulunmuyor. Tüm faturalarınız ödendi! 🎉
                </div>
              ) : (
                upcomingBills.map((bill) => {
                  const remaining = getDaysRemaining(bill.dueDate);

                  // Determine urgency styling & countdown badge
                  let countdownBadge = null;
                  let cardBorderClass = 'border-slate-800 hover:border-slate-700 bg-slate-950';

                  if (remaining.isOverdue) {
                    cardBorderClass = 'border-rose-500/50 bg-rose-950/20 hover:border-rose-500/70';
                    countdownBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>{Math.abs(remaining.days)} gün gecikti!</span>
                      </span>
                    );
                  } else if (remaining.isDueToday) {
                    cardBorderClass = 'border-amber-500/50 bg-amber-950/20 hover:border-amber-500/70';
                    countdownBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/25 text-amber-300 border border-amber-500/40 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Bugün son gün! (0 gün kaldı)</span>
                      </span>
                    );
                  } else if (remaining.days <= 3) {
                    cardBorderClass = 'border-amber-500/40 bg-slate-950 hover:border-amber-500/60';
                    countdownBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{remaining.days} gün kaldı</span>
                      </span>
                    );
                  } else {
                    countdownBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-indigo-300 border border-indigo-500/30">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{remaining.days} gün kaldı</span>
                      </span>
                    );
                  }

                  return (
                    <div
                      key={bill.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cardBorderClass}`}
                    >
                      {/* Left info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {bill.title}
                          </h4>
                          {countdownBadge}
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            Vade: <b className="text-slate-300">{formatDate(bill.dueDate)}</b>
                          </span>
                          <span>•</span>
                          <span className="text-slate-400">{bill.category}</span>
                          <span>•</span>
                          <span className="font-semibold text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded-md border border-indigo-500/20">
                            {remaining.isOverdue
                              ? `${Math.abs(remaining.days)} gün gecikmede`
                              : remaining.isDueToday
                              ? 'Bugün ödenmeli'
                              : `${remaining.days} gün kaldı`}
                          </span>
                        </div>
                      </div>

                      {/* Right: Amount and 'Şimdi Öde' Quick Pay button */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                        <div className="text-left sm:text-right">
                          <p className="text-sm sm:text-base font-extrabold text-rose-400 tracking-tight">
                            {formatCurrency(bill.amount, currency)}
                          </p>
                          <span className="text-[10px] text-slate-500 block">
                            {bill.autoLogExpense ? 'Gidere Otomatik İşlenir' : 'Tek Seferlik'}
                          </span>
                        </div>

                        {/* 'ŞİMDİ ÖDE' ACTION BUTTON */}
                        <button
                          onClick={() => onMarkBillPaid(bill.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition cursor-pointer"
                          title="Faturayı ödendi olarak işaretle ve gidere ekle"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Şimdi Öde</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer View All Bills Link */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Toplam {bills.filter((b) => !b.isPaid).length} bekleyen ödemeniz var.
            </span>
            <button
              onClick={() => onNavigateTab('bills')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <span>Tüm Faturaları Yönet</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
