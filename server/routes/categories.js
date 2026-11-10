import { Router } from 'express';
import { queryAll, queryOne, execute } from '../db.js';

const router = Router();

// GET /api/categories
router.get('/', (req, res) => {
  try {
    const { type } = req.query;
    let sql = `
      SELECT 
        c.*,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(t.amount), 0) as total_spent
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id
    `;
    const params = [];

    if (type && (type === 'expense' || type === 'income')) {
      sql += ' WHERE c.type = ?';
      params.push(type);
    }

    sql += ' GROUP BY c.id ORDER BY c.type DESC, c.name ASC';

    const categories = queryAll(sql, params);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories
router.post('/', (req, res) => {
  try {
    const { name, type, color, icon, budget_limit } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const existing = queryOne('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)', [name.trim()]);
    if (existing) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    const result = execute(
      `INSERT INTO categories (name, type, color, icon, budget_limit)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        type,
        color || '#64748b',
        icon || 'Tag',
        budget_limit ? parseFloat(budget_limit) : 0.0
      ]
    );

    const created = queryOne('SELECT * FROM categories WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, type, color, icon, budget_limit } = req.body;

    const existing = queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    execute(
      `UPDATE categories
       SET name = ?, type = ?, color = ?, icon = ?, budget_limit = ?
       WHERE id = ?`,
      [
        name ? name.trim() : existing.name,
        type || existing.type,
        color || existing.color,
        icon || existing.icon,
        budget_limit !== undefined ? parseFloat(budget_limit) : existing.budget_limit,
        id
      ]
    );

    const updated = queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    execute('DELETE FROM transactions WHERE category_id = ?', [id]);
    execute('DELETE FROM categories WHERE id = ?', [id]);

    res.json({ message: 'Category and associated transactions deleted', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

