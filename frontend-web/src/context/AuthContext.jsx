// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext(null);

// AuthProvider wraps the whole app
// Any component inside can access user data!
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // When app starts → check if user was already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Call this after successful login
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Call this when user clicks logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      loading,
      isLoggedIn: !!token  // true if token exists
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — use this in any component to get user data
// Example: const { user, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);