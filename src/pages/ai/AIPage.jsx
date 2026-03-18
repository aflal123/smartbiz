// src/pages/ai/AIPage.jsx

import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  TextField, Grid, Chip, Avatar, Divider,
  CircularProgress, MenuItem, Alert
} from '@mui/material';
import {
  SmartToy, Email, Share, Chat,
  Send, Lightbulb, ContentCopy
} from '@mui/icons-material';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ── SECTION CARD ──────────────────────────────────────
const SectionCard = ({ title, icon, color, children }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Avatar sx={{ bgcolor: `${color}20`, width: 42, height: 42 }}>
          <Box sx={{ color }}>{icon}</Box>
        </Avatar>
        <Typography variant="h6" fontWeight={600}>{title}</Typography>
      </Box>
      {children}
    </CardContent>
  </Card>
);

const AIPage = () => {

  // ── INSIGHTS STATE ────────────────────────────────
  const [insights, setInsights]           = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // ── EMAIL STATE ───────────────────────────────────
  const [emailPurpose, setEmailPurpose]   = useState('');
  const [emailDetails, setEmailDetails]   = useState('');
  const [emailResult, setEmailResult]     = useState(null);
  const [loadingEmail, setLoadingEmail]   = useState(false);

  // ── SOCIAL POST STATE ─────────────────────────────
  const [platform, setPlatform]           = useState('Instagram');
  const [productName, setProductName]     = useState('');
  const [postDetails, setPostDetails]     = useState('');
  const [postResult, setPostResult]       = useState(null);
  const [loadingPost, setLoadingPost]     = useState(false);

  // ── CHAT STATE ────────────────────────────────────
  const [question, setQuestion]           = useState('');
  const [chatHistory, setChatHistory]     = useState([]);
  const [loadingChat, setLoadingChat]     = useState(false);

  // ── INSIGHT COLORS ────────────────────────────────
  const insightColors = {
    warning:  { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
    tip:      { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    positive: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  };

  // ── HANDLERS ──────────────────────────────────────
  const handleGetInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await aiAPI.insights();
      setInsights(res.data.insights);
      toast.success('AI insights ready! 🤖');
    } catch {
      toast.error('Failed to get insights.');
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleGetEmail = async () => {
    if (!emailPurpose || !emailDetails) {
      toast.error('Please fill purpose and details!');
      return;
    }
    setLoadingEmail(true);
    try {
      const res = await aiAPI.email({ purpose: emailPurpose, details: emailDetails });
      setEmailResult(res.data.email);
      toast.success('Email composed! 📧');
    } catch {
      toast.error('Failed to compose email.');
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGetPost = async () => {
    if (!productName) {
      toast.error('Please enter a product name!');
      return;
    }
    setLoadingPost(true);
    try {
      const res = await aiAPI.socialPost({ platform, productName, details: postDetails });
      setPostResult(res.data.post);
      toast.success('Post created! 📱');
    } catch {
      toast.error('Failed to create post.');
    } finally {
      setLoadingPost(false);
    }
  };

  const handleChat = async () => {
    if (!question.trim()) return;
    const userQuestion = question;
    setQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', text: userQuestion }]);
    setLoadingChat(true);
    try {
      const res = await aiAPI.chat({ question: userQuestion });
      setChatHistory(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch {
      toast.error('Failed to get answer.');
    } finally {
      setLoadingChat(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard! 📋');
  };

  return (
    <Box>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          AI Features 🤖
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Powered by OpenAI — your smart business assistant!
        </Typography>
      </Box>

      <Grid container spacing={3}>

        {/* ── BUSINESS INSIGHTS ──────────────────── */}
        <Grid item xs={12} md={6}>
          <SectionCard
            title="Business Insights"
            icon={<Lightbulb />}
            color="#f59e0b"
          >
            <Button
              fullWidth variant="contained"
              onClick={handleGetInsights}
              disabled={loadingInsights}
              startIcon={loadingInsights
                ? <CircularProgress size={16} color="inherit" />
                : <SmartToy />
              }
              sx={{
                mb: 2, py: 1.5,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                '&:hover': { background: 'linear-gradient(135deg, #d97706, #b45309)' }
              }}
            >
              {loadingInsights ? 'Analyzing...' : 'Analyze My Business'}
            </Button>

            {insights.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {insights.map((insight, i) => {
                  const style = insightColors[insight.type] || insightColors.tip;
                  return (
                    <Box key={i} sx={{
                      bgcolor: style.bg,
                      border: `1px solid ${style.border}`,
                      borderRadius: 2, p: 2
                    }}>
                      <Typography
                        variant="body2" fontWeight={700}
                        sx={{ color: style.color, mb: 0.5 }}
                      >
                        {insight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {insight.message}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <SmartToy sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Click the button to get AI insights!
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* ── EMAIL COMPOSER ──────────────────────── */}
        <Grid item xs={12} md={6}>
          <SectionCard
            title="Email Composer"
            icon={<Email />}
            color="#2563eb"
          >
            <TextField
              fullWidth label="Purpose" value={emailPurpose}
              onChange={(e) => setEmailPurpose(e.target.value)}
              placeholder="e.g. Follow up with supplier"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Details" value={emailDetails}
              onChange={(e) => setEmailDetails(e.target.value)}
              multiline rows={2}
              placeholder="e.g. Order placed 2 weeks ago, not delivered"
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth variant="contained"
              onClick={handleGetEmail}
              disabled={loadingEmail}
              startIcon={loadingEmail
                ? <CircularProgress size={16} color="inherit" />
                : <Email />
              }
              sx={{
                mb: 2, py: 1.5,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #1e40af)' }
              }}
            >
              {loadingEmail ? 'Composing...' : 'Compose Email'}
            </Button>

            {emailResult && (
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    SUBJECT
                  </Typography>
                  <Button
                    size="small" startIcon={<ContentCopy fontSize="small" />}
                    onClick={() => copyToClipboard(`Subject: ${emailResult.subject}\n\n${emailResult.body}`)}
                  >
                    Copy
                  </Button>
                </Box>
                <Typography variant="body2" fontWeight={600} mb={1}>
                  {emailResult.subject}
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  BODY
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                  {emailResult.body}
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* ── SOCIAL MEDIA POST ───────────────────── */}
        <Grid item xs={12} md={6}>
          <SectionCard
            title="Social Media Post"
            icon={<Share />}
            color="#7c3aed"
          >
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth select label="Platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  {['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok'].map(p => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth label="Product Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Samsung TV"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth label="Details" value={postDetails}
              onChange={(e) => setPostDetails(e.target.value)}
              placeholder="e.g. 50% discount this week only!"
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth variant="contained"
              onClick={handleGetPost}
              disabled={loadingPost}
              startIcon={loadingPost
                ? <CircularProgress size={16} color="inherit" />
                : <Share />
              }
              sx={{
                mb: 2, py: 1.5,
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                '&:hover': { background: 'linear-gradient(135deg, #6d28d9, #5b21b6)' }
              }}
            >
              {loadingPost ? 'Generating...' : 'Generate Post'}
            </Button>

            {postResult && (
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {platform.toUpperCase()} POST
                  </Typography>
                  <Button
                    size="small" startIcon={<ContentCopy fontSize="small" />}
                    onClick={() => copyToClipboard(postResult.post)}
                  >
                    Copy
                  </Button>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                  {postResult.post}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {postResult.hashtags?.map((tag, i) => (
                    <Chip
                      key={i}
                      label={tag.startsWith('#') ? tag : `#${tag}`}
                      size="small"
                      sx={{ bgcolor: '#ede9fe', color: '#7c3aed' }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* ── BUSINESS CHATBOT ────────────────────── */}
        <Grid item xs={12} md={6}>
          <SectionCard
            title="Business Chatbot"
            icon={<Chat />}
            color="#10b981"
          >
            {/* Chat History */}
            <Box sx={{
              minHeight: 200, maxHeight: 300,
              overflowY: 'auto', mb: 2,
              display: 'flex', flexDirection: 'column', gap: 1
            }}>
              {chatHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Chat sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Ask anything about your business!
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    e.g. "How is my business performing?"
                  </Typography>
                </Box>
              ) : (
                chatHistory.map((msg, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <Box sx={{
                      maxWidth: '80%', p: 1.5, borderRadius: 2,
                      bgcolor: msg.role === 'user' ? '#2563eb' : '#f1f5f9',
                      color: msg.role === 'user' ? 'white' : 'text.primary',
                    }}>
                      <Typography variant="body2">
                        {msg.text}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
              {loadingChat && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Box sx={{ bgcolor: '#f1f5f9', p: 1.5, borderRadius: 2 }}>
                    <CircularProgress size={16} />
                  </Box>
                </Box>
              )}
            </Box>

            {/* Input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask your business assistant..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleChat}
                disabled={loadingChat || !question.trim()}
                sx={{
                  minWidth: 50,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  '&:hover': { background: 'linear-gradient(135deg, #059669, #047857)' }
                }}
              >
                <Send fontSize="small" />
              </Button>
            </Box>
          </SectionCard>
        </Grid>

      </Grid>
    </Box>
  );
};

export default AIPage;
