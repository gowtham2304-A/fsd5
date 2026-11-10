import { Router } from 'express';
import { queryAll, queryOne, execute } from '../db.js';

const router = Router();

// GET /api/transactions - fetch with filters
router.get('/', (req, res) => {
  try {
    const { type, categoryId, startDate, endDate, search, limit, offset } = req.query;

    let sql = `
      SELECT 
        t.id,
        t.type,
        t.amount,
        t.category_id,
        c.name AS category_name,
        c.color AS category_color,
        c.icon AS category_icon,
        t.date,
        t.description,
        t.payment_method,
        t.created_at
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (type && (type === 'expense' || type === 'income')) {
      sql += ' AND t.type = ?';
      params.push(type);
    }

    if (categoryId) {
      sql += ' AND t.category_id = ?';
      params.push(Number(categoryId));
    }

    if (startDate) {
      sql += ' AND t.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND t.date <= ?';
      params.push(endDate);
    }

    if (search) {
      sql += ' AND (t.description LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY t.date DESC, t.id DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
      if (offset) {
        sql += ' OFFSET ?';
        params.push(Number(offset));
      }
    }

    const rows = queryAll(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/:id
router.get('/:id', (req, res) => {
  try {
    const row = queryOne(
      `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [Number(req.params.id)]
    );
    if (!row) return res.status(404).json({ error: 'Transaction not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions - create new
router.post('/', (req, res) => {
  try {
    const { type, amount, category_id, date, description, payment_method } = req.body;

    if (!type || !amount || !category_id || !date) {
      return res.status(400).json({ error: 'Type, amount, category_id, and date are required' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const result = execute(
      `INSERT INTO transactions (type, amount, category_id, date, description, payment_method)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [type, numAmount, Number(category_id), date, description || '', payment_method || 'Card']
    );

    const created = queryOne(
      `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [result.lastInsertRowid]
    );

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/transactions/:id - update
router.put('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { type, amount, category_id, date, description, payment_method } = req.body;

    const existing = queryOne('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });

    execute(
      `UPDATE transactions 
       SET type = ?, amount = ?, category_id = ?, date = ?, description = ?, payment_method = ?
       WHERE id = ?`,
      [
        type || existing.type,
        amount !== undefined ? parseFloat(amount) : existing.amount,
        category_id ? Number(category_id) : existing.category_id,
        date || existing.date,
        description !== undefined ? description : existing.description,
        payment_method || existing.payment_method,
        id
      ]
    );

    const updated = queryOne(
      `SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [id]
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = queryOne('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });

    execute('DELETE FROM transactions WHERE id = ?', [id]);
    res.json({ message: 'Transaction deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions/batch - import multiple
router.post('/batch', (req, res) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'Transactions array is required' });
    }

    let inserted = 0;
    for (const t of transactions) {
      if (t.type && t.amount && t.category_id && t.date) {
        execute(
          `INSERT INTO transactions (type, amount, category_id, date, description, payment_method)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [t.type, parseFloat(t.amount), Number(t.category_id), t.date, t.description || '', t.payment_method || 'Card']
        );
        inserted++;
      }
    }

    res.status(201).json({ message: `Successfully imported ${inserted} transactions`, count: inserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

