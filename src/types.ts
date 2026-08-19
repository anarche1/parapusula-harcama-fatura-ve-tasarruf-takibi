export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'nakit' | 'kredi_karti' | 'banka_karti' | 'havale_eft' | 'diger';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO format YYYY-MM-DD
  paymentMethod: PaymentMethod;
  tags?: string[];
  billId?: string; // If auto-generated from bill
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  budgetLimit?: number; // Monthly ceiling
}

export type RecurrenceType = 'monthly' | 'weekly' | 'yearly' | 'once';

export interface BillReminder {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDate: string; // YYYY-MM-DD
  recurrence: RecurrenceType;
  isPaid: boolean;
  paidDate?: string;
  autoLogExpense: boolean;
  notes?: string;
  reminderDaysBefore: number;
}

export interface GoalDeposit {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  icon: string;
  color: string;
  notes?: string;
  isCompleted: boolean;
  deposits: GoalDeposit[];
  createdAt: string;
}

export type CurrencyCode = 'TRY' | 'USD' | 'EUR' | 'GBP';

export type NavTab = 'dashboard' | 'transactions' | 'bills' | 'savings' | 'aicoach' | 'settings';

export interface UserSettings {
  currency: CurrencyCode;
  monthlyIncomeGoal: number;
  savingsMonthlyTarget: number;
  syncKey: string;
  autoSync: boolean;
  enableNotifications: boolean;
  theme?: 'light' | 'dark';
  pinCode?: string;
  isPinLocked?: boolean;
}

export interface AppDataState {
  transactions: Transaction[];
  bills: BillReminder[];
  goals: SavingsGoal[];
  categories: Category[];
  settings: UserSettings;
  lastSyncedAt?: string;
}

export interface AIAdvice {
  savingsScore: number;
  summary: string;
  topInsights: string[];
  actionableTips: {
    title: string;
    description: string;
    potentialMonthlySaving: number;
    difficulty: 'kolay' | 'orta' | 'ileri';
  }[];
  budgetAlerts: string[];
  motivationalQuote: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
