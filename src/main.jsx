// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

// ── SMARTBIZ MUI THEME ────────────────────────────────
// This customizes how ALL MUI components look!
const theme = createTheme({
  palette: {
    primary: {
      main:  '#2563eb',   // Blue — main brand color
      light: '#3b82f6',
      dark:  '#1d4ed8',
    },
    secondary: {
      main: '#7c3aed',    // Purple — secondary color
    },
    background: {
      default: '#f8fafc', // Light gray background
      paper:   '#ffffff', // White cards
    },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error:   { main: '#ef4444' },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    // Make ALL buttons look professional
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // No ALL CAPS
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 20px',
        }
      }
    },
    // Make ALL cards have nice shadow
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }
      }
    },
    // Make ALL text fields look clean
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          }
        }
      }
    }
  }
});

// React Query client — manages all API data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline /> {/* Resets browser default styles */}
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{ duration: 3000 }}
            />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)