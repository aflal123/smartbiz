// src/pages/dashboard/DashboardPage.jsx

import {
  Box, Grid, Card, CardContent, Typography,
  Avatar, List, ListItem, ListItemAvatar,
  ListItemText, Divider, CircularProgress, Alert
} from '@mui/material';
import {
  Business, Receipt, TrendingUp,
  PersonAdd, Store, People
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color={color}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, width: 52, height: 52 }}>
          <Box sx={{ color }}>{icon}</Box>
        </Avatar>
      </Box>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn:  () => adminAPI.getStats().then(r => r.data.stats),
  });

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress />
    </Box>
  );

  if (error) return <Alert severity="error">Failed to load stats.</Alert>;

  return (
    <Box>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Admin Dashboard 🔒
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          System-wide overview of SmartBiz platform
        </Typography>
      </Box>

      {/* Total Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Businesses"
            value={stats?.totals?.users || 0}
            icon={<Business />}
            color="#1e1b4b"
            subtitle="Registered businesses"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sales"
            value={stats?.totals?.sales || 0}
            icon={<Receipt />}
            color="#10b981"
            subtitle="All time sales"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={stats?.totals?.products || 0}
            icon={<Store />}
            color="#f59e0b"
            subtitle="Across all businesses"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`Rs. ${Number(stats?.totals?.revenue || 0).toLocaleString()}`}
            icon={<TrendingUp />}
            color="#2563eb"
            subtitle="Platform wide revenue"
          />
        </Grid>
      </Grid>

      {/* This Month */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#1e1b4b', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                New Businesses This Month
              </Typography>
              <Typography variant="h3" fontWeight={700} mt={1}>
                {stats?.thisMonth?.newUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#10b981', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Sales This Month
              </Typography>
              <Typography variant="h3" fontWeight={700} mt={1}>
                {stats?.thisMonth?.sales || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#2563eb', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Revenue This Month
              </Typography>
              <Typography variant="h4" fontWeight={700} mt={1}>
                Rs. {Number(stats?.thisMonth?.revenue || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Users + Top Businesses */}
      <Grid container spacing={3}>

        {/* Recent Registrations */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonAdd color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Recent Registrations
                </Typography>
              </Box>
              <List disablePadding>
                {stats?.recentUsers?.map((user, index) => (
                  <Box key={user.id}>
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{
                          width: 38, height: 38, fontSize: 14,
                          background: 'linear-gradient(135deg, #1e1b4b, #7c3aed)'
                        }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={user.businessName || user.email}
                        primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                        secondaryTypographyProps={{ fontSize: 12 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </ListItem>
                    {index < stats.recentUsers.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Businesses */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUp color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Top Businesses by Revenue
                </Typography>
              </Box>
              <List disablePadding>
                {stats?.topBusinesses?.map((business, index) => (
                  <Box key={index}>
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{
                          width: 36, height: 36, fontSize: 13,
                          bgcolor: ['#1e1b4b','#2563eb','#10b981','#f59e0b','#ef4444'][index]
                        }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={business.owner?.businessName || business.owner?.name}
                        secondary={`${business.salesCount} sales`}
                        primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                        secondaryTypographyProps={{ fontSize: 12 }}
                      />
                      <Typography variant="body2" fontWeight={700} color="success.main">
                        Rs. {Number(business.totalRevenue).toLocaleString()}
                      </Typography>
                    </ListItem>
                    {index < stats.topBusinesses.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default DashboardPage;