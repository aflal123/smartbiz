// src/App.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// ── AUTH PAGES ────────────────────────────────────────
import LoginPage           from './pages/auth/LoginPage';
import RegisterPage        from './pages/auth/RegisterPage';
import VerifyOTPPage       from './pages/auth/VerifyOTPPage';
import ForgotPasswordPage  from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage   from './pages/auth/ResetPasswordPage';

// ── APP PAGES ─────────────────────────────────────────
import DashboardPage  from './pages/dashboard/DashboardPage';
import ProductsPage   from './pages/products/ProductsPage';
import CustomersPage  from './pages/customers/CustomersPage';
import SuppliersPage  from './pages/suppliers/SuppliersPage';
import SalesPage      from './pages/sales/SalesPage';
import ExpensesPage   from './pages/expenses/ExpensesPage';
import AIPage         from './pages/ai/AIPage';


// ── LAYOUT ───────────────────────────────────────────
import MainLayout from './components/layout/MainLayout';

// ── PROTECTED ROUTE ───────────────────────────────────
// If not logged in → redirect to login page
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#2563eb'
      }}>
        Loading SmartBiz...
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Routes>
      {/* ── PUBLIC ROUTES ──────────────────────────── */}
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/register"        element={<RegisterPage />} />
      <Route path="/verify-otp"      element={<VerifyOTPPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />

      {/* ── PROTECTED ROUTES ───────────────────────── */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index            element={<DashboardPage />} />
        <Route path="products"  element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="sales"     element={<SalesPage />} />
        <Route path="expenses"  element={<ExpensesPage />} />
        
        <Route path="ai"        element={<AIPage />} />
      </Route>

      {/* Catch all unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
