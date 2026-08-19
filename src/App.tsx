import React, { useState, useEffect } from 'react';
import { AppDataState, NavTab, Transaction, BillReminder, SavingsGoal, UserSettings, CurrencyCode, SalarySchedule } from './types';
import { loadInitialData, saveAppData, syncWithCloud, fetchFromCloud, resetAppData } from './utils/storage';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TransactionsView } from './components/TransactionsView';
import { BillsView } from './components/BillsView';
import { SavingsView } from './components/SavingsView';
import { AICoachView } from './components/AICoachView';
import { SettingsView } from './components/SettingsView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddBillModal } from './components/AddBillModal';
import { AddGoalModal } from './components/AddGoalModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { ManageSalariesModal } from './components/ManageSalariesModal';

export const App: React.FC = () => {
  const [data, setData] = useState<AppDataState>(() => loadInitialData());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [cloudSynced, setCloudSynced] = useState<boolean>(true);

  // Modals state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isManageSalariesOpen, setIsManageSalariesOpen] = useState(false);

  // Save to local storage whenever data changes & apply dark class
  useEffect(() => {
    saveAppData(data);
    // Apply dark class
    if (data.settings.theme !== 'light') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data]);

  // Initial cloud sync background pull/check
  useEffect(() => {
    const doInitialSync = async () => {
      if (data.settings.syncKey) {
        try {
          setIsSyncing(true);
          const remoteData = await fetchFromCloud(data.settings.syncKey);
          if (remoteData && remoteData.transactions) {
            setData(remoteData);
            setCloudSynced(true);
          } else {
            // First time push
            await syncWithCloud(data.settings.syncKey, data);
            setCloudSynced(true);
          }
        } catch (e) {
          console.log('Background cloud sync skipped/local mode:', e);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    doInitialSync();
  }, []);

  // Sync push handler
  const handlePushCloud = async () => {
    setIsSyncing(true);
    try {
      const ok = await syncWithCloud(data.settings.syncKey, data);
      if (ok) setCloudSynced(true);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync pull handler
  const handlePullCloud = async (key: string) => {
    setIsSyncing(true);
    try {
      const remote = await fetchFromCloud(key);
      if (remote && remote.transactions) {
        setData(remote);
        setCloudSynced(true);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Add Transaction
  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const tx: Transaction = {
      ...newTx,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString()
    };
    setData((prev) => ({
      ...prev,
      transactions: [tx, ...prev.transactions]
    }));
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id)
    }));
  };

  // Add Bill
  const handleAddBill = (newBill: Omit<BillReminder, 'id' | 'isPaid' | 'paidDate'>) => {
    const bill: BillReminder = {
      ...newBill,
      id: 'bill-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      isPaid: false
    };
    setData((prev) => ({
      ...prev,
      bills: [...prev.bills, bill]
    }));
  };

  // Toggle Bill Paid
  const handleToggleBillPaid = (billId: string) => {
    setData((prev) => {
      const target = prev.bills.find((b) => b.id === billId);
      if (!target) return prev;

      const newIsPaid = !target.isPaid;
      const today = new Date().toISOString().split('T')[0];

      // Update bill
      const updatedBills = prev.bills.map((b) => {
        if (b.id === billId) {
          return {
            ...b,
            isPaid: newIsPaid,
            paidDate: newIsPaid ? today : undefined
          };
        }
        return b;
      });

      let updatedTx = [...prev.transactions];
      // If marking as paid and autoLogExpense is enabled, log transaction
      if (newIsPaid && target.autoLogExpense) {
        const autoTx: Transaction = {
          id: 'tx-bill-' + Date.now(),
          type: 'expense',
          amount: target.amount,
          category: target.category || 'Faturalar & Abonelikler',
          description: `${target.title} (Fatura Ödemesi)`,
          date: today,
          paymentMethod: 'banka_karti',
          billId: target.id,
          createdAt: new Date().toISOString(),
          tags: ['fatura', 'otomatik']
        };
        updatedTx = [autoTx, ...updatedTx];
      }

      return {
        ...prev,
        bills: updatedBills,
        transactions: updatedTx
      };
    });
  };

  // Delete Bill
  const handleDeleteBill = (id: string) => {
    setData((prev) => ({
      ...prev,
      bills: prev.bills.filter((b) => b.id !== id)
    }));
  };

  // Add Goal
  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id' | 'isCompleted' | 'deposits' | 'createdAt'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: 'goal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      isCompleted: false,
      deposits: [],
      createdAt: new Date().toISOString()
    };
    setData((prev) => ({
      ...prev,
      goals: [...prev.goals, goal]
    }));
  };

  // Deposit to Goal
  const handleDepositToGoal = (goalId: string, amount: number, note?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setData((prev) => {
      const updatedGoals = prev.goals.map((g) => {
        if (g.id === goalId) {
          const newAmount = g.currentAmount + amount;
          return {
            ...g,
            currentAmount: newAmount,
            isCompleted: newAmount >= g.targetAmount,
            deposits: [
              ...(g.deposits || []),
              {
                id: 'dep-' + Date.now(),
                amount,
                date: today,
                note
              }
            ]
          };
        }
        return g;
      });

      // Also create a savings expense/transfer transaction
      const targetGoal = prev.goals.find((g) => g.id === goalId);
      const savingsTx: Transaction = {
        id: 'tx-sav-' + Date.now(),
        type: 'expense',
        amount,
        category: 'Tasarruf & Yatırım',
        description: `${targetGoal ? targetGoal.title : 'Hedef'} Tasarruf Fonu: ${note || 'Aktarım'}`,
        date: today,
        paymentMethod: 'havale_eft',
        createdAt: new Date().toISOString(),
        tags: ['tasarruf', 'birikim']
      };

      return {
        ...prev,
        goals: updatedGoals,
        transactions: [savingsTx, ...prev.transactions]
      };
    });
  };

  // Delete Goal
  const handleDeleteGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id)
    }));
  };

  // Settings update
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings
      }
    }));
  };

  // Save salaries configuration
  const handleSaveSalaries = (newSalaries: SalarySchedule[]) => {
    handleUpdateSettings({ salaries: newSalaries });
  };

  // Quick action: Log salary income transaction
  const handleLogSalaryIncome = (salary: SalarySchedule) => {
    const today = new Date().toISOString().split('T')[0];
    const newTx: Transaction = {
      id: 'tx-salary-' + Date.now(),
      type: 'income',
      amount: salary.amount,
      category: 'Maaş',
      description: `${salary.title} (${salary.employerOrNote || 'Aylık Maaş Ödemesi'})`,
      date: today,
      paymentMethod: 'havale_eft',
      createdAt: new Date().toISOString(),
      tags: ['maaş', 'düzenli gelir']
    };

    setData((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions]
    }));
  };

  const handleToggleTheme = () => {
    const nextTheme = data.settings.theme === 'light' ? 'dark' : 'light';
    handleUpdateSettings({ theme: nextTheme });
  };

  const handleChangeCurrency = (curr: CurrencyCode) => {
    handleUpdateSettings({ currency: curr });
  };

  const handleImportData = (imported: AppDataState) => {
    setData(imported);
  };

  const handleResetData = () => {
    const reset = resetAppData();
    setData(reset);
  };

  // Count pending bills for navigation badge
  const pendingBillsCount = data.bills.filter((b) => !b.isPaid).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <Header
        currency={data.settings.currency}
        theme={data.settings.theme}
        isCloudSynced={cloudSynced}
        isSyncing={isSyncing}
        onToggleTheme={handleToggleTheme}
        onChangeCurrency={handleChangeCurrency}
        onOpenCloudSync={() => setIsSyncModalOpen(true)}
        pendingBillsCount={pendingBillsCount}
        onNavigateToBills={() => setActiveTab('bills')}
        onOpenAddModal={() => setIsAddTxOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Navigation Tabs */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingBillsCount={pendingBillsCount}
        />

        {/* Tab View Routers */}
        <main>
          {activeTab === 'dashboard' && (
            <Dashboard
              transactions={data.transactions}
              bills={data.bills}
              goals={data.goals}
              categories={data.categories}
              currency={data.settings.currency}
              salaries={data.settings.salaries}
              onOpenAddModal={() => setIsAddTxOpen(true)}
              onOpenAddBillModal={() => setIsAddBillOpen(true)}
              onOpenAddGoalModal={() => setIsAddGoalOpen(true)}
              onNavigateTab={setActiveTab}
              onMarkBillPaid={handleToggleBillPaid}
              onOpenManageSalaries={() => setIsManageSalariesOpen(true)}
              onLogSalaryIncome={handleLogSalaryIncome}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={data.transactions}
              categories={data.categories}
              currency={data.settings.currency}
              onAddTransaction={() => setIsAddTxOpen(true)}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'bills' && (
            <BillsView
              bills={data.bills}
              currency={data.settings.currency}
              onAddBill={() => setIsAddBillOpen(true)}
              onTogglePaid={handleToggleBillPaid}
              onDeleteBill={handleDeleteBill}
            />
          )}

          {activeTab === 'savings' && (
            <SavingsView
              goals={data.goals}
              currency={data.settings.currency}
              onAddGoal={() => setIsAddGoalOpen(true)}
              onDepositToGoal={handleDepositToGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {activeTab === 'aicoach' && (
            <AICoachView
              appData={data}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              appData={data}
              onUpdateSettings={handleUpdateSettings}
              onResetData={handleResetData}
              onImportData={handleImportData}
              onOpenSyncModal={() => setIsSyncModalOpen(true)}
              onOpenManageSalaries={() => setIsManageSalariesOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Footer matching Sophisticated Dark Spec */}
      <footer className="h-12 bg-slate-950 border-t border-slate-800 px-4 sm:px-8 hidden md:flex items-center justify-between text-[11px] text-slate-500 mt-auto">
        <div>© 2026 ParaPusula Android & Web Financial Management</div>
        <div className="flex items-center gap-4">
          <span>Veri Güvenliği: AES-256 Şifreli</span>
          <span>Çift Maaş Takibi: Aktif</span>
        </div>
      </footer>

      {/* Interactive Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        categories={data.categories}
        onAdd={handleAddTransaction}
      />

      <AddBillModal
        isOpen={isAddBillOpen}
        onClose={() => setIsAddBillOpen(false)}
        categories={data.categories}
        onAdd={handleAddBill}
      />

      <AddGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onAdd={handleAddGoal}
      />

      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncKey={data.settings.syncKey}
        onPushToCloud={handlePushCloud}
        onPullFromCloud={handlePullCloud}
        lastSyncedAt={data.lastSyncedAt}
      />

      <ManageSalariesModal
        isOpen={isManageSalariesOpen}
        onClose={() => setIsManageSalariesOpen(false)}
        salaries={data.settings.salaries || []}
        currency={data.settings.currency}
        onSaveSalaries={handleSaveSalaries}
      />
    </div>
  );
};

export default App;
