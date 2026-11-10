import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import AnalyticsCharts from './components/AnalyticsCharts';
import TransactionList from './components/TransactionList';
import TransactionModal from './components/TransactionModal';
import BudgetManager from './components/BudgetManager';
import CategoryManager from './components/CategoryManager';
import ExportImportModal from './components/ExportImportModal';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currency, setCurrency] = useState('$');
  const [loading, setLoading] = useState(false);

  // Data states
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [budgetData, setBudgetData] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Load all initial data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        txList,
        catList,
        sumData,
        catAnalytics,
        trends,
        pMethods,
        bData
      ] = await Promise.all([
        api.getTransactions(),
        api.getCategories(),
        api.getSummary(),
        api.getByCategory({ type: 'expense' }),
        api.getMonthlyTrend(),
        api.getByPaymentMethod(),
        api.getBudgets()
      ]);

      setTransactions(txList || []);
      setCategories(catList || []);
      setSummary(sumData || null);
      setCategoryData(catAnalytics || null);
      setMonthlyTrends(trends || []);
      setPaymentMethods(pMethods || []);
      setBudgetData(bData || null);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers for Transactions
  const handleSaveTransaction = async (formData) => {
    try {
      if (formData.id) {
        await api.updateTransaction(formData.id, formData);
      } else {
        await api.createTransaction(formData);
      }
      setIsAddModalOpen(false);
      setEditingTransaction(null);
      await loadAllData();
    } catch (err) {
      alert(`Error saving transaction: ${err.message}`);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
      await loadAllData();
    } catch (err) {
      alert(`Error deleting transaction: ${err.message}`);
    }
  };

  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  // Handlers for Budgets
  const handleUpdateBudget = async (categoryId, limit) => {
    try {
      await api.updateBudgetLimit(categoryId, limit);
      await loadAllData();
    } catch (err) {
      alert(`Error updating budget: ${err.message}`);
    }
  };

  // Handlers for Categories
  const handleCreateCategory = async (data) => {
    try {
      await api.createCategory(data);
      await loadAllData();
    } catch (err) {
      alert(`Error creating category: ${err.message}`);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      await loadAllData();
    } catch (err) {
      alert(`Error deleting category: ${err.message}`);
    }
  };

  // Batch Import
  const handleBatchImport = async (parsedList) => {
    await api.batchImport(parsedList);
    await loadAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        currency={currency}
        setCurrency={setCurrency}
        onRefresh={loadAllData}
        loading={loading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab 1: Dashboard & Analytics */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <StatsOverview 
              summary={summary} 
              budgetOverview={budgetData} 
              currency={currency} 
            />

            <AnalyticsCharts
              categoryData={categoryData}
              monthlyTrends={monthlyTrends}
              paymentMethods={paymentMethods}
              currency={currency}
            />

            {/* Recent Transactions Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Activity
                </h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
                >
                  View all &rarr;
                </button>
              </div>

              <TransactionList
                transactions={transactions.slice(0, 5)}
                categories={categories}
                currency={currency}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onRefresh={loadAllData}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Full Transactions Ledger */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Transaction History & Ledger
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Search, filter, edit, or export your financial history.
                </p>
              </div>
            </div>

            <TransactionList
              transactions={transactions}
              categories={categories}
              currency={currency}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onRefresh={loadAllData}
            />
          </div>
        )}

        {/* Tab 3: Budgets & Spending Limits */}
        {activeTab === 'budgets' && (
          <BudgetManager
            budgetData={budgetData}
            currency={currency}
            onUpdateBudget={handleUpdateBudget}
          />
        )}

        {/* Tab 4: Categories */}
        {activeTab === 'categories' && (
          <CategoryManager
            categories={categories}
            currency={currency}
            onCreateCategory={handleCreateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </main>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSaveTransaction}
        categories={categories}
        transaction={editingTransaction}
        currency={currency}
      />

      {/* Export / Import Modal */}
      <ExportImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        categories={categories}
        onBatchImport={handleBatchImport}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-400 mt-auto">
        SpendFlow • Full-Stack Expense Tracker powered by React, Node.js, Express & SQLite
      </footer>
    </div>
  );
}

