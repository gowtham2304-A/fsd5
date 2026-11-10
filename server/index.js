import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb, queryAll } from './db.js';

import transactionsRouter from './routes/transactions.js';
import categoriesRouter from './routes/categories.js';
import budgetsRouter from './routes/budgets.js';
import analyticsRouter from './routes/analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Expense Tracker API', timestamp: new Date().toISOString() });
});

// CSV Export Endpoint
app.get('/api/export/csv', (req, res) => {
  try {
    const rows = queryAll(`
      SELECT 
        t.id,
        t.date,
        t.type,
        c.name AS category,
        t.amount,
        t.description,
        t.payment_method,
        t.created_at
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC
    `);

    let csv = 'ID,Date,Type,Category,Amount,Description,Payment Method,Created At\n';
    for (const r of rows) {
      const desc = (r.description || '').replace(/"/g, '""');
      csv += `${r.id},"${r.date}","${r.type}","${r.category}",${r.amount},"${desc}","${r.payment_method}","${r.created_at}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend build if available
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(publicDir, 'index.html'));
    }
  });
}

// Initialize database and start server
await initDb();

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Expense Tracker API Server is running on http://localhost:${PORT}`);
  });
}

export default app;

