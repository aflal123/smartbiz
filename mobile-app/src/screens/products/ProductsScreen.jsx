import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, RefreshControl, Image, Modal,
  ScrollView
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, categoryAPI } from '../../services/api';

// ── PRODUCT CARD ──────────────────────────────────────
const ProductCard = ({ product, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.cardLeft}>
      {product.image ? (
        <Image
          source={{ uri: `http://10.0.2.2:8000/${product.image}` }}
          style={styles.productImage}
        />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <MaterialIcons name="inventory" size={28} color="#94a3b8" />
        </View>
      )}
    </View>
    <View style={styles.cardMiddle}>
      <Text style={styles.productName} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.productSku}>SKU: {product.sku || 'N/A'}</Text>
      <Text style={styles.productPrice}>
        Rs. {Number(product.sellingPrice).toLocaleString()}
      </Text>
      <View style={styles.stockRow}>
        <View style={[
          styles.stockBadge,
          {
            backgroundColor:
              product.stockQuantity <= product.lowStockAlert
                ? '#fee2e2' : '#dcfce7'
          }
        ]}>
          <Text style={[
            styles.stockText,
            {
              color:
                product.stockQuantity <= product.lowStockAlert
                  ? '#ef4444' : '#16a34a'
            }
          ]}>
            Stock: {product.stockQuantity}
          </Text>
        </View>
        {product.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category.name}</Text>
          </View>
        )}
      </View>
    </View>
    <View style={styles.cardActions}>
      <TouchableOpacity onPress={() => onEdit(product)} style={styles.editBtn}>
        <MaterialIcons name="edit" size={18} color="#2563eb" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(product.id)} style={styles.deleteBtn}>
        <MaterialIcons name="delete" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  </View>
);

// ── ADD/EDIT MODAL ────────────────────────────────────
const ProductModal = ({ visible, onClose, editProduct, categories, queryClient }) => {
  const [formData, setFormData] = useState({
    name:          editProduct?.name                       || '',
    costPrice:     editProduct?.costPrice?.toString()      || '',
    sellingPrice:  editProduct?.sellingPrice?.toString()   || '',
    stockQuantity: editProduct?.stockQuantity?.toString()  || '',
    lowStockAlert: editProduct?.lowStockAlert?.toString()  || '5',
    unit:          editProduct?.unit                       || 'pcs',
    sku:           editProduct?.sku                        || '',
    categoryId:    editProduct?.categoryId?.toString()     || '',
    description:   editProduct?.description                || '',
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    editProduct?.image
      ? `http://10.0.2.2:8000/${editProduct.image}`
      : null
  );

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // ── IMAGE PICKER ────────────────────────────────────
  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', 'Failed to pick image!');
          return;
        }
        const asset = response.assets[0];
        setImage(asset);
        setImagePreview(asset.uri);
      }
    );
  };

  const createMutation = useMutation({
    mutationFn: (data) => productAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      Alert.alert('Success! ✅', 'Product created successfully!');
      onClose();
    },
    onError: (err) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create product!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => productAPI.update(editProduct.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      Alert.alert('Success! ✅', 'Product updated successfully!');
      onClose();
    },
    onError: (err) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update product!');
    }
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.sellingPrice || !formData.stockQuantity) {
      Alert.alert('Error', 'Name, selling price and stock are required!');
      return;
    }

    // Build FormData for multipart upload
    const data = new FormData();

    Object.keys(formData).forEach(key => {
      if (formData[key] !== '') {
        data.append(key, formData[key]);
      }
    });

    // Append image if selected
    if (image) {
      data.append('image', {
        uri:  image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || 'product.jpg',
      });
    }

    editProduct ? updateMutation.mutate(data) : createMutation.mutate(data);
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Modal Header */}
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
          <MaterialIcons name="close" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>
          {editProduct ? 'Edit Product' : 'Add Product'}
        </Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={styles.modalSaveBtn}
        >
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.saveBtnText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.modalBody}
        keyboardShouldPersistTaps="handled"
      >

        {/* Image Picker */}
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={handlePickImage}
        >
          {imagePreview ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: imagePreview }}
                style={styles.imagePreview}
              />
              <View style={styles.changeImageOverlay}>
                <MaterialIcons name="camera-alt" size={20} color="#fff" />
                <Text style={styles.changeImageText}>Change Image</Text>
              </View>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="add-photo-alternate" size={48} color="#94a3b8" />
              <Text style={styles.imagePlaceholderText}>
                Tap to add product image
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Product Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Product Name *</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g. Samsung TV 55 inch"
            placeholderTextColor="#94a3b8"
            value={formData.name}
            onChangeText={(v) => handleChange('name', v)}
          />
        </View>

        {/* SKU */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>SKU</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g. ELEC-001"
            placeholderTextColor="#94a3b8"
            value={formData.sku}
            onChangeText={(v) => handleChange('sku', v)}
          />
        </View>

        {/* Prices Row */}
        <View style={styles.rowFields}>
          <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.fieldLabel}>Cost Price (Rs.) *</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="0"
              placeholderTextColor="#94a3b8"
              value={formData.costPrice}
              onChangeText={(v) => handleChange('costPrice', v)}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Selling Price (Rs.) *</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="0"
              placeholderTextColor="#94a3b8"
              value={formData.sellingPrice}
              onChangeText={(v) => handleChange('sellingPrice', v)}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Stock Row */}
        <View style={styles.rowFields}>
          <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.fieldLabel}>Stock Quantity *</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="0"
              placeholderTextColor="#94a3b8"
              value={formData.stockQuantity}
              onChangeText={(v) => handleChange('stockQuantity', v)}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Low Stock Alert</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="5"
              placeholderTextColor="#94a3b8"
              value={formData.lowStockAlert}
              onChangeText={(v) => handleChange('lowStockAlert', v)}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Unit Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Unit</Text>
          <View style={styles.chipRow}>
            {['pcs', 'kg', 'g', 'l', 'ml', 'box', 'pack'].map(unit => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.chip,
                  formData.unit === unit && styles.chipActive
                ]}
                onPress={() => handleChange('unit', unit)}
              >
                <Text style={[
                  styles.chipText,
                  formData.unit === unit && styles.chipTextActive
                ]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Category</Text>
          {categories && categories.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      formData.categoryId === cat.id.toString() && styles.chipActive
                    ]}
                    onPress={() => handleChange('categoryId', cat.id.toString())}
                  >
                    <Text style={[
                      styles.chipText,
                      formData.categoryId === cat.id.toString() && styles.chipTextActive
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.noCategoryBox}>
              <MaterialIcons name="info" size={16} color="#94a3b8" />
              <Text style={styles.noCategoryText}>
                No categories found. Add categories from web app first!
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.fieldInput, styles.textArea]}
            placeholder="Optional product description..."
            placeholderTextColor="#94a3b8"
            value={formData.description}
            onChangeText={(v) => handleChange('description', v)}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </Modal>
  );
};

// ── MAIN PRODUCTS SCREEN ──────────────────────────────
const ProductsScreen = () => {
  const queryClient                     = useQueryClient();
  const [search, setSearch]             = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editProduct, setEditProduct]   = useState(null);
  const [refreshing, setRefreshing]     = useState(false);

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['products'],
    queryFn:  () => productAPI.getAll().then(r => r.data.products),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoryAPI.getAll().then(r => r.data.categories),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productAPI.delete(id),
    onSuccess:  ()  => queryClient.invalidateQueries(['products']),
    onError:    ()  => Alert.alert('Error', 'Failed to delete product!')
  });

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
      ]
    );
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditProduct(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>{filtered.length} products</Text>
        <Text style={styles.statsText}>
          Low stock: {products.filter(p => p.stockQuantity <= p.lowStockAlert).length}
        </Text>
      </View>

      {/* Products List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inventory" size={60} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Products Yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap + to add your first product!
            </Text>
          </View>
        }
        contentContainerStyle={filtered.length === 0 && styles.emptyList}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      {modalVisible && (
        <ProductModal
          visible={modalVisible}
          onClose={handleCloseModal}
          editProduct={editProduct}
          categories={categories}
          queryClient={queryClient}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#1e293b',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 14,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardLeft: { marginRight: 12 },
  productImage: {
    width: 65,
    height: 65,
    borderRadius: 10,
  },
  productImagePlaceholder: {
    width: 65,
    height: 65,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMiddle: { flex: 1 },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  productSku: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 6,
  },
  stockRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '500',
  },
  cardActions: {
    justifyContent: 'space-around',
    paddingLeft: 8,
  },
  editBtn: {
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginBottom: 6,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 6,
  },
  emptyList: { flexGrow: 1 },

  // Modal
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    elevation: 4,
  },
  modalCloseBtn: { padding: 4 },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalSaveBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  modalBody: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },

  // Image Picker
  imagePicker: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  changeImageText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  imagePlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  imagePlaceholderText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
  },

  // Fields
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowFields: {
    flexDirection: 'row',
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  chipText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },

  // No Category
  noCategoryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noCategoryText: {
    flex: 1,
    fontSize: 13,
    color: '#94a3b8',
    marginLeft: 6,
  },
});

export default ProductsScreen;