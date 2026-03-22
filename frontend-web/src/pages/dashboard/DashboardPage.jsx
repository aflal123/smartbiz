// src/pages/dashboard/DashboardPage.jsx

import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography,
  Chip, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, Divider, Button, CircularProgress, Alert
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Receipt,
  Inventory, Warning, SmartToy,
  ShoppingCart, Lightbulb
} from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI, aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ── STAT CARD COMPONENT ───────────────────────────────
const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color={color}>
            Rs. {Number(value || 0).toLocaleString()}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}15`, width: 52, height: 52 }}>
          <Box sx={{ color }}>{icon}</Box>
        </Avatar>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

// ── COUNT CARD COMPONENT ──────────────────────────────
const CountCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ bgcolor: `${color}15`, width: 52, height: 52 }}>
        <Box sx={{ color }}>{icon}</Box>
      </Avatar>
      <Box>
        <Typography variant="h4" fontWeight={700}>{value || 0}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const [aiInsights, setAiInsights] = useState([]);
  const [loadingAI, setLoadingAI]   = useState(false);

  // ── FETCH DASHBOARD DATA ──────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => dashboardAPI.get().then(r => r.data.dashboard),
  });

  // ── FETCH AI INSIGHTS ─────────────────────────────
  const handleGetInsights = async () => {
    setLoadingAI(true);
    try {
      const response = await aiAPI.insights();
      setAiInsights(response.data.insights);
      toast.success('AI insights generated! 🤖');
    } catch {
      toast.error('Failed to get AI insights.');
    } finally {
      setLoadingAI(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">Failed to load dashboard data.</Alert>
    );
  }

  // Sample chart data using real revenue
  const chartData = [
    { day: 'Mon', revenue: 45000 },
    { day: 'Tue', revenue: 78000 },
    { day: 'Wed', revenue: 56000 },
    { day: 'Thu', revenue: 92000 },
    { day: 'Fri', revenue: 120000 },
    { day: 'Sat', revenue: 85000 },
    { day: 'Sun', revenue: Number(data?.today?.revenue || 0) },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Dashboard 
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Welcome back! Here's your business overview.
        </Typography>
      </Box>

      {/* ── TODAY'S STATS ──────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Revenue"
            value={data?.today?.revenue}
            subtitle={`${data?.today?.salesCount} sales today`}
            icon={<TrendingUp />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Expenses"
            value={data?.today?.expenses}
            subtitle="Total expenses today"
            icon={<TrendingDown />}
            color="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Profit"
            value={data?.today?.profit}
            subtitle="Revenue minus expenses"
            icon={<TrendingUp />}
            color="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    This Month
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="#7c3aed">
                    Rs. {Number(data?.thisMonth?.revenue || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#7c3aed15', width: 52, height: 52 }}>
                  <Box sx={{ color: '#7c3aed' }}><Receipt /></Box>
                </Avatar>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {data?.thisMonth?.salesCount} sales this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── COUNTS ROW ─────────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={6} sm={3}>
          <CountCard
            title="Total Products"
            value={data?.inventory?.totalProducts}
            icon={<Inventory />}
            color="#2563eb"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <CountCard
            title="Total Customers"
            value={data?.counts?.customers}
            icon={<ShoppingCart />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <CountCard
            title="Total Suppliers"
            value={data?.counts?.suppliers}
            icon={<Receipt />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <CountCard
            title="Low Stock Items"
            value={data?.inventory?.lowStockCount}
            icon={<Warning />}
            color="#ef4444"
          />
        </Grid>
      </Grid>

      {/* ── CHART + RECENT SALES ───────────────────── */}
      <Grid container spacing={3} mb={3}>

        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Weekly Revenue Overview
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Sales */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Recent Sales
              </Typography>
              {data?.recentSales?.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No sales yet!
                </Typography>
              ) : (
                <List disablePadding>
                  {data?.recentSales?.slice(0, 5).map((sale, index) => (
                    <Box key={sale.id}>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#2563eb15', width: 36, height: 36 }}>
                            <Receipt sx={{ fontSize: 16, color: '#2563eb' }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={sale.invoiceNumber}
                          secondary={sale.customer?.name || 'Walk-in Customer'}
                          primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                          secondaryTypographyProps={{ fontSize: 12 }}
                        />
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          Rs. {Number(sale.finalAmount).toLocaleString()}
                        </Typography>
                      </ListItem>
                      {index < 4 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── LOW STOCK + AI INSIGHTS ─────────────────── */}
      <Grid container spacing={3}>

        {/* Low Stock Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Warning color="warning" />
                <Typography variant="h6" fontWeight={600}>
                  Low Stock Alerts
                </Typography>
              </Box>
              {data?.inventory?.lowStockProducts?.length === 0 ? (
                <Alert severity="success">All products are well stocked! </Alert>
              ) : (
                <List disablePadding>
                  {data?.inventory?.lowStockProducts?.map((product, index) => (
                    <Box key={product.id}>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#ef444415', width: 36, height: 36 }}>
                            <Inventory sx={{ fontSize: 16, color: '#ef4444' }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={product.name}
                          secondary={`Stock: ${product.stockQuantity} | Alert: ${product.lowStockAlert}`}
                          primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                          secondaryTypographyProps={{ fontSize: 12 }}
                        />
                        <Chip
                          label="Low Stock"
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      </ListItem>
                      {index < data.inventory.lowStockProducts.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* AI Insights */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SmartToy color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    AI Insights
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleGetInsights}
                  disabled={loadingAI}
                  startIcon={loadingAI ? <CircularProgress size={14} /> : <SmartToy />}
                >
                  {loadingAI ? 'Analyzing...' : 'Get Insights'}
                </Button>
              </Box>

              {aiInsights.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <SmartToy sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Click "Get Insights" to let AI analyze your business!
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {aiInsights.map((insight, index) => (
                    <Box key={index}>
                      <ListItem disablePadding sx={{ py: 1, alignItems: 'flex-start' }}>
                        <ListItemAvatar>
                          <Avatar sx={{
                            bgcolor: insight.type === 'warning' ? '#f59e0b15' :
                                     insight.type === 'positive' ? '#10b98115' : '#2563eb15',
                            width: 36, height: 36
                          }}>
                            <Lightbulb sx={{
                              fontSize: 16,
                              color: insight.type === 'warning' ? '#f59e0b' :
                                     insight.type === 'positive' ? '#10b981' : '#2563eb'
                            }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={insight.title}
                          secondary={insight.message}
                          primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                          secondaryTypographyProps={{ fontSize: 12 }}
                        />
                      </ListItem>
                      {index < aiInsights.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default DashboardPage;
