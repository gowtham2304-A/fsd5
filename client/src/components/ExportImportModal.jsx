import React, { useState } from 'react';
import { X, Upload, Download, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

export default function ExportImportModal({
  isOpen,
  onClose,
  categories,
  onBatchImport
}) {
  const [importText, setImportText] = useState('');
  const [status, setStatus] = useState(null);

  if (!isOpen) return null;

  const handleImport = async () => {
    setStatus(null);
    if (!importText.trim()) {
      setStatus({ type: 'error', message: 'Please paste CSV or JSON data first.' });
      return;
    }

    try {
      let parsed = [];
      const trimmed = importText.trim();

      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        // Parse as JSON
        const data = JSON.parse(trimmed);
        parsed = Array.isArray(data) ? data : [data];
      } else {
        // Parse as CSV
        const lines = trimmed.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          throw new Error('CSV must contain a header and at least one data row.');
        }

        const catMap = {};
        for (const c of categories) {
          catMap[c.name.toLowerCase()] = c.id;
        }

        // Header: Date,Type,Category,Amount,Description,Payment Method
        const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
        const dateIdx = header.findIndex((h) => h.includes('date'));
        const typeIdx = header.findIndex((h) => h.includes('type'));
        const catIdx = header.findIndex((h) => h.includes('cat'));
        const amtIdx = header.findIndex((h) => h.includes('amount') || h.includes('cost') || h.includes('price'));
        const descIdx = header.findIndex((h) => h.includes('desc') || h.includes('note'));
        const methodIdx = header.findIndex((h) => h.includes('method') || h.includes('payment'));

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
          if (row.length < 3) continue;

          const date = dateIdx !== -1 ? row[dateIdx] : new Date().toISOString().split('T')[0];
          const rawType = typeIdx !== -1 ? row[typeIdx].toLowerCase() : 'expense';
          const type = rawType.includes('inc') ? 'income' : 'expense';
          const catName = catIdx !== -1 ? row[catIdx].toLowerCase() : '';
          const category_id = catMap[catName] || (type === 'income' ? categories.find((c) => c.type === 'income')?.id : categories.find((c) => c.type === 'expense')?.id);
          const amount = amtIdx !== -1 ? parseFloat(row[amtIdx]) : 0;
          const description = descIdx !== -1 ? row[descIdx] : '';
          const payment_method = methodIdx !== -1 ? row[methodIdx] : 'Card';

          if (amount > 0 && category_id) {
            parsed.push({ type, amount, category_id, date, description, payment_method });
          }
        }
      }

      if (parsed.length === 0) {
        throw new Error('No valid transactions could be parsed from input.');
      }

      await onBatchImport(parsed);
      setStatus({ type: 'success', message: `Imported ${parsed.length} transactions!` });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Import failed. Check formatting.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-500" />
            Data Backup & Import
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {status && (
            <div
              className={`p-3 text-xs rounded-xl flex items-center gap-2 ${status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
            >
              {status.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{status.message}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Export to CSV</p>
                <p className="text-xs text-slate-500">Download all your records in a standard spreadsheet format.</p>
              </div>
              <a
                href="/api/export/csv"
                download="transactions.csv"
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>

          {/* Import Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Paste CSV or JSON Data to Import
            </label>
            <p className="text-[11px] text-slate-400 mb-2 font-mono">
              Format: Date,Type,Category,Amount,Description,Payment Method
            </p>
            <textarea
              rows={5}
              placeholder="2026-11-01,expense,Food & Dining,45.50,Grocery shopping,Card&#10;2026-11-02,income,Salary,3000,Bonus payment,Bank Transfer"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Records</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

