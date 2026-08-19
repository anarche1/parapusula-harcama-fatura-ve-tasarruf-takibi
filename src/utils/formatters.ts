import { CurrencyCode, Transaction, BillReminder, SavingsGoal } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'TRY'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₺';
  return new Intl.NumberFormat('tr-TR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount) + ' ' + symbol;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) return 'Bugün';

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Dün';

  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  }).format(date);
}

export function getDaysRemaining(dueDateString: string): {
  days: number;
  label: string;
  isOverdue: boolean;
  isDueToday: boolean;
  colorClass: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateString);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      label: `${Math.abs(diffDays)} gün gecikti!`,
      isOverdue: true,
      isDueToday: false,
      colorClass: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900'
    };
  } else if (diffDays === 0) {
    return {
      days: 0,
      label: 'Bugün son gün!',
      isOverdue: false,
      isDueToday: true,
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
    };
  } else if (diffDays <= 3) {
    return {
      days: diffDays,
      label: `${diffDays} gün kaldı`,
      isOverdue: false,
      isDueToday: false,
      colorClass: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900'
    };
  } else {
    return {
      days: diffDays,
      label: `${diffDays} gün sonra`,
      isOverdue: false,
      isDueToday: false,
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
    };
  }
}

export function getSalaryCountdown(dayOfMonth: number): {
  daysLeft: number;
  nextDateFormatted: string;
  isToday: boolean;
  nextDateISO: string;
} {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  // Handle clamping if day is 31 and month has 30 days
  const safeDay = Math.min(dayOfMonth, 28); // or calculate last day of month

  let targetDate = new Date(currentYear, currentMonth, dayOfMonth);

  if (currentDay > dayOfMonth) {
    // Already passed this month -> next month
    targetDate = new Date(currentYear, currentMonth + 1, dayOfMonth);
  }

  const diffTime = targetDate.getTime() - new Date(currentYear, currentMonth, currentDay).getTime();
  const daysLeft = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  const isToday = daysLeft === 0;

  const nextDateFormatted = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long'
  }).format(targetDate);

  const nextDateISO = targetDate.toISOString().split('T')[0];

  return {
    daysLeft,
    nextDateFormatted,
    isToday,
    nextDateISO
  };
}

export function calculateSummary(transactions: Transaction[], bills: BillReminder[], goals: SavingsGoal[]) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const totalSavedInGoals = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  const pendingBills = bills.filter((b) => !b.isPaid);
  const pendingBillsTotal = pendingBills.reduce((sum, b) => sum + b.amount, 0);

  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  return {
    totalIncome,
    totalExpense,
    netBalance,
    totalSavedInGoals,
    totalGoalTarget,
    pendingBillsCount: pendingBills.length,
    pendingBillsTotal,
    savingsRate
  };
}
