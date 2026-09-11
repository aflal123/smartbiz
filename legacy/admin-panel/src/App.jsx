// src/App.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from './context/AdminAuthContext';
import LoginPage      from './pages/auth/LoginPage';
import DashboardPage  from './pages/dashboard/DashboardPage';
import BusinessesPage from './pages/businesses/BusinessesPage';
import MainLayout     from './components/layout/MainLayout';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAdminAuth();
  if (loading) return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      alignItems: 'center', height: '100vh',
      fontSize: 18, color: '#1e1b4b'
    }}>
      Loading SmartBiz Admin...
    </div>
  );
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    }>
      <Route index             element={<DashboardPage />} />
      <Route path="businesses" element={<BusinessesPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

export default App;