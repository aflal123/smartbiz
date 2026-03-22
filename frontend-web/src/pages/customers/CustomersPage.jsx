

import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  TextField, InputAdornment, Chip, Avatar,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Tooltip
} from '@mui/material';
import {
  Add, Search, Edit, Delete, People,
  Close, Phone, Email, LocationOn
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ── ADD/EDIT CUSTOMER DIALOG ──────────────────────────
const CustomerDialog = ({ open, onClose, editCustomer }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name:    editCustomer?.name    || '',
    email:   editCustomer?.email   || '',
    phone:   editCustomer?.phone   || '',
    address: editCustomer?.address || '',
    notes:   editCustomer?.notes   || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createMutation = useMutation({
    mutationFn: (data) => customerAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      toast.success('Customer added! ✅');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add customer.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => customerAPI.update(editCustomer.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      toast.success('Customer updated! ✅');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update customer.');
    }
  });

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Name and phone are required!');
      return;
    }
    editCustomer ? updateMutation.mutate(formData) : createMutation.mutate(formData);
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open} onClose={onClose}
      maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Typography variant="h6" fontWeight={600}>
          {editCustomer ? 'Edit Customer' : 'Add New Customer'}
        </Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 1 }}>

          <Grid item xs={12}>
            <TextField
              fullWidth label="Full Name *" name="name"
              value={formData.name} onChange={handleChange}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <People color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Phone *" name="phone"
              value={formData.phone} onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Email" name="email"
              type="email" value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth label="Address" name="address"
              value={formData.address} onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth label="Notes" name="notes"
              value={formData.notes} onChange={handleChange}
              multiline rows={3}
              placeholder="Any additional notes..."
            />
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' }
          }}
        >
          {loading ? 'Saving...' : editCustomer ? 'Update Customer' : 'Add Customer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── MAIN CUSTOMERS PAGE ───────────────────────────────
const CustomersPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch]             = useState('');
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn:  () => customerAPI.getAll().then(r => r.data.customers),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => customerAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      toast.success('Customer deleted!');
    },
    onError: () => toast.error('Failed to delete customer.')
  });

  const handleEdit = (customer) => {
    setEditCustomer(customer);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditCustomer(null);
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{
            width: 36, height: 36,
            fontSize: 14, fontWeight: 700,
            flexShrink: 0,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)'
          }}>
            {params.value?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '—'}
        </Typography>
      )
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Phone fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '—'}
        </Typography>
      )
    },
    {
      field: 'outstandingBalance',
      headerName: 'Balance',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={`Rs. ${Number(params.value || 0).toLocaleString()}`}
          size="small"
          color={params.value > 0 ? 'warning' : 'success'}
          variant="outlined"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
      width: 120,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row)}
              color="primary"
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
              color="error"
            >
              <Delete fontSize="small" />
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
          <Typography variant="h4" fontWeight={700}>Customers 👥</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage your customer relationships
          </Typography>
        </Box>
        <Button
          variant="contained" startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' }
          }}
        >
          Add Customer
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
              <Avatar sx={{
                width: 52, height: 52,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)'
              }}>
                <People />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {customers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Customers
                </Typography>
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
            placeholder="Search by name, phone or email..."
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
          rows={filtered}
          columns={columns}
          loading={isLoading}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } }
          }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8fafc',
              fontWeight: 600
            },
            '& .MuiDataGrid-row:hover': { backgroundColor: '#f8fafc' },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center'
            }
          }}
        />
      </Card>

      {/* Dialog */}
      {dialogOpen && (
        <CustomerDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          editCustomer={editCustomer}
        />
      )}

    </Box>
  );
};

export default CustomersPage;