// src/pages/auth/ForgotPasswordPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField,
  Button, Typography, Alert, InputAdornment
} from '@mui/material';
import { Email, Store, ArrowBack } from '@mui/icons-material';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword({ email });
      setSubmitted(true);
      toast.success('Reset link sent to your email! 📧');

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email.');
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

          {/* Logo */}
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
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Enter your email and we'll send you a reset link
            </Typography>
          </Box>

          {/* Success State */}
          {submitted ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Reset link sent to <strong>{email}</strong>!
                Check your inbox and follow the instructions.
              </Alert>
              <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>
                Back to Login
              </Link>
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
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
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Link
                  to="/login"
                  style={{ color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <ArrowBack fontSize="small" /> Back to Login
                </Link>
              </Box>
            </>
          )}

        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordPage;