# fsd5 — SpendFlow Expense & Budget Tracker

A modern, full-stack financial tracking application built with **React**, **Node.js/Express**, and an embedded **SQLite** database.

---

## ✨ Features

- 📊 **Visual Financial Analytics**:
  - Interactive **Category Breakdown** (Donut / Pie chart with custom tooltips & percentage shares).
  - Multi-month **Income vs. Expense Trend** bar graphs.
  - **Payment Channels** distribution (Card, Cash, Bank Transfer, UPI).
- 💰 **Income & Expense Tracking**:
  - Filter transactions by type (All, Expense, Income), category, date range, or keyword search.
  - Add, edit, and delete transactions with instant balance updates.
- 🎯 **Monthly Budgets & Alerts**:
  - Define custom monthly spending caps per category.
  - Visual status progress bars: **On Track** (<80%), **Near Limit** (80-99%), and **Over Budget** (≥100%).
  - Quick inline budget limit editing.
- 🏷️ **Category Management**:
  - Custom categories with custom color palettes and icons.
- 💾 **Data Persistence & Portability**:
  - Embedded **SQLite database** stored locally in `server/expenses.db`.
  - One-click **Export to CSV**.
  - **Batch Import** from CSV or JSON format.
- 🌐 **Multi-Currency Support**:
  - Seamlessly switch between `$ USD`, `€ EUR`, `£ GBP`, `₹ INR`, `¥ JPY`, `C$ CAD`, `A$ AUD`.

---

## 🏗️ Project Architecture

```
expense-tracker/
├── server/
│   ├── index.js              # Express REST API server & static file serving
│   ├── db.js                 # SQLite database initialization & query helpers
│   ├── expenses.db           # SQLite database file (created automatically)
│   ├── package.json
│   └── routes/
│       ├── transactions.js   # CRUD & batch operations
│       ├── categories.js     # Category management
│       ├── budgets.js        # Budget limits & month spend calculation
│       └── analytics.js      # Aggregations, pie chart & trend calculations
├── client/
│   ├── src/
│   │   ├── components/       # StatsOverview, AnalyticsCharts, TransactionList, etc.
│   │   ├── api.js            # Frontend API client
│   │   ├── App.jsx           # Main application view & state
│   │   └── index.css         # Tailwind CSS styling
│   ├── vite.config.js        # Vite config with /api proxy to localhost:5000
│   └── package.json
├── package.json              # Root orchestration scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Open your terminal in the project directory:

```bash
# In the root expense-tracker directory:
cd "C:\Users\gowtham\.gemini\antigravity\scratch\expense-tracker"

# Install root, backend, and frontend dependencies:
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Run in Development Mode
To run both the backend server (port `5000`) and the Vite React frontend (port `5173`) concurrently:

```bash
npm run dev
```

Then open your browser at **`http://localhost:5173`**.

### 3. Build & Run Single Production Server
You can also compile the React frontend into static assets served directly by the Express server on a single port:

```bash
npm run build:client
npm start
```
Then visit **`http://localhost:5000`**.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck and timestamp |
| `GET` | `/api/transactions` | Query transactions with search, category, type, date filters |
| `POST` | `/api/transactions` | Create a new transaction |
| `PUT` | `/api/transactions/:id` | Update an existing transaction |
| `DELETE` | `/api/transactions/:id` | Remove a transaction |
| `POST` | `/api/transactions/batch` | Batch import transactions |
| `GET` | `/api/categories` | Retrieve all categories with totals |
| `POST` | `/api/categories` | Create a new category |
| `DELETE` | `/api/categories/:id` | Delete a category |
| `GET` | `/api/budgets` | Get category spending vs monthly limits |
| `PUT` | `/api/budgets/:id` | Update category budget limit |
| `GET` | `/api/analytics/summary` | Net savings, totals, savings rate |
| `GET` | `/api/analytics/by-category` | Category share breakdown for pie chart |
| `GET` | `/api/analytics/monthly-trend` | 6-month historical income vs expense trend |
| `GET` | `/api/analytics/by-payment-method` | Breakdown by Card, Cash, UPI, Bank Transfer |
| `GET` | `/api/export/csv` | Download complete database export in CSV format |

