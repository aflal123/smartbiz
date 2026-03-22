// src/pages/auth/VerifyOTPPage.jsx

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, InputAdornment
} from '@mui/material';
import { Lock, Store } from '@mui/icons-material';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const VerifyOTPPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  // Get userId and email passed from Register page
  const { userId, email } = location.state || {};

  const [otp, setOtp]         = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]     = useState('');

  // If no userId — redirect to register
  if (!userId) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" mb={2}>Session expired!</Typography>
          <Link to="/register">Go back to Register</Link>
        </Card>
      </Box>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyOTP({ userId, otp });
      const { token, user } = response.data;

      login(user, token);
      toast.success('Email verified! Welcome to SmartBiz! 🎉');
      navigate('/');

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendOTP({ userId });
      toast.success('New OTP sent to your email! 📧');
    } catch (err) {
      toast.error('Failed to resend OTP. Try again.');
    } finally {
      setResending(false);
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
              Verify Your Email
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              We sent a 6-digit code to
            </Typography>
            <Typography variant="body2" fontWeight={600} color="primary">
              {email}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleVerify}>
            <TextField
              fullWidth
              label="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => {
                // Only allow numbers, max 6 digits
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(val);
                setError('');
              }}
              required
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 6, style: { letterSpacing: 8, fontSize: 24, textAlign: 'center' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || otp.length !== 6}
              sx={{
                py: 1.5, fontSize: 16,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' }
              }}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          {/* Resend OTP */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Didn't receive the code?{' '}
              <Button
                variant="text"
                size="small"
                onClick={handleResend}
                disabled={resending}
                sx={{ fontWeight: 600, p: 0, minWidth: 'auto' }}
              >
                {resending ? 'Sending...' : 'Resend OTP'}
              </Button>
            </Typography>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
};

export default VerifyOTPPage;
