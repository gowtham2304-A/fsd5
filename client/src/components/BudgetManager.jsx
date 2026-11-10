import React, { useState } from 'react';
import { Target, AlertCircle, CheckCircle2, Edit2, Check, X } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

export default function BudgetManager({
  budgetData,
  currency,
  onUpdateBudget
}) {
  const [editingId, setEditingId] = useState(null);
  const [editLimit, setEditLimit] = useState('');

  const categories = budgetData?.categories || [];
  const totalBudget = budgetData?.total_budget || 0;
  const totalSpent = budgetData?.total_spent || 0;
  const overallPercentage = budgetData?.overall_percentage || 0;

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditLimit(String(cat.budget_limit));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditLimit('');
  };

  const handleSaveEdit = (catId) => {
    const val = parseFloat(editLimit);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(catId, val);
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-500" />
              Monthly Category Budgets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set monthly spending thresholds to prevent overspending and hit savings goals.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Total Monthly Limit</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {currency}{totalSpent.toLocaleString()} / {currency}{totalBudget.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage > 100
                  ? 'bg-rose-500'
                  : overallPercentage > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
            <span>Overall Budget Usage</span>
            <span className={`font-semibold ${
              overallPercentage > 100 ? 'text-rose-500' : overallPercentage > 80 ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {overallPercentage}% spent
            </span>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const isEditing = editingId === cat.id;
          const isOver = cat.is_over_budget;
          const isNear = !isOver && cat.percentage >= 80;

          return (
            <div
              key={cat.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition hover:shadow-md ${
                isOver
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Category Top Info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {cat.transaction_count} expense{cat.transaction_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                {isOver ? (
                  <span className="flex items-center text-[10px] font-semibold text-rose-600 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3 mr-1" /> Over Budget
                  </span>
                ) : isNear ? (
                  <span className="flex items-center text-[10px] font-semibold text-amber-600 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3 mr-1" /> Near Limit
                  </span>
                ) : (
                  <span className="flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> On Track
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Spending vs Limit */}
              <div className="flex items-center justify-between text-xs mt-3">
                <span className="text-slate-500">
                  Spent: <strong className="text-slate-800 dark:text-slate-200">{currency}{cat.current_spent.toLocaleString()}</strong>
                </span>

                {isEditing ? (
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400">{currency}</span>
                    <input
                      type="number"
                      value={editLimit}
                      onChange={(e) => setEditLimit(e.target.value)}
                      className="w-20 px-1.5 py-0.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded border border-sky-500 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400">
                      Limit: <strong className="text-slate-700 dark:text-slate-300">{currency}{cat.budget_limit.toLocaleString()}</strong>
                    </span>
                    <button
                      onClick={() => handleStartEdit(cat)}
                      title="Edit monthly budget"
                      className="p-1 text-slate-400 hover:text-sky-600 rounded transition"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

