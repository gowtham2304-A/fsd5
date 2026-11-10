import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.VERCEL
  ? path.join('/tmp', 'expenses.db')
  : path.join(__dirname, 'expenses.db');
const bundledDbPath = path.join(__dirname, 'expenses.db');

let db = null;

export async function initDb() {
  if (db) return db;

  const SQL = await initSqlJs();
  const sourcePath = fs.existsSync(dbPath)
    ? dbPath
    : (fs.existsSync(bundledDbPath) ? bundledDbPath : null);

  if (sourcePath) {
    try {
      const fileBuffer = fs.readFileSync(sourcePath);
      db = new SQL.Database(fileBuffer);
    } catch (err) {
      console.warn('Could not read existing database, creating fresh one:', err.message);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      color TEXT DEFAULT '#64748b',
      icon TEXT DEFAULT 'tag',
      budget_limit REAL DEFAULT 0.0
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      description TEXT,
      payment_method TEXT DEFAULT 'Card',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if categories exist
  const catCountRes = db.exec("SELECT COUNT(*) AS count FROM categories");
  const catCount = catCountRes[0]?.values[0][0] || 0;

  if (catCount === 0) {
    seedInitialData();
  }

  saveDb();
  return db;
}

export function saveDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Failed to save database file:', err);
  }
}

export function queryAll(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function execute(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  if (params && params.length > 0) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
  } else {
    db.run(sql);
  }
  saveDb();
  const res = db.exec("SELECT last_insert_rowid() AS id, changes() AS changes");
  const lastId = res[0]?.values[0][0] ?? null;
  const changes = res[0]?.values[0][1] ?? 0;
  return { lastInsertRowid: lastId, changes };
}

function seedInitialData() {
  console.log('Seeding initial categories and sample transactions...');

  const defaultCategories = [
    // Expenses
    { name: 'Food & Dining', type: 'expense', color: '#f97316', icon: 'Utensils', budget: 600 },
    { name: 'Housing & Rent', type: 'expense', color: '#3b82f6', icon: 'Home', budget: 1400 },
    { name: 'Transportation', type: 'expense', color: '#06b6d4', icon: 'Car', budget: 300 },
    { name: 'Entertainment', type: 'expense', color: '#a855f7', icon: 'Film', budget: 200 },
    { name: 'Utilities', type: 'expense', color: '#eab308', icon: 'Zap', budget: 250 },
    { name: 'Shopping', type: 'expense', color: '#ec4899', icon: 'ShoppingBag', budget: 350 },
    { name: 'Healthcare', type: 'expense', color: '#ef4444', icon: 'HeartPulse', budget: 150 },
    { name: 'Education', type: 'expense', color: '#10b981', icon: 'BookOpen', budget: 100 },
    { name: 'Personal Care', type: 'expense', color: '#8b5cf6', icon: 'Smile', budget: 120 },
    // Income
    { name: 'Salary', type: 'income', color: '#22c55e', icon: 'Briefcase', budget: 0 },
    { name: 'Freelance', type: 'income', color: '#14b8a6', icon: 'Laptop', budget: 0 },
    { name: 'Investments', type: 'income', color: '#6366f1', icon: 'TrendingUp', budget: 0 },
    { name: 'Other Income', type: 'income', color: '#84cc16', icon: 'PlusCircle', budget: 0 }
  ];

  for (const cat of defaultCategories) {
    db.run(
      "INSERT INTO categories (name, type, color, icon, budget_limit) VALUES (?, ?, ?, ?, ?)",
      [cat.name, cat.type, cat.color, cat.icon, cat.budget]
    );
  }

  // Get inserted categories mapping
  const cats = queryAll("SELECT id, name FROM categories");
  const catMap = {};
  for (const c of cats) {
    catMap[c.name] = c.id;
  }

  // Sample transactions with dates relative to today
  const today = new Date();
  const formatOffset = (daysAgo) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const sampleTransactions = [
    { type: 'income', amount: 4800, category: 'Salary', date: formatOffset(10), desc: 'Monthly Tech Salary', method: 'Bank Transfer' },
    { type: 'income', amount: 750, category: 'Freelance', date: formatOffset(5), desc: 'Frontend UI Project', method: 'Bank Transfer' },
    { type: 'income', amount: 210, category: 'Investments', date: formatOffset(8), desc: 'Dividend Payout', method: 'Bank Transfer' },
    { type: 'expense', amount: 1350, category: 'Housing & Rent', date: formatOffset(9), desc: 'Monthly Apartment Rent', method: 'Bank Transfer' },
    { type: 'expense', amount: 165, category: 'Utilities', date: formatOffset(7), desc: 'Electricity & High-speed Internet', method: 'Card' },
    { type: 'expense', amount: 94.50, category: 'Food & Dining', date: formatOffset(6), desc: 'Weekly Whole Foods Groceries', method: 'Card' },
    { type: 'expense', amount: 45.20, category: 'Food & Dining', date: formatOffset(4), desc: 'Dinner with colleagues', method: 'Card' },
    { type: 'expense', amount: 62.00, category: 'Transportation', date: formatOffset(3), desc: 'Gas Station Refill', method: 'Card' },
    { type: 'expense', amount: 28.50, category: 'Transportation', date: formatOffset(2), desc: 'Uber ride across downtown', method: 'UPI' },
    { type: 'expense', amount: 120.00, category: 'Shopping', date: formatOffset(2), desc: 'Running Shoes & Sports Gear', method: 'Card' },
    { type: 'expense', amount: 19.99, category: 'Entertainment', date: formatOffset(5), desc: 'Streaming Subscriptions', method: 'Card' },
    { type: 'expense', amount: 75.00, category: 'Healthcare', date: formatOffset(1), desc: 'Dental Checkup & Vitamins', method: 'Card' },
    { type: 'expense', amount: 35.00, category: 'Food & Dining', date: formatOffset(0), desc: 'Artisan Cafe & Bakery', method: 'Cash' }
  ];

  for (const t of sampleTransactions) {
    const catId = catMap[t.category];
    if (catId) {
      db.run(
        "INSERT INTO transactions (type, amount, category_id, date, description, payment_method) VALUES (?, ?, ?, ?, ?, ?)",
        [t.type, t.amount, catId, t.date, t.desc, t.method]
      );
    }
  }
}

