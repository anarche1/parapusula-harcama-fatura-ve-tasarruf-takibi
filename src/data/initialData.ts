import { Category, Transaction, BillReminder, SavingsGoal, UserSettings, AppDataState } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_market', name: 'Market & Gıda', icon: 'ShoppingCart', color: '#10B981', type: 'expense', budgetLimit: 12000 },
  { id: 'cat_kira', name: 'Kira & Konut', icon: 'Home', color: '#3B82F6', type: 'expense', budgetLimit: 20000 },
  { id: 'cat_fatura', name: 'Faturalar & Abonelikler', icon: 'Zap', color: '#F59E0B', type: 'expense', budgetLimit: 4000 },
  { id: 'cat_ulasim', name: 'Ulaşım & Akaryakıt', icon: 'Car', color: '#6366F1', type: 'expense', budgetLimit: 5000 },
  { id: 'cat_restoran', name: 'Dışarıda Yemek & Kafe', icon: 'UtensilsCrossed', color: '#EC4899', type: 'expense', budgetLimit: 4500 },
  { id: 'cat_saglik', name: 'Sağlık & Eczane', icon: 'HeartPulse', color: '#EF4444', type: 'expense', budgetLimit: 2500 },
  { id: 'cat_alisveris', name: 'Giyim & Alışveriş', icon: 'ShoppingBag', color: '#8B5CF6', type: 'expense', budgetLimit: 4000 },
  { id: 'cat_eglence', name: 'Eğlence & Hobi', icon: 'Film', color: '#14B8A6', type: 'expense', budgetLimit: 3000 },
  { id: 'cat_egitim', name: 'Eğitim & Kişisel Gelişim', icon: 'GraduationCap', color: '#06B6D4', type: 'expense', budgetLimit: 2000 },
  { id: 'cat_diger_gider', name: 'Diğer Harcamalar', icon: 'MoreHorizontal', color: '#6B7280', type: 'expense', budgetLimit: 3000 },
  
  // Gelir Kategorileri
  { id: 'cat_maas', name: 'Maaş', icon: 'Briefcase', color: '#10B981', type: 'income' },
  { id: 'cat_ek_gelir', name: 'Ek İş & Freelance', icon: 'Laptop', color: '#3B82F6', type: 'income' },
  { id: 'cat_yatirim', name: 'Yatırım & Faiz Geliri', icon: 'TrendingUp', color: '#8B5CF6', type: 'income' },
  { id: 'cat_diger_gelir', name: 'Diğer Gelirler', icon: 'PlusCircle', color: '#F59E0B', type: 'income' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    type: 'income',
    amount: 55000,
    category: 'Maaş',
    description: 'Aylık Şirket Maaş Ödemesi',
    date: '2026-08-01',
    paymentMethod: 'havale_eft',
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: 'tx_2',
    type: 'income',
    amount: 12500,
    category: 'Ek İş & Freelance',
    description: 'Freelance Web Tasarım Projesi',
    date: '2026-08-10',
    paymentMethod: 'havale_eft',
    createdAt: '2026-08-10T14:30:00.000Z'
  },
  {
    id: 'tx_3',
    type: 'expense',
    amount: 18500,
    category: 'Kira & Konut',
    description: 'Ağustos Ayı Ev Kirası',
    date: '2026-08-02',
    paymentMethod: 'havale_eft',
    tags: ['Zorunlu', 'Sabit'],
    createdAt: '2026-08-02T10:15:00.000Z'
  },
  {
    id: 'tx_4',
    type: 'expense',
    amount: 3450,
    category: 'Market & Gıda',
    description: 'Haftalık Aile Market Alışverişi',
    date: '2026-08-05',
    paymentMethod: 'kredi_karti',
    tags: ['Gıda', 'Migros'],
    createdAt: '2026-08-05T18:45:00.000Z'
  },
  {
    id: 'tx_5',
    type: 'expense',
    amount: 1650,
    category: 'Ulaşım & Akaryakıt',
    description: 'Araç Yakıt Dolumu (Benzin)',
    date: '2026-08-07',
    paymentMethod: 'kredi_karti',
    createdAt: '2026-08-07T11:20:00.000Z'
  },
  {
    id: 'tx_6',
    type: 'expense',
    amount: 980,
    category: 'Dışarıda Yemek & Kafe',
    description: 'Hafta Sonu Akşam Yemeği',
    date: '2026-08-09',
    paymentMethod: 'kredi_karti',
    createdAt: '2026-08-09T20:30:00.000Z'
  },
  {
    id: 'tx_7',
    type: 'expense',
    amount: 720,
    category: 'Faturalar & Abonelikler',
    description: 'Elektrik Faturası (EnerjiSa)',
    date: '2026-08-12',
    paymentMethod: 'banka_karti',
    tags: ['Fatura'],
    createdAt: '2026-08-12T13:00:00.000Z'
  },
  {
    id: 'tx_8',
    type: 'expense',
    amount: 2890,
    category: 'Market & Gıda',
    description: 'Organik Pazar ve Şarküteri Alışverişi',
    date: '2026-08-14',
    paymentMethod: 'nakit',
    createdAt: '2026-08-14T16:20:00.000Z'
  },
  {
    id: 'tx_9',
    type: 'expense',
    amount: 1450,
    category: 'Giyim & Alışveriş',
    description: 'Mevsimlik Spor Ayakkabı',
    date: '2026-08-16',
    paymentMethod: 'kredi_karti',
    createdAt: '2026-08-16T15:10:00.000Z'
  },
  {
    id: 'tx_10',
    type: 'expense',
    amount: 450,
    category: 'Faturalar & Abonelikler',
    description: 'Ev İnterneti (Fiber 100Mbps)',
    date: '2026-08-18',
    paymentMethod: 'kredi_karti',
    createdAt: '2026-08-18T10:00:00.000Z'
  }
];

export const INITIAL_BILLS: BillReminder[] = [
  {
    id: 'bill_1',
    title: 'Kira Ödemesi',
    amount: 18500,
    category: 'Kira & Konut',
    dueDate: '2026-09-02',
    recurrence: 'monthly',
    isPaid: true,
    paidDate: '2026-08-02',
    autoLogExpense: true,
    reminderDaysBefore: 3,
    notes: 'Ev sahibi İBAN hesabına transfer'
  },
  {
    id: 'bill_2',
    title: 'Kredi Kartı Ekstresi',
    amount: 8750,
    category: 'Diğer Harcamalar',
    dueDate: '2026-08-24',
    recurrence: 'monthly',
    isPaid: false,
    autoLogExpense: true,
    reminderDaysBefore: 4,
    notes: 'Bonus Kart son ödeme günü'
  },
  {
    id: 'bill_3',
    title: 'Doğalgaz & Isınma Faturası (İGDAŞ)',
    amount: 620,
    category: 'Faturalar & Abonelikler',
    dueDate: '2026-08-22',
    recurrence: 'monthly',
    isPaid: false,
    autoLogExpense: true,
    reminderDaysBefore: 2,
    notes: 'Otomatik ödemede değil, mobil bankacılıktan yatırılacak'
  },
  {
    id: 'bill_4',
    title: 'Turkcell Mobil Hat Faturası',
    amount: 380,
    category: 'Faturalar & Abonelikler',
    dueDate: '2026-08-28',
    recurrence: 'monthly',
    isPaid: false,
    autoLogExpense: true,
    reminderDaysBefore: 3,
    notes: 'Platinum 40GB Paketi'
  },
  {
    id: 'bill_5',
    title: 'Netflix & Spotify Aboneliği',
    amount: 330,
    category: 'Faturalar & Abonelikler',
    dueDate: '2026-08-30',
    recurrence: 'monthly',
    isPaid: false,
    autoLogExpense: true,
    reminderDaysBefore: 1,
    notes: 'Aile planı'
  }
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal_1',
    title: 'Acil Durum Güvence Fonu (6 Aylık)',
    targetAmount: 100000,
    currentAmount: 64000,
    deadline: '2026-12-31',
    category: 'Güvence',
    icon: 'ShieldCheck',
    color: '#10B981',
    notes: 'Beklenmedik masraflar için likit yüksek faizli mevduat / para piyasası fonu',
    isCompleted: false,
    createdAt: '2026-01-10',
    deposits: [
      { id: 'dep_1', amount: 20000, date: '2026-06-01', note: 'Başlangıç birikimi' },
      { id: 'dep_2', amount: 24000, date: '2026-07-05', note: 'Maaş birikimi' },
      { id: 'dep_3', amount: 20000, date: '2026-08-03', note: 'Ağustos tasarruf aktarımı' }
    ]
  },
  {
    id: 'goal_2',
    title: 'Sonbahar Ege & Akdeniz Tatili',
    targetAmount: 35000,
    currentAmount: 28500,
    deadline: '2026-09-20',
    category: 'Tatil',
    icon: 'Palmtree',
    color: '#06B6D4',
    notes: 'Uçak bileti ve otel rezervasyonu için biriktiriliyor',
    isCompleted: false,
    createdAt: '2026-04-15',
    deposits: [
      { id: 'dep_4', amount: 15000, date: '2026-06-15', note: 'İlk taksit' },
      { id: 'dep_5', amount: 13500, date: '2026-08-08', note: 'Freelance gelirinden aktarım' }
    ]
  },
  {
    id: 'goal_3',
    title: 'Yeni Nesil Dizüstü Bilgisayar',
    targetAmount: 60000,
    currentAmount: 18000,
    deadline: '2026-11-15',
    category: 'Teknoloji',
    icon: 'Laptop',
    color: '#8B5CF6',
    notes: 'Yazılım ve iş projeleri için M3 Pro işlemcili bilgisayar',
    isCompleted: false,
    createdAt: '2026-07-01',
    deposits: [
      { id: 'dep_6', amount: 18000, date: '2026-08-11', note: 'Ağustos birikimi' }
    ]
  }
];

export const INITIAL_SETTINGS: UserSettings = {
  currency: 'TRY',
  monthlyIncomeGoal: 65000,
  savingsMonthlyTarget: 20000,
  syncKey: 'SYNC-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
  autoSync: true,
  enableNotifications: true,
  theme: 'dark',
  isPinLocked: false
};

export const INITIAL_APP_STATE: AppDataState = {
  transactions: INITIAL_TRANSACTIONS,
  bills: INITIAL_BILLS,
  goals: INITIAL_GOALS,
  categories: DEFAULT_CATEGORIES,
  settings: INITIAL_SETTINGS,
  lastSyncedAt: new Date().toISOString()
};
