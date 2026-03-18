// src/pages/auth/ResetPasswordPage.jsx

import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, InputAdornment, IconButton
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, Store } from '@mui/icons-material';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const navigate                    = useNavigate();
  const [searchParams]              = useSearchParams();
  const token                       = searchParams.get('token');

  const [newPassword, setNewPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  // No token in URL
  if (!token) {
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" mb={2}>Invalid reset link!</Typography>
          <Link to="/forgot-password">Request a new one</Link>
        </Card>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.resetPassword({ token, newPassword });
      toast.success('Password reset successfully! Please login. 🎉');
      navigate('/login');

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <CardContent sx={{ padding: 4 }}>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: 2,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Store sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="primary">
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Enter your new password below
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
              required
              sx={{ mb: 3 }}
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
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5, fontSize: 16,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' }
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPasswordPage;

