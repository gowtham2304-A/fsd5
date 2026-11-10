import { Router } from 'express';
import { queryAll, queryOne, execute } from '../db.js';

const router = Router();

// GET /api/budgets - Get all expense categories with current month spending vs limit
router.get('/', (req, res) => {
  try {
    const now = new Date();
    const currentMonth = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const sql = `
      SELECT 
        c.id,
        c.name,
        c.color,
        c.icon,
        c.budget_limit,
        COALESCE(SUM(t.amount), 0) AS current_spent,
        COUNT(t.id) AS transaction_count
      FROM categories c
      LEFT JOIN transactions t 
        ON c.id = t.category_id 
        AND t.type = 'expense'
        AND t.date LIKE ?
      WHERE c.type = 'expense'
      GROUP BY c.id
      ORDER BY c.budget_limit DESC, current_spent DESC
    `;

    const rows = queryAll(sql, [`${currentMonth}%`]);

    const budgets = rows.map(r => {
      const limit = Number(r.budget_limit) || 0;
      const spent = Number(r.current_spent) || 0;
      const percentage = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 999) : 0;
      const remaining = Math.max(0, limit - spent);
      const isOverBudget = limit > 0 && spent > limit;

      return {
        ...r,
        budget_limit: limit,
        current_spent: spent,
        remaining,
        percentage,
        is_over_budget: isOverBudget
      };
    });

    const totalBudget = budgets.reduce((acc, b) => acc + b.budget_limit, 0);
    const totalSpent = budgets.reduce((acc, b) => acc + b.current_spent, 0);

    res.json({
      month: currentMonth,
      total_budget: totalBudget,
      total_spent: totalSpent,
      overall_percentage: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
      categories: budgets
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/budgets/:id - update category budget limit
router.put('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { budget_limit } = req.body;

    if (budget_limit === undefined || isNaN(parseFloat(budget_limit))) {
      return res.status(400).json({ error: 'Valid budget_limit is required' });
    }

    execute('UPDATE categories SET budget_limit = ? WHERE id = ?', [parseFloat(budget_limit), id]);
    const updated = queryOne('SELECT id, name, budget_limit, color, icon FROM categories WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

