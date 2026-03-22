import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, RefreshControl, Modal, ScrollView
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseAPI } from '../../services/api';

const CATEGORIES = [
  { label: 'Rent',        value: 'rent',        color: '#ef4444', icon: 'home' },
  { label: 'Salaries',    value: 'salaries',    color: '#f59e0b', icon: 'people' },
  { label: 'Utilities',   value: 'utilities',   color: '#3b82f6', icon: 'bolt' },
  { label: 'Supplies',    value: 'supplies',    color: '#10b981', icon: 'shopping-bag' },
  { label: 'Transport',   value: 'transport',   color: '#8b5cf6', icon: 'local-shipping' },
  { label: 'Marketing',   value: 'marketing',   color: '#ec4899', icon: 'campaign' },
  { label: 'Maintenance', value: 'maintenance', color: '#f97316', icon: 'build' },
  { label: 'Other',       value: 'other',       color: '#6b7280', icon: 'more-horiz' },
];

const getCategoryInfo = (value) =>
  CATEGORIES.find(c => c.value === value) || CATEGORIES[7];

// ── EXPENSE CARD ──────────────────────────────────────
const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const cat = getCategoryInfo(expense.category);
  return (
    <View style={styles.card}>
      <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
        <MaterialIcons name={cat.icon} size={22} color={cat.color} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.expenseTitle}>{expense.title}</Text>
        <View style={styles.cardMeta}>
          <View style={[styles.catBadge, { backgroundColor: `${cat.color}15` }]}>
            <Text style={[styles.catBadgeText, { color: cat.color }]}>
              {cat.label}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(expense.expenseDate).toLocaleDateString()}
          </Text>
        </View>
        {expense.notes && (
          <Text style={styles.notesText} numberOfLines={1}>
            {expense.notes}
          </Text>
        )}
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.amountText}>
          Rs. {Number(expense.amount).toLocaleString()}
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => onEdit(expense)} style={styles.editBtn}>
            <MaterialIcons name="edit" size={16} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(expense.id)} style={styles.deleteBtn}>
            <MaterialIcons name="delete" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ── ADD/EDIT MODAL ────────────────────────────────────
const ExpenseModal = ({ visible, onClose, editExpense, queryClient }) => {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title:       editExpense?.title       || '',
    amount:      editExpense?.amount?.toString() || '',
    category:    editExpense?.category    || 'other',
    expenseDate: editExpense?.expenseDate || today,
    notes:       editExpense?.notes       || '',
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const createMutation = useMutation({
    mutationFn: (data) => expenseAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      Alert.alert('Success! ✅', 'Expense recorded!');
      onClose();
    },
    onError: (err) => Alert.alert('Error', err.response?.data?.message || 'Failed!')
  });

  const updateMutation = useMutation({
    mutationFn: (data) => expenseAPI.update(editExpense.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      Alert.alert('Success! ✅', 'Expense updated!');
      onClose();
    },
    onError: (err) => Alert.alert('Error', err.response?.data?.message || 'Failed!')
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.amount) {
      Alert.alert('Error', 'Title and amount are required!');
      return;
    }
    editExpense
      ? updateMutation.mutate(formData)
      : createMutation.mutate(formData);
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>
          {editExpense ? 'Edit Expense' : 'Record Expense'}
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

      <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">

        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Expense Title *</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g. Office Rent March"
            placeholderTextColor="#94a3b8"
            value={formData.title}
            onChangeText={(v) => handleChange('title', v)}
          />
        </View>

        {/* Amount */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Amount (Rs.) *</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="0"
            placeholderTextColor="#94a3b8"
            value={formData.amount}
            onChangeText={(v) => handleChange('amount', v)}
            keyboardType="numeric"
          />
        </View>

        {/* Date */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Expense Date</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            value={formData.expenseDate}
            onChangeText={(v) => handleChange('expenseDate', v)}
          />
        </View>

        {/* Category */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryCard,
                  formData.category === cat.value && {
                    backgroundColor: `${cat.color}15`,
                    borderColor: cat.color,
                  }
                ]}
                onPress={() => handleChange('category', cat.value)}
              >
                <MaterialIcons
                  name={cat.icon}
                  size={22}
                  color={formData.category === cat.value ? cat.color : '#94a3b8'}
                />
                <Text style={[
                  styles.categoryCardText,
                  formData.category === cat.value && { color: cat.color, fontWeight: '700' }
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Notes</Text>
          <TextInput
            style={[styles.fieldInput, { height: 80 }]}
            placeholder="Optional notes..."
            placeholderTextColor="#94a3b8"
            value={formData.notes}
            onChangeText={(v) => handleChange('notes', v)}
            multiline
          />
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </Modal>
  );
};

// ── MAIN EXPENSES SCREEN ──────────────────────────────
const ExpensesScreen = () => {
  const queryClient                     = useQueryClient();
  const [search, setSearch]             = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editExpense, setEditExpense]   = useState(null);
  const [refreshing, setRefreshing]     = useState(false);
  const [filterCat, setFilterCat]       = useState('');

  const { data: expenses = [], isLoading, refetch } = useQuery({
    queryKey: ['expenses'],
    queryFn:  () => expenseAPI.getAll().then(r => r.data.expenses),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => expenseAPI.delete(id),
    onSuccess:  ()  => queryClient.invalidateQueries(['expenses']),
    onError:    ()  => Alert.alert('Error', 'Failed to delete expense!')
  });

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
      ]
    );
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditExpense(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered = expenses.filter(e => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat ? e.category === filterCat : true;
    return matchSearch && matchCat;
  });

  const totalAmount = filtered.reduce(
    (sum, e) => sum + Number(e.amount), 0
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

      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Expenses</Text>
          <Text style={styles.statValue}>
            Rs. {totalAmount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Records</Text>
          <Text style={styles.statValue}>{filtered.length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search expenses..."
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

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, !filterCat && styles.filterChipActive]}
          onPress={() => setFilterCat('')}
        >
          <Text style={[styles.filterChipText, !filterCat && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.value}
            style={[
              styles.filterChip,
              filterCat === cat.value && { backgroundColor: cat.color, borderColor: cat.color }
            ]}
            onPress={() => setFilterCat(filterCat === cat.value ? '' : cat.value)}
          >
            <MaterialIcons
              name={cat.icon}
              size={14}
              color={filterCat === cat.value ? '#fff' : '#64748b'}
            />
            <Text style={[
              styles.filterChipText,
              filterCat === cat.value && styles.filterChipTextActive
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ExpenseCard
            expense={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="account-balance-wallet" size={60} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Expenses Yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to record an expense!</Text>
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
        <ExpenseModal
          visible={modalVisible}
          onClose={handleCloseModal}
          editExpense={editExpense}
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
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
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
    marginBottom: 8,
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
  filterScroll: {
    maxHeight: 50,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    gap: 4,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginLeft: 4,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  notesText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  editBtn: {
    padding: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: '#fff5f5',
    borderRadius: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#ef4444',
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
    backgroundColor: '#ef4444',
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
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  categoryCardText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ExpensesScreen;