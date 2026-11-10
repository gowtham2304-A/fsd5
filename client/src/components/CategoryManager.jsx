import React, { useState } from 'react';
import { Layers, Plus, Trash2, Tag, Check } from 'lucide-react';
import CategoryIcon, { availableIcons } from './CategoryIcon';

const PRESET_COLORS = [
  '#f97316', '#3b82f6', '#06b6d4', '#a855f7', 
  '#eab308', '#ec4899', '#ef4444', '#10b981', 
  '#8b5cf6', '#22c55e', '#14b8a6', '#6366f1', '#64748b'
];

export default function CategoryManager({
  categories,
  currency,
  onCreateCategory,
  onDeleteCategory
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState('Tag');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a category name.');
      return;
    }

    onCreateCategory({
      name: name.trim(),
      type,
      color,
      icon,
      budget_limit: budgetLimit ? parseFloat(budgetLimit) : 0
    });

    setName('');
    setBudgetLimit('');
    setShowAddForm(false);
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <div className="space-y-6">
      {/* Header & Add Trigger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-500" />
            Category Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize transactions into custom expense and income classifications.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'New Category'}</span>
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-sky-200 dark:border-sky-900 shadow-lg space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Create New Category
          </h3>

          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-600 rounded-lg border border-rose-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Subscriptions, Gym, Crypto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            {type === 'expense' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Monthly Budget Cap ({currency})
                </label>
                <input
                  type="number"
                  placeholder="e.g. 250"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}
          </div>

          {/* Color & Icon Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Color Palette
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-lg transition-transform active:scale-90 flex items-center justify-center text-white"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Select Icon
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {availableIcons.map((iconKey) => (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setIcon(iconKey)}
                    className={`p-2 rounded-lg transition ${
                      icon === iconKey
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <CategoryIcon name={iconKey} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Categories Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Expense Categories</span>
            <span className="text-xs font-normal text-slate-400">({expenseCategories.length})</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {expenseCategories.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: c.color }}
                  >
                    <CategoryIcon name={c.icon} className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Budget: {currency}{c.budget_limit || 0}/mo
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {c.transaction_count} items
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete category "${c.name}"? Transactions in this category will also be deleted.`)) {
                        onDeleteCategory(c.id);
                      }
                    }}
                    title="Delete category"
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Income Categories */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Income Categories</span>
            <span className="text-xs font-normal text-slate-400">({incomeCategories.length})</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {incomeCategories.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: c.color }}
                  >
                    <CategoryIcon name={c.icon} className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</p>
                    <p className="text-[11px] text-slate-400">Income source</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {c.transaction_count} items
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete category "${c.name}"? Transactions in this category will also be deleted.`)) {
                        onDeleteCategory(c.id);
                      }
                    }}
                    title="Delete category"
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

