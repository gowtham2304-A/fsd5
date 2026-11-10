import React from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  ArrowUpRight, ArrowDownRight, Percent, PiggyBank 
} from 'lucide-react';

export default function StatsOverview({ summary, budgetOverview, currency }) {
  if (!summary) return null;

  const { totalIncome, totalExpense, netSavings, savingsRate, currentMonth } = summary;
  const isNetPositive = netSavings >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Balance / Net Savings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden transition hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Net Savings
          </span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isNetPositive 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
          }`}>
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {currency}{Math.abs(netSavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-2 flex items-center text-xs">
          <span className={`inline-flex items-center font-medium ${
            isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isNetPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {savingsRate}% savings rate
          </span>
          <span className="text-slate-400 dark:text-slate-500 ml-1.5">all-time</span>
        </div>
      </div>

      {/* Total Income */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden transition hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Income
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
          +{currency}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
          <span>This month: </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 ml-1">
            +{currency}{(currentMonth?.income || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden transition hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Expenses
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
          -{currency}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
          <span>This month: </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 ml-1">
            -{currency}{(currentMonth?.expense || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Monthly Budget Spent */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden transition hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Monthly Budget
          </span>
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {budgetOverview?.overall_percentage || 0}%
          <span className="text-xs font-normal text-slate-400 ml-1">used</span>
        </div>
        {/* Progress Bar */}
        <div className="mt-2.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                (budgetOverview?.overall_percentage || 0) > 100 
                  ? 'bg-rose-500' 
                  : (budgetOverview?.overall_percentage || 0) > 80 
                    ? 'bg-amber-500' 
                    : 'bg-sky-500'
              }`}
              style={{ width: `${Math.min(budgetOverview?.overall_percentage || 0, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>{currency}{(budgetOverview?.total_spent || 0).toLocaleString()} spent</span>
            <span>{currency}{(budgetOverview?.total_budget || 0).toLocaleString()} cap</span>
          </div>
        </div>
      </div>
    </div>
  );
}

