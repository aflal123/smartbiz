import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  TextField, InputAdornment, Chip, Avatar,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Tooltip, MenuItem
} from '@mui/material';
import {
  Add, Search, Edit, Delete,
  Close, AccountBalance
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'rent', 'salaries', 'utilities',
  'supplies', 'transport', 'marketing',
  'maintenance', 'other'
];

// ── ADD/EDIT EXPENSE DIALOG ───────────────────────────
const ExpenseDialog = ({ open, onClose, editExpense }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title:       editExpense?.title       || '',
    amount:      editExpense?.amount      || '',
    category:    editExpense?.category    || 'other',
    expenseDate: editExpense?.expenseDate || new Date().toISOString().split('T')[0],
    notes:       editExpense?.notes       || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createMutation = useMutation({
    mutationFn: (data) => expenseAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      toast.success('Expense recorded! ✅');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to record expense.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => expenseAPI.update(editExpense.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      toast.success('Expense updated! ✅');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update expense.');
    }
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.amount) {
      toast.error('Title and amount are required!');
      return;
    }
    editExpense ? updateMutation.mutate(formData) : createMutation.mutate(formData);
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
          {editExpense ? 'Edit Expense' : 'Record New Expense'}
        </Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 1 }}>

          {/* Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth label="Expense Title *" name="title"
              value={formData.title} onChange={handleChange}
              autoFocus placeholder="e.g. Office Rent March"
            />
          </Grid>

          {/* Amount */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Amount (Rs.) *" name="amount"
              type="number" value={formData.amount}
              onChange={handleChange}
            />
          </Grid>

          {/* Category */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth select label="Category" name="category"
              value={formData.category} onChange={handleChange}
            >
              {CATEGORIES.map(cat => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Date */}
          <Grid item xs={12}>
            <TextField
              fullWidth label="Expense Date" name="expenseDate"
              type="date" value={formData.expenseDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Notes */}
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
          {loading ? 'Saving...' : editExpense ? 'Update Expense' : 'Record Expense'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── CATEGORY COLORS ───────────────────────────────────
const categoryColors = {
  rent:        '#ef4444',
  salaries:    '#f59e0b',
  utilities:   '#3b82f6',
  supplies:    '#10b981',
  transport:   '#8b5cf6',
  marketing:   '#ec4899',
  maintenance: '#f97316',
  other:       '#6b7280',
};

// ── MAIN EXPENSES PAGE ────────────────────────────────
const ExpensesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch]           = useState('');
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [filterCat, setFilterCat]     = useState('');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn:  () => expenseAPI.getAll().then(r => r.data.expenses),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => expenseAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      toast.success('Expense deleted!');
    },
    onError: () => toast.error('Failed to delete expense.')
  });

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditExpense(null);
  };

  // Filter
  const filtered = expenses.filter(e => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat ? e.category === filterCat : true;
    return matchSearch && matchCat;
  });

  // Total expenses
  const totalExpenses = filtered.reduce(
    (sum, e) => sum + Number(e.amount), 0
  );

  const columns = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{
            width: 36, height: 36, flexShrink: 0,
            bgcolor: `${categoryColors[params.row.category]}20`,
          }}>
            <AccountBalance sx={{
              fontSize: 18,
              color: categoryColors[params.row.category]
            }} />
          </Avatar>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} color="error.main">
          Rs. {Number(params.value).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value?.charAt(0).toUpperCase() + params.value?.slice(1)}
          size="small"
          sx={{
            bgcolor: `${categoryColors[params.value]}20`,
            color: categoryColors[params.value],
            fontWeight: 600,
            border: `1px solid ${categoryColors[params.value]}40`
          }}
        />
      )
    },
    {
      field: 'expenseDate',
      headerName: 'Date',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'notes',
      headerName: 'Notes',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '—'}
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
              size="small" color="primary"
              onClick={() => handleEdit(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small" color="error"
              onClick={() => handleDelete(params.row.id)}
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
          <Typography variant="h4" fontWeight={700}>Expenses 💸</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Track your business expenses
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
          Record Expense
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
              <Avatar sx={{
                width: 52, height: 52,
                background: 'linear-gradient(135deg, #ef4444, #dc2626)'
              }}>
                <AccountBalance />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  Rs. {totalExpenses.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Expenses
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
              <Avatar sx={{
                width: 52, height: 52,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)'
              }}>
                <AccountBalance />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {expenses.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Records
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search + Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                placeholder="Search expenses..."
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
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth select label="Filter by Category"
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {CATEGORIES.map(cat => (
                  <MenuItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
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
              backgroundColor: '#f8fafc', fontWeight: 600
            },
            '& .MuiDataGrid-row:hover': { backgroundColor: '#f8fafc' },
            '& .MuiDataGrid-cell': {
              display: 'flex', alignItems: 'center'
            }
          }}
        />
      </Card>

      {/* Dialog */}
      {dialogOpen && (
        <ExpenseDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          editExpense={editExpense}
        />
      )}

    </Box>
  );
};

export default ExpensesPage;
