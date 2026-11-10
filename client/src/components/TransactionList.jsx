import React, { useState } from 'react';
import { 
  Search, Filter, ArrowUpRight, ArrowDownRight, 
  Trash2, Edit3, Download, Upload, X, Calendar, CreditCard, Tag 
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';

export default function TransactionList({
  transactions,
  categories,
  currency,
  onEdit,
  onDelete,
  onOpenImportModal,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'expense' | 'income'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter transactions in-memory
  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (selectedCategory && String(t.category_id) !== String(selectedCategory)) return false;
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchDesc = (t.description || '').toLowerCase().includes(term);
      const matchCat = (t.category_name || '').toLowerCase().includes(term);
      const matchMethod = (t.payment_method || '').toLowerCase().includes(term);
      if (!matchDesc && !matchCat && !matchMethod) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || selectedCategory || startDate || endDate;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Filter & Action Toolbar */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search description, category, or payment method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Quick Actions (Export CSV, Import) */}
          <div className="flex items-center space-x-2">
            <a
              href="/api/export/csv"
              download="transactions.csv"
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
              title="Download CSV export"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </a>

            <button
              onClick={onOpenImportModal}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              <Upload className="w-4 h-4" />
              <span>Import Data</span>
            </button>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Type Pill Filter */}
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {['all', 'expense', 'income'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition ${
                  typeFilter === type
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>

          {/* Date range pickers */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none text-xs"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 px-2.5 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <div className="ml-auto text-slate-400 font-mono text-xs">
            Showing {filteredTransactions.length} of {transactions.length}
          </div>
        </div>
      </div>

      {/* Transaction List Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((t) => {
            const isIncome = t.type === 'income';
            return (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
              >
                {/* Left: Icon, Category & Desc */}
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: t.category_color || '#64748b' }}
                  >
                    <CategoryIcon name={t.category_icon} className="w-5 h-5 text-white" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {t.description || t.category_name}
                      </p>
                      <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                        {t.category_name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-400">
                      <span>{t.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {t.payment_method || 'Card'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <p
                      className={`text-base font-bold font-mono ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {currency}{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block sm:hidden">
                      {t.category_name}
                    </span>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition space-x-1">
                    <button
                      onClick={() => onEdit(t)}
                      title="Edit transaction"
                      className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this transaction?')) {
                          onDelete(t.id);
                        }
                      }}
                      title="Delete transaction"
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-400">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No transactions found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your filters or click "+ Add Transaction" to create one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

