// src/pages/products/ProductsPage.jsx

import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  TextField, InputAdornment, Chip, Avatar,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Grid, Tooltip,
  Divider
} from '@mui/material';
import {
  Add, Search, Edit, Delete, Inventory,
  Close, CloudUpload, QrCode, CreateNewFolder
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ── QUICK ADD CATEGORY DIALOG ─────────────────────────
const QuickCategoryDialog = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', description: '' });

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

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required!');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Typography variant="h6" fontWeight={600}>
          Add New Category
        </Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Category Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Electronics"
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description..."
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={createMutation.isPending}
          sx={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' }
          }}
        >
          {createMutation.isPending ? 'Creating...' : 'Create Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── ADD/EDIT PRODUCT DIALOG ───────────────────────────
const ProductDialog = ({ open, onClose, editProduct, categories }) => {
  const queryClient = useQueryClient();
  const [quickCatOpen, setQuickCatOpen] = useState(false);

  const [formData, setFormData] = useState({
    name:          editProduct?.name          || '',
    description:   editProduct?.description   || '',
    costPrice:     editProduct?.costPrice      || '',
    sellingPrice:  editProduct?.sellingPrice   || '',
    stockQuantity: editProduct?.stockQuantity  || '',
    lowStockAlert: editProduct?.lowStockAlert  || 5,
    unit:          editProduct?.unit           || 'pcs',
    sku:           editProduct?.sku            || '',
    categoryId:    editProduct?.categoryId     || '',
  });
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(editProduct?.image || null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const createMutation = useMutation({
    mutationFn: (data) => productAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product created! ✅');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create product.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => productAPI.update(editProduct.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product updated! ✅');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update product.');
    }
  });

  const handleSubmit = () => {
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });
    if (image) data.append('image', image);
    editProduct ? updateMutation.mutate(data) : createMutation.mutate(data);
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <Typography variant="h6" fontWeight={600}>
            {editProduct ? 'Edit Product' : 'Add New Product'}
          </Typography>
          <IconButton onClick={onClose}><Close /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Grid container spacing={2} sx={{ pt: 1 }}>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Box
                sx={{
                  border: '2px dashed #e2e8f0', borderRadius: 2,
                  p: 3, textAlign: 'center', cursor: 'pointer',
                  '&:hover': { borderColor: '#2563eb', bgcolor: '#f0f4ff' },
                  transition: 'all 0.2s'
                }}
                onClick={() => document.getElementById('product-image').click()}
              >
                {preview ? (
                  <Box>
                    <img
                      src={preview} alt="preview"
                      style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <Typography variant="caption" display="block" mt={1} color="text.secondary">
                      Click to change image
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUpload sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Click to upload product image
                    </Typography>
                  </Box>
                )}
                <input
                  id="product-image" type="file"
                  accept="image/*" hidden
                  onChange={handleImageChange}
                />
              </Box>
            </Grid>

            {/* Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Product Name *" name="name"
                value={formData.name} onChange={handleChange}
              />
            </Grid>

            {/* SKU */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="SKU" name="sku"
                value={formData.sku} onChange={handleChange}
                placeholder="e.g. ELEC-001"
              />
            </Grid>

            {/* Cost Price */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Cost Price (Rs.) *" name="costPrice"
                type="number" value={formData.costPrice} onChange={handleChange}
              />
            </Grid>

            {/* Selling Price */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Selling Price (Rs.) *" name="sellingPrice"
                type="number" value={formData.sellingPrice} onChange={handleChange}
              />
            </Grid>

            {/* Stock */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Stock Quantity *" name="stockQuantity"
                type="number" value={formData.stockQuantity} onChange={handleChange}
              />
            </Grid>

            {/* Low Stock */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Low Stock Alert" name="lowStockAlert"
                type="number" value={formData.lowStockAlert} onChange={handleChange}
              />
            </Grid>

            {/* Unit */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth select label="Unit" name="unit"
                value={formData.unit} onChange={handleChange}
              >
                {['pcs', 'kg', 'g', 'l', 'ml', 'box', 'pack'].map(u => (
                  <MenuItem key={u} value={u}>{u}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Category with Quick Add Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  sx={{ flex: 1 }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: { style: { maxHeight: 300 } }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em style={{ color: '#9ca3af' }}>-- Select a Category --</em>
                  </MenuItem>
                  {categories && categories.length > 0 ? (
                    categories.map(cat => (
                      <MenuItem key={cat.id} value={cat.id} sx={{ py: 1.5 }}>
                        {cat.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <em style={{ color: '#ef4444' }}>
                        No categories yet — click + to add one!
                      </em>
                    </MenuItem>
                  )}
                </TextField>

                {/* Quick Add Category Button */}
                <Tooltip title="Add New Category">
                  <Button
                    variant="outlined"
                    onClick={() => setQuickCatOpen(true)}
                    sx={{
                      minWidth: 56, height: 56,
                      borderColor: '#2563eb', color: '#2563eb',
                      '&:hover': { bgcolor: '#eff6ff' }
                    }}
                  >
                    <Add />
                  </Button>
                </Tooltip>
              </Box>

              {/* Helper text */}
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                Can't find your category? Click + to create a new one instantly!
              </Typography>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth label="Description" name="description"
                value={formData.description} onChange={handleChange}
                multiline rows={3}
                placeholder="Enter product description..."
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
            {loading ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Add Category Dialog */}
      <QuickCategoryDialog
        open={quickCatOpen}
        onClose={() => setQuickCatOpen(false)}
      />
    </>
  );
};

// ── MAIN PRODUCTS PAGE ────────────────────────────────
const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch]           = useState('');
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn:  () => productAPI.getAll().then(r => r.data.products),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoryAPI.getAll().then(r => r.data.categories),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product deleted!');
    },
    onError: () => toast.error('Failed to delete product.')
  });

  const handleEdit = (product) => {
    setEditProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditProduct(null);
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      field: 'image', headerName: 'Image', width: 80, sortable: false,
      renderCell: (params) => (
        <Avatar
          src={params.value ? `http://localhost:8000/${params.value}` : ''}
          variant="rounded" sx={{ width: 40, height: 40 }}
        >
          <Inventory />
        </Avatar>
      )
    },
    { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 150 },
    { field: 'sku',  headerName: 'SKU', width: 120 },
    {
      field: 'sellingPrice', headerName: 'Price (Rs.)', width: 130,
      renderCell: (params) => (
        <Typography fontWeight={600} color="primary">
          Rs. {Number(params.value).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'stockQuantity', headerName: 'Stock', width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value} size="small"
          color={params.value <= params.row.lowStockAlert ? 'error' : 'success'}
          variant="outlined"
        />
      )
    },
    {
      field: 'category', headerName: 'Category', width: 130,
      renderCell: (params) => (
        <Chip
          label={params.row.category?.name || 'N/A'}
          size="small" variant="outlined" color="primary"
        />
      )
    },
    {
      field: 'barcodeNumber', headerName: 'Barcode', width: 140,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <QrCode fontSize="small" color="action" />
          <Typography variant="caption">{params.value || 'N/A'}</Typography>
        </Box>
      )
    },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(params.row)} color="primary">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Products 📦</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage your product inventory
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
          Add Product
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            fullWidth placeholder="Search by product name or SKU..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Search color="action" /></InputAdornment>
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

      {/* Dialog */}
      {dialogOpen && (
        <ProductDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          editProduct={editProduct}
          categories={categories}
        />
      )}
    </Box>
  );
};

export default ProductsPage;