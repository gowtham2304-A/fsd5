import { Router } from 'express';
import { queryAll, queryOne } from '../db.js';

const router = Router();

// GET /api/analytics/summary
router.get('/summary', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filterClause = '';
    const params = [];

    if (startDate && endDate) {
      filterClause = 'WHERE date >= ? AND date <= ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      filterClause = 'WHERE date >= ?';
      params.push(startDate);
    } else if (endDate) {
      filterClause = 'WHERE date <= ?';
      params.push(endDate);
    }

    // Totals
    const totals = queryAll(
      `SELECT 
        type, 
        COALESCE(SUM(amount), 0) AS total,
        COUNT(id) AS count
       FROM transactions
       ${filterClause}
       GROUP BY type`,
      params
    );

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    for (const row of totals) {
      if (row.type === 'income') {
        totalIncome = Number(row.total);
        incomeCount = Number(row.count);
      } else if (row.type === 'expense') {
        totalExpense = Number(row.total);
        expenseCount = Number(row.count);
      }
    }

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    // Current month comparison
    const now = new Date();
    const curMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const curMonthTotals = queryAll(
      `SELECT type, COALESCE(SUM(amount), 0) AS total FROM transactions WHERE date LIKE ? GROUP BY type`,
      [`${curMonthStr}%`]
    );
    const prevMonthTotals = queryAll(
      `SELECT type, COALESCE(SUM(amount), 0) AS total FROM transactions WHERE date LIKE ? GROUP BY type`,
      [`${prevMonthStr}%`]
    );

    const curExpense = curMonthTotals.find(t => t.type === 'expense')?.total || 0;
    const prevExpense = prevMonthTotals.find(t => t.type === 'expense')?.total || 0;
    const curIncome = curMonthTotals.find(t => t.type === 'income')?.total || 0;
    const prevIncome = prevMonthTotals.find(t => t.type === 'income')?.total || 0;

    const expenseChange = prevExpense > 0 
      ? Math.round(((curExpense - prevExpense) / prevExpense) * 100) 
      : 0;

    res.json({
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      transactionCount: incomeCount + expenseCount,
      currentMonth: {
        month: curMonthStr,
        income: curIncome,
        expense: curExpense,
        net: curIncome - curExpense,
        expenseChange
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/by-category - for Pie Chart
router.get('/by-category', (req, res) => {
  try {
    const { type = 'expense', startDate, endDate } = req.query;

    let sql = `
      SELECT 
        c.id,
        c.name,
        c.color,
        c.icon,
        COALESCE(SUM(t.amount), 0) AS total,
        COUNT(t.id) AS count
      FROM categories c
      JOIN transactions t ON c.id = t.category_id
      WHERE t.type = ?
    `;
    const params = [type];

    if (startDate) {
      sql += ' AND t.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND t.date <= ?';
      params.push(endDate);
    }

    sql += ' GROUP BY c.id ORDER BY total DESC';

    const rows = queryAll(sql, params);
    const grandTotal = rows.reduce((acc, r) => acc + Number(r.total), 0);

    const categoriesWithShare = rows.map(r => ({
      ...r,
      total: Number(r.total),
      percentage: grandTotal > 0 ? Number(((r.total / grandTotal) * 100).toFixed(1)) : 0
    }));

    res.json({
      total: grandTotal,
      categories: categoriesWithShare
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/monthly-trend - for Bar / Line charts (last 6 months)
router.get('/monthly-trend', (req, res) => {
  try {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${monthNum}`;
      const monthName = d.toLocaleString('default', { month: 'short' });
      months.push({ key: monthKey, name: `${monthName} ${year}` });
    }

    const trend = months.map(m => {
      const rows = queryAll(
        `SELECT type, COALESCE(SUM(amount), 0) AS total 
         FROM transactions 
         WHERE date LIKE ? 
         GROUP BY type`,
        [`${m.key}%`]
      );

      let income = 0;
      let expense = 0;
      for (const r of rows) {
        if (r.type === 'income') income = Number(r.total);
        if (r.type === 'expense') expense = Number(r.total);
      }

      return {
        monthKey: m.key,
        name: m.name,
        income,
        expense,
        net: income - expense
      };
    });

    res.json(trend);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/by-payment-method
router.get('/by-payment-method', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let sql = `
      SELECT 
        payment_method,
        COALESCE(SUM(amount), 0) AS total,
        COUNT(id) AS count
      FROM transactions
      WHERE type = 'expense'
    `;
    const params = [];

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }

    sql += ' GROUP BY payment_method ORDER BY total DESC';

    const rows = queryAll(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

