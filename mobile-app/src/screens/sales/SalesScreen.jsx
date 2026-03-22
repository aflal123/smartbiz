import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, RefreshControl, Modal, ScrollView
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleAPI, customerAPI, productAPI } from '../../services/api';

// ── SALE CARD ─────────────────────────────────────────
const SaleCard = ({ sale, onView, onCancel }) => (
  <TouchableOpacity style={styles.card} onPress={() => onView(sale)}>
    <View style={styles.cardHeader}>
      <View style={styles.invoiceRow}>
        <MaterialIcons name="receipt" size={18} color="#2563eb" />
        <Text style={styles.invoiceNumber}>{sale.invoiceNumber}</Text>
      </View>
      <View style={[
        styles.statusBadge,
        {
          backgroundColor:
            sale.status === 'paid'      ? '#dcfce7' :
            sale.status === 'cancelled' ? '#fee2e2' : '#fef3c7'
        }
      ]}>
        <Text style={[
          styles.statusText,
          {
            color:
              sale.status === 'paid'      ? '#16a34a' :
              sale.status === 'cancelled' ? '#ef4444' : '#d97706'
          }
        ]}>
          {sale.status?.toUpperCase()}
        </Text>
      </View>
    </View>

    <View style={styles.cardBody}>
      <View style={styles.customerRow}>
        <MaterialIcons name="person" size={14} color="#94a3b8" />
        <Text style={styles.customerName}>
          {sale.customer?.name || 'Walk-in Customer'}
        </Text>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.paymentBadge}>
          <Text style={styles.paymentText}>
            {sale.paymentMethod?.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.saleAmount}>
          Rs. {Number(sale.finalAmount).toLocaleString()}
        </Text>
      </View>
    </View>

    <View style={styles.cardDate}>
      <MaterialIcons name="access-time" size={12} color="#94a3b8" />
      <Text style={styles.dateText}>
        {new Date(sale.createdAt).toLocaleDateString()}
      </Text>
      {sale.status !== 'cancelled' && (
        <TouchableOpacity
          onPress={() => onCancel(sale.id)}
          style={styles.cancelBtn}
        >
          <MaterialIcons name="cancel" size={16} color="#ef4444" />
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  </TouchableOpacity>
);

// ── VIEW SALE MODAL ───────────────────────────────────
const ViewSaleModal = ({ visible, sale, onClose }) => {
  if (!sale) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{sale.invoiceNumber}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.modalBody}>

        {/* Customer */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Customer</Text>
          <Text style={styles.infoValue}>
            {sale.customer?.name || 'Walk-in Customer'}
          </Text>
          {sale.customer?.phone && (
            <Text style={styles.infoSubValue}>{sale.customer.phone}</Text>
          )}
        </View>

        {/* Status & Payment */}
        <View style={styles.badgeRow}>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor:
                sale.status === 'paid' ? '#dcfce7' :
                sale.status === 'cancelled' ? '#fee2e2' : '#fef3c7'
            }
          ]}>
            <Text style={[
              styles.statusText,
              {
                color:
                  sale.status === 'paid' ? '#16a34a' :
                  sale.status === 'cancelled' ? '#ef4444' : '#d97706'
              }
            ]}>
              {sale.status?.toUpperCase()}
            </Text>
          </View>
          <View style={styles.paymentBadge}>
            <Text style={styles.paymentText}>
              {sale.paymentMethod?.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.dateSmall}>
            {new Date(sale.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Items Purchased</Text>
          <View style={styles.itemsTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Product</Text>
              <Text style={styles.tableHeaderText}>Qty</Text>
              <Text style={styles.tableHeaderText}>Price</Text>
              <Text style={styles.tableHeaderText}>Total</Text>
            </View>
            {sale.items?.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                  {item.product?.name}
                </Text>
                <Text style={styles.tableCell}>{item.quantity}</Text>
                <Text style={styles.tableCell}>
                  {Number(item.unitPrice).toLocaleString()}
                </Text>
                <Text style={[styles.tableCell, { fontWeight: '700', color: '#2563eb' }]}>
                  {Number(item.subtotal).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          {[
            { label: 'Total Amount',  value: `Rs. ${Number(sale.totalAmount).toLocaleString()}`,  color: '#1e293b' },
            { label: 'Discount',      value: `- Rs. ${Number(sale.discount).toLocaleString()}`,   color: '#ef4444' },
            { label: 'Final Amount',  value: `Rs. ${Number(sale.finalAmount).toLocaleString()}`,  color: '#2563eb', bold: true },
            { label: 'Amount Paid',   value: `Rs. ${Number(sale.amountPaid).toLocaleString()}`,   color: '#10b981' },
            { label: 'Change',        value: `Rs. ${Number(sale.changeAmount).toLocaleString()}`, color: '#1e293b' },
          ].map((row) => (
            <View key={row.label} style={styles.totalRow}>
              <Text style={[styles.totalLabel, row.bold && { fontWeight: '700' }]}>
                {row.label}:
              </Text>
              <Text style={[
                styles.totalValue,
                { color: row.color },
                row.bold && { fontSize: 18, fontWeight: '700' }
              ]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {sale.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{sale.notes}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </Modal>
  );
};

// ── CREATE SALE MODAL ─────────────────────────────────
const CreateSaleModal = ({ visible, onClose, customers, products, queryClient }) => {
  const [customerId, setCustomerId]       = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount]           = useState('0');
  const [amountPaid, setAmountPaid]       = useState('');
  const [notes, setNotes]                 = useState('');
  const [items, setItems]                 = useState([
    { productId: '', quantity: '1', unitPrice: '' }
  ]);

  const addItem = () => {
    setItems([...items, { productId: '', quantity: '1', unitPrice: '' }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'productId') {
      const product = products.find(p => p.id === Number(value));
      if (product) updated[index].unitPrice = product.sellingPrice.toString();
    }
    setItems(updated);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) || 0), 0
  );
  const finalAmount  = totalAmount - Number(discount || 0);
  const changeAmount = Number(amountPaid || 0) - finalAmount;

  const createMutation = useMutation({
    mutationFn: (data) => saleAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['sales']);
      queryClient.invalidateQueries(['products']);
      Alert.alert('Success! 🎉', 'Sale created successfully!');
      onClose();
    },
    onError: (err) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create sale!');
    }
  });

  const handleSubmit = () => {
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.unitPrice) {
        Alert.alert('Error', 'Please fill all item fields!');
        return;
      }
    }
    createMutation.mutate({
      customerId:    customerId || null,
      paymentMethod,
      discount:      Number(discount || 0),
      amountPaid:    Number(amountPaid || finalAmount),
      notes,
      items: items.map(i => ({
        productId: Number(i.productId),
        quantity:  Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      }))
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>New Sale 🛒</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={createMutation.isPending}
          style={styles.modalSaveBtn}
        >
          {createMutation.isPending
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.saveBtnText}>Create</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">

        {/* Customer */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Customer (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, !customerId && styles.chipActive]}
                onPress={() => setCustomerId('')}
              >
                <Text style={[styles.chipText, !customerId && styles.chipTextActive]}>
                  Walk-in
                </Text>
              </TouchableOpacity>
              {customers?.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.chip,
                    customerId === c.id.toString() && styles.chipActive
                  ]}
                  onPress={() => setCustomerId(c.id.toString())}
                >
                  <Text style={[
                    styles.chipText,
                    customerId === c.id.toString() && styles.chipTextActive
                  ]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Payment Method */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Payment Method</Text>
          <View style={styles.chipRow}>
            {['cash', 'card', 'transfer', 'credit'].map(method => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.chip,
                  paymentMethod === method && styles.chipActive
                ]}
                onPress={() => setPaymentMethod(method)}
              >
                <Text style={[
                  styles.chipText,
                  paymentMethod === method && styles.chipTextActive
                ]}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Items */}
        <View style={styles.fieldGroup}>
          <View style={styles.itemsHeader}>
            <Text style={styles.fieldLabel}>Sale Items</Text>
            <TouchableOpacity onPress={addItem} style={styles.addItemBtn}>
              <MaterialIcons name="add" size={16} color="#2563eb" />
              <Text style={styles.addItemText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              {/* Product Selector */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.productScroll}
              >
                <View style={styles.productChipRow}>
                  {products?.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.productChip,
                        item.productId === p.id.toString() && styles.chipActive
                      ]}
                      onPress={() => updateItem(index, 'productId', p.id.toString())}
                    >
                      <Text style={[
                        styles.chipText,
                        item.productId === p.id.toString() && styles.chipTextActive
                      ]}>
                        {p.name} (Rs.{Number(p.sellingPrice).toLocaleString()})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.itemInputRow}>
                <View style={styles.itemInputGroup}>
                  <Text style={styles.itemInputLabel}>Qty</Text>
                  <TextInput
                    style={styles.itemInput}
                    value={item.quantity}
                    onChangeText={(v) => updateItem(index, 'quantity', v)}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View style={styles.itemInputGroup}>
                  <Text style={styles.itemInputLabel}>Unit Price</Text>
                  <TextInput
                    style={styles.itemInput}
                    value={item.unitPrice}
                    onChangeText={(v) => updateItem(index, 'unitPrice', v)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View style={styles.itemInputGroup}>
                  <Text style={styles.itemInputLabel}>Subtotal</Text>
                  <Text style={styles.subtotalText}>
                    Rs. {(Number(item.quantity) * Number(item.unitPrice) || 0).toLocaleString()}
                  </Text>
                </View>
                {items.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeItem(index)}
                    style={styles.removeItemBtn}
                  >
                    <MaterialIcons name="delete" size={18} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Discount & Amount Paid */}
        <View style={styles.rowFields}>
          <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.fieldLabel}>Discount (Rs.)</Text>
            <TextInput
              style={styles.fieldInput}
              value={discount}
              onChangeText={setDiscount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Amount Paid (Rs.)</Text>
            <TextInput
              style={styles.fieldInput}
              value={amountPaid}
              onChangeText={setAmountPaid}
              keyboardType="numeric"
              placeholder={finalAmount.toString()}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          {[
            { label: 'Total',        value: `Rs. ${totalAmount.toLocaleString()}`,  color: '#1e293b' },
            { label: 'Discount',     value: `- Rs. ${Number(discount || 0).toLocaleString()}`, color: '#ef4444' },
            { label: 'Final Amount', value: `Rs. ${finalAmount.toLocaleString()}`,  color: '#2563eb', bold: true },
            ...(amountPaid ? [{
              label: 'Change',
              value: `Rs. ${changeAmount.toLocaleString()}`,
              color: changeAmount >= 0 ? '#10b981' : '#ef4444'
            }] : []),
          ].map((row) => (
            <View key={row.label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{row.label}:</Text>
              <Text style={[
                styles.summaryValue,
                { color: row.color },
                row.bold && { fontSize: 18, fontWeight: '700' }
              ]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Notes</Text>
          <TextInput
            style={[styles.fieldInput, { height: 70 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes..."
            placeholderTextColor="#94a3b8"
            multiline
          />
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </Modal>
  );
};

// ── MAIN SALES SCREEN ─────────────────────────────────
const SalesScreen = () => {
  const queryClient                     = useQueryClient();
  const [search, setSearch]             = useState('');
  const [createVisible, setCreateVisible] = useState(false);
  const [viewSale, setViewSale]         = useState(null);
  const [refreshing, setRefreshing]     = useState(false);

  const { data: sales = [], isLoading, refetch } = useQuery({
    queryKey: ['sales'],
    queryFn:  () => saleAPI.getAll().then(r => r.data.sales),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn:  () => customerAPI.getAll().then(r => r.data.customers),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn:  () => productAPI.getAll().then(r => r.data.products),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => saleAPI.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['sales']);
      queryClient.invalidateQueries(['products']);
      Alert.alert('Cancelled', 'Sale cancelled and stock restored!');
    },
    onError: () => Alert.alert('Error', 'Failed to cancel sale!')
  });

  const handleCancel = (id) => {
    Alert.alert(
      'Cancel Sale',
      'Cancel this sale? Stock will be restored!',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes Cancel', style: 'destructive', onPress: () => cancelMutation.mutate(id) }
      ]
    );
  };

  const handleViewSale = async (sale) => {
    try {
      const response = await saleAPI.getOne(sale.id);
      setViewSale(response.data.sale);
    } catch {
      Alert.alert('Error', 'Failed to load sale details!');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered = sales.filter(s =>
    s.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = sales
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + Number(s.finalAmount), 0);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Stats Bar */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {sales.filter(s => s.status === 'paid').length}
          </Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>
            Rs. {totalRevenue.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by invoice or customer..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Sales List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SaleCard
            sale={item}
            onView={handleViewSale}
            onCancel={handleCancel}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt" size={60} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Sales Yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to create your first sale!</Text>
          </View>
        }
        contentContainerStyle={filtered.length === 0 && styles.emptyList}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setCreateVisible(true)}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create Sale Modal */}
      {createVisible && (
        <CreateSaleModal
          visible={createVisible}
          onClose={() => setCreateVisible(false)}
          customers={customers}
          products={products}
          queryClient={queryClient}
        />
      )}

      {/* View Sale Modal */}
      {viewSale && (
        <ViewSaleModal
          visible={!!viewSale}
          sale={viewSale}
          onClose={() => setViewSale(null)}
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
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
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
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563eb',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    marginBottom: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  customerName: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '600',
  },
  saleAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  cardDate: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    flex: 1,
    marginLeft: 4,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
  },
  cancelText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 2,
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
    minWidth: 70,
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
  rowFields: {
    flexDirection: 'row',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
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
  chipTextActive: { color: '#fff' },

  // Items
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addItemText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 4,
  },
  itemRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productScroll: { marginBottom: 10 },
  productChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  productChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  itemInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemInputGroup: {
    flex: 1,
  },
  itemInputLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
    fontWeight: '600',
  },
  itemInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1e293b',
    textAlign: 'center',
  },
  subtotalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
    textAlign: 'center',
    paddingTop: 8,
  },
  removeItemBtn: {
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
  },

  // Summary
  summaryBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // View Sale Modal
  infoSection: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  infoSubValue: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  dateSmall: {
    fontSize: 12,
    color: '#94a3b8',
  },
  itemsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  itemsTable: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 10,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    textAlign: 'center',
  },
  totalsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesSection: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#1e293b',
  },
});

export default SalesScreen;