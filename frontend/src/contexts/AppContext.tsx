import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User, Transaction, Budget, Goal, DashboardStats, Category } from '../types';
import api from '../api';

interface BudgetStats {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallProgress: number;
  activeBudgets: number;
  exceededBudgets: number;
  warningBudgets: number;
  onTrackBudgets: number;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  dashboardStats: DashboardStats;
  budgetStats: BudgetStats;
  setBudgetStats: (stats: BudgetStats) => void;
  updateDashboardStats: () => void;
  fetchDashboardData: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchGoals: () => Promise<void>;
  fetchBudgetStats: () => Promise<void>;
  isAuthenticated: boolean;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  fetchCategories: () => Promise<void>;
  token: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0
  });
  const [budgetStats, setBudgetStats] = useState<BudgetStats>({
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallProgress: 0,
    activeBudgets: 0,
    exceededBudgets: 0,
    warningBudgets: 0,
    onTrackBudgets: 0
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const isAuthenticated = user !== null;

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch budget stats from backend
  const fetchBudgetStats = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await api.get('/budgets/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = (res.data as any).data || res.data;
      setBudgetStats(data);
    } catch (err) {
      console.error('Error fetching budget stats:', err);
      // Set default budget stats on error
      setBudgetStats({
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallProgress: 0,
        activeBudgets: 0,
        exceededBudgets: 0,
        warningBudgets: 0,
        onTrackBudgets: 0
      });
    }
  }, []);

  // Fetch dashboard stats from backend
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await api.get('/transactions/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = (res.data as any).data || res.data;
      setDashboardStats({
        totalBalance: data.balance || 0,
        monthlyIncome: data.totalIncome || 0,
        monthlyExpenses: data.totalExpense || 0,
        savingsRate: data.totalIncome > 0
          ? ((data.totalIncome - data.totalExpense) / data.totalIncome) * 100
          : 0,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }, []);

  // Fetch transactions from backend
  const fetchTransactions = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await api.get('/transactions?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle different response structures
      let transactionsData;
      if ((res.data as any).transactions) {
        // Response has transactions property
        transactionsData = (res.data as any).transactions;
      } else if (Array.isArray(res.data)) {
        // Response is directly an array
        transactionsData = res.data;
      } else {
        // Response has data property
        transactionsData = (res.data as any).data || [];
      }
      
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  }, []);

  // Fetch goals from backend
  const fetchGoals = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await api.get('/goals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = (res.data as any).data || res.data;
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching goals:', err);
    }
  }, []);

  // Fetch categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await api.get('/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = (res.data as any).data || res.data;
      console.log('Fetched categories:', data);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Update dashboard stats (re-fetch from backend)
  const updateDashboardStats = () => {
    fetchDashboardData();
  };

  // Fetch data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      fetchTransactions();
      fetchGoals();
      fetchCategories();
      fetchBudgetStats();
    }
  }, [isAuthenticated, fetchDashboardData, fetchTransactions, fetchGoals, fetchCategories, fetchBudgetStats]);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      transactions,
      setTransactions,
      budgets,
      setBudgets,
      goals,
      setGoals,
      dashboardStats,
      budgetStats,
      setBudgetStats,
      updateDashboardStats,
      fetchDashboardData,
      fetchTransactions,
      fetchGoals,
      fetchBudgetStats,
      isAuthenticated,
      categories,
      setCategories,
      fetchCategories,
      token
    }}>
      {children}
    </AppContext.Provider>
  );
};