// src/pages/businesses/BusinessesPage.jsx

import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField,
  InputAdornment, Avatar, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, Divider, Tooltip, Alert, CircularProgress
} from '@mui/material';
import {
  Search, Business, Close, ToggleOn,
  ToggleOff, Visibility, People, Receipt,
  Inventory, TrendingUp
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ── BUSINESS DETAIL DIALOG ────────────────────────────
const BusinessDetailDialog = ({ open, onClose, businessId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn:  () => adminAPI.getBusiness(businessId).then(r => r.data.business),
    enabled:  !!businessId,
  });

  return (
    <Dialog
      open={open} onClose={onClose}
      maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Typography variant="h6" fontWeight={600}>Business Details</Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : data ? (
          <Box>
            {/* Business Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{
                width: 56, height: 56, fontSize: 22,
                background: 'linear-gradient(135deg, #1e1b4b, #7c3aed)'
              }}>
                {data.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {data.businessName || data.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.email}
                </Typography>
                <Chip
                  label={data.isVerified ? 'Active' : 'Inactive'}
                  size="small"
                  color={data.isVerified ? 'success' : 'error'}
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Stats */}
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              Business Statistics
            </Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Total Sales',   value: data.stats?.sales,     icon: <Receipt />,   color: '#10b981' },
                { label: 'Products',      value: data.stats?.products,  icon: <Inventory />, color: '#2563eb' },
                { label: 'Customers',     value: data.stats?.customers, icon: <People />,    color: '#f59e0b' },
                { label: 'Total Revenue', value: `Rs. ${Number(data.stats?.revenue || 0).toLocaleString()}`, icon: <TrendingUp />, color: '#7c3aed' },
              ].map((stat) => (
                <Grid item xs={6} key={stat.label}>
                  <Box sx={{
                    bgcolor: '#f8fafc', borderRadius: 2, p: 2,
                    display: 'flex', alignItems: 'center', gap: 1.5
                  }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: `${stat.color}20` }}>
                      <Box sx={{ color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{stat.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Account Info */}
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Account Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Role:</Typography>
                <Chip label={data.role} size="small" variant="outlined" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Joined:</Typography>
                <Typography variant="body2">
                  {new Date(data.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Alert severity="error">Failed to load business details.</Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// ── MAIN BUSINESSES PAGE ──────────────────────────────
const BusinessesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch]         = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['businesses'],
    queryFn:  () => adminAPI.getBusinesses().then(r => r.data.businesses),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => adminAPI.toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['businesses']);
      toast.success('User status updated! ✅');
    },
    onError: () => toast.error('Failed to update status.')
  });

  const handleView = (id) => {
    setSelectedId(id);
    setDetailOpen(true);
  };

  const filtered = businesses.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    b.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      field: 'name', headerName: 'Owner', flex: 1, minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{
            width: 36, height: 36, fontSize: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #1e1b4b, #7c3aed)'
          }}>
            {params.value?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'businessName', headerName: 'Business', flex: 1, minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '—'}
        </Typography>
      )
    },
    {
      field: 'email', headerName: 'Email', flex: 1, minWidth: 180,
    },
    {
      field: 'stats', headerName: 'Sales', width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value?.salesCount || 0}
          size="small" color="primary" variant="outlined"
        />
      )
    },
    {
      field: 'isVerified', headerName: 'Status', width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'error'}
        />
      )
    },
    {
      field: 'createdAt', headerName: 'Joined', width: 120,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'actions', headerName: 'Actions', width: 130, sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small" color="primary"
              onClick={() => handleView(params.row.id)}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.isVerified ? 'Deactivate' : 'Activate'}>
            <IconButton
              size="small"
              color={params.row.isVerified ? 'error' : 'success'}
              onClick={() => toggleMutation.mutate(params.row.id)}
            >
              {params.row.isVerified
                ? <ToggleOff fontSize="small" />
                : <ToggleOn fontSize="small" />
              }
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box>

      {/* Header */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', mb: 3
      }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Businesses 🏢</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage all registered businesses
          </Typography>
        </Box>
        <Chip
          label={`${businesses.length} Total`}
          color="primary" variant="outlined"
        />
      </Box>

      {/* Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#1e1b4b20', width: 44, height: 44 }}>
                <Business sx={{ color: '#1e1b4b' }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {businesses.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">Total</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#10b98120', width: 44, height: 44 }}>
                <Business sx={{ color: '#10b981' }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {businesses.filter(b => b.isVerified).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">Active</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            fullWidth
            placeholder="Search by name, business or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              )
            }}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <DataGrid
          rows={filtered} columns={columns}
          loading={isLoading} autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f8fafc', fontWeight: 600 },
            '& .MuiDataGrid-row:hover': { backgroundColor: '#f8fafc' },
            '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' }
          }}
        />
      </Card>

      {/* Detail Dialog */}
      {detailOpen && (
        <BusinessDetailDialog
          open={detailOpen}
          onClose={() => { setDetailOpen(false); setSelectedId(null); }}
          businessId={selectedId}
        />
      )}

    </Box>
  );
};

export default BusinessesPage;