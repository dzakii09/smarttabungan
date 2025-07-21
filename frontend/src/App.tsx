import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Budgets from './pages/Budgets';
import GroupBudgets from './pages/GroupBudgets';
import GroupBudgetDetail from './pages/GroupBudgetDetail';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';

import PaymentGateway from './pages/PaymentGateway';
import DataImportExport from './pages/DataImportExport';
import ExternalServices from './pages/ExternalServices';
import Settings from './pages/Settings';
import { Toaster } from 'sonner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useApp();

  return (
    <Router>
      <Routes>
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/transactions" element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              } />
              <Route path="/budgets" element={
                <ProtectedRoute>
                  <Budgets />
                </ProtectedRoute>
              } />
              <Route path="/tabungan-bersama" element={
                <ProtectedRoute>
                  <GroupBudgets />
                </ProtectedRoute>
              } />
              <Route path="/tabungan-bersama/:id" element={
                <ProtectedRoute>
                  <GroupBudgetDetail />
                </ProtectedRoute>
              } />
              <Route path="/goals" element={
                <ProtectedRoute>
                  <Goals />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/chatbot" element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              } />
              <Route path="/payment-gateway" element={
                <ProtectedRoute>
                  <PaymentGateway />
                </ProtectedRoute>
              } />
              <Route path="/data-import-export" element={
                <ProtectedRoute>
                  <DataImportExport />
                </ProtectedRoute>
              } />
              <Route path="/external-services" element={
                <ProtectedRoute>
                  <ExternalServices />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

// Main App Component
const App: React.FC = () => {
  console.log('🔍 Debug: App component rendering...');
  
  return (
    <AppProvider>
      <Toaster richColors position="top-center" />
      <AppRoutes />
    </AppProvider>
  );
};

export default App;