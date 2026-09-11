// src/pages/auth/LoginPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, InputAdornment, IconButton
} from '@mui/material';
import {
  Email, Lock, Visibility, VisibilityOff, AdminPanelSettings
} from '@mui/icons-material';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminAuthAPI } from '../../services/api';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate  = useNavigate();
  const { login } = useAdminAuth();

  const [formData, setFormData]         = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await adminAuthAPI.login(formData);
      const { token, admin } = response.data;
      login(admin, token);
      toast.success(`Welcome, ${admin.name}! 👋`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #7c3aed 100%)',
      padding: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <CardContent sx={{ padding: 4 }}>

          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: 2,
              background: 'linear-gradient(135deg, #1e1b4b, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <AdminPanelSettings sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" fontWeight={700} color="primary">
              SmartBiz
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Admin Panel — Restricted Access
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Admin Email" name="email"
              type="email" value={formData.email}
              onChange={handleChange} required sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth label="Password" name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange} required sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit" fullWidth variant="contained"
              size="large" disabled={loading}
              sx={{
                py: 1.5, fontSize: 16,
                background: 'linear-gradient(135deg, #1e1b4b, #7c3aed)',
                '&:hover': { background: 'linear-gradient(135deg, #0f0a2e, #6d28d9)' }
              }}
            >
              {loading ? 'Signing in...' : 'Sign In to Admin Panel'}
            </Button>
          </form>

        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;