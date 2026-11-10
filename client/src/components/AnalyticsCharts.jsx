import React, { useState } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';
import { PieChart as PieIcon, BarChart2, CreditCard, ChevronRight } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

export default function AnalyticsCharts({ 
  categoryData, 
  monthlyTrends, 
  paymentMethods, 
  currency 
}) {
  const [chartTab, setChartTab] = useState('categories'); // 'categories' | 'trend' | 'methods'

  const categories = categoryData?.categories || [];
  const grandTotal = categoryData?.total || 0;

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/90 text-white text-xs px-3 py-2 rounded-xl shadow-xl backdrop-blur-md border border-slate-700">
          <p className="font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
            {data.name}
          </p>
          <p className="mt-1 text-slate-300">
            {currency}{data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({data.percentage}%)
          </p>
          <p className="text-[10px] text-slate-400">{data.count} transactions</p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xl backdrop-blur-md border border-slate-700 space-y-1">
          <p className="font-semibold text-slate-200">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="flex items-center justify-between gap-4 font-mono">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span>{currency}{Number(entry.value).toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-8">
      {/* Chart Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 mb-5 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-sky-500" />
            Visual Financial Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Insights on spending distribution, trends, and payment preferences
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setChartTab('categories')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              chartTab === 'categories'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Category Share</span>
          </button>

          <button
            onClick={() => setChartTab('trend')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              chartTab === 'trend'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Monthly Trends</span>
          </button>

          <button
            onClick={() => setChartTab('methods')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              chartTab === 'methods'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payment Channels</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Category Breakdown (Donut Chart + List) */}
      {chartTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 h-64 sm:h-72 w-full flex items-center justify-center">
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="total"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#64748b'} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-sm">
                No expense data recorded yet.
              </div>
            )}
          </div>

          <div className="lg:col-span-6 max-h-72 overflow-y-auto pr-1 space-y-2.5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
              <span>Category</span>
              <span>Amount (% Share)</span>
            </div>

            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {cat.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {cat.count} transaction{cat.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {currency}{cat.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <span className="inline-block text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Monthly Trends (Income vs Expenses) */}
      {chartTab === 'trend' && (
        <div className="h-72 w-full">
          {monthlyTrends && monthlyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `${currency}${val}`} />
                <RechartsTooltip content={<CustomBarTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }} 
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{value}</span>}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Insufficient history for trend view.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Payment Methods */}
      {chartTab === 'methods' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-2">
          {paymentMethods && paymentMethods.length > 0 ? (
            paymentMethods.map((pm, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/60 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">{pm.payment_method}</span>
                  <CreditCard className="w-4 h-4 text-sky-500" />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                  {currency}{Number(pm.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{pm.count} expenses</p>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center text-slate-400 text-sm py-8">
              No payment method records found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

