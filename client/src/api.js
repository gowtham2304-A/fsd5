const API_BASE = '/api';

export const api = {
  // Health
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Transactions
  getTransactions: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.append('type', params.type);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);

    const res = await fetch(`${API_BASE}/transactions?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  createTransaction: async (data) => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create transaction');
    }
    return res.json();
  },

  updateTransaction: async (id, data) => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update transaction');
    }
    return res.json();
  },

  deleteTransaction: async (id) => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
    return res.json();
  },

  batchImport: async (transactions) => {
    const res = await fetch(`${API_BASE}/transactions/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions })
    });
    if (!res.ok) throw new Error('Failed to import transactions');
    return res.json();
  },

  // Categories
  getCategories: async (type = '') => {
    const query = type ? `?type=${type}` : '';
    const res = await fetch(`${API_BASE}/categories${query}`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  createCategory: async (data) => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create category');
    }
    return res.json();
  },

  updateCategory: async (id, data) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  deleteCategory: async (id) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  },

  // Budgets
  getBudgets: async (month = '') => {
    const query = month ? `?month=${month}` : '';
    const res = await fetch(`${API_BASE}/budgets${query}`);
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return res.json();
  },

  updateBudgetLimit: async (categoryId, limit) => {
    const res = await fetch(`${API_BASE}/budgets/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget_limit: limit })
    });
    if (!res.ok) throw new Error('Failed to update budget limit');
    return res.json();
  },

  // Analytics
  getSummary: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/analytics/summary?${query}`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  },

  getByCategory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/analytics/by-category?${query}`);
    if (!res.ok) throw new Error('Failed to fetch category analytics');
    return res.json();
  },

  getMonthlyTrend: async () => {
    const res = await fetch(`${API_BASE}/analytics/monthly-trend`);
    if (!res.ok) throw new Error('Failed to fetch monthly trend');
    return res.json();
  },

  getByPaymentMethod: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/analytics/by-payment-method?${query}`);
    if (!res.ok) throw new Error('Failed to fetch payment method analytics');
    return res.json();
  }
};

