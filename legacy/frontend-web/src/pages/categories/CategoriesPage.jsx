

import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  TextField, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid,
  Chip, Tooltip, InputAdornment, Avatar
} from '@mui/material';
import {
  Add, Edit, Delete, Search,
  Close, Category as CategoryIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ── ADD/EDIT CATEGORY DIALOG ──────────────────────────
const CategoryDialog = ({ open, onClose, editCategory }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name:        editCategory?.name        || '',
    description: editCategory?.description || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create
  const createMutation = useMutation({
    mutationFn: (data) => categoryAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category created! ✅');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create category.');
    }
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: (data) => categoryAPI.update(editCategory.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category updated! ✅');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update category.');
    }
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required!');
      return;
    }
    if (editCategory) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Typography variant="h6" fontWeight={600}>
          {editCategory ? 'Edit Category' : 'Add New Category'}
        </Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 1 }}>

          {/* Category Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Category Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Electronics"
              autoFocus
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Enter category description..."
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
          {loading ? 'Saving...' : editCategory ? 'Update Category' : 'Add Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── MAIN CATEGORIES PAGE ──────────────────────────────
const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch]             = useState('');
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoryAPI.getAll().then(r => r.data.categories),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id) => categoryAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category deleted!');
    },
    onError: () => toast.error('Failed to delete category.')
  });

  const handleEdit = (category) => {
    setEditCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditCategory(null);
  };

  // Filter
  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Columns
  const columns = [
    {
      field: 'name',
      headerName: 'Category Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            fontSize: 14
          }}>
            {params.value?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography fontWeight={600}>{params.value}</Typography>
        </Box>
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '—'}
        </Typography>
      )
    },
    {
      field: 'products',
      headerName: 'Products',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={`${params.row.products?.length || 0} products`}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 150,
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

      {/* ── HEADER ─────────────────────────────────── */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', mb: 3
      }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Categories 🗂️
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage your product categories
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' }
          }}
        >
          Add Category
        </Button>
      </Box>

      {/* ── STATS CARD ──────────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
              <Avatar sx={{
                width: 52, height: 52,
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)'
              }}>
                <CategoryIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {categories.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Categories
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── SEARCH ─────────────────────────────────── */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            fullWidth
            placeholder="Search categories..."
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

      {/* ── CATEGORIES TABLE ────────────────────────── */}
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
              fontWeight: 600,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f8fafc',
            },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            }
          }}
        />
      </Card>

      {/* ── DIALOG ──────────────────────────────────── */}
      {dialogOpen && (
        <CategoryDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          editCategory={editCategory}
        />
      )}

    </Box>
  );
};

export default CategoriesPage;