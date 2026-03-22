

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, RefreshControl, Modal, ScrollView
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerAPI } from '../../services/api';

// ── CUSTOMER CARD ─────────────────────────────────────
const CustomerCard = ({ customer, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.avatarBox}>
      <Text style={styles.avatarText}>
        {customer.name?.charAt(0).toUpperCase()}
      </Text>
    </View>
    <View style={styles.cardInfo}>
      <Text style={styles.customerName}>{customer.name}</Text>
      <View style={styles.infoRow}>
        <MaterialIcons name="phone" size={13} color="#94a3b8" />
        <Text style={styles.infoText}>{customer.phone}</Text>
      </View>
      {customer.email && (
        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={13} color="#94a3b8" />
          <Text style={styles.infoText} numberOfLines={1}>{customer.email}</Text>
        </View>
      )}
      {Number(customer.outstandingBalance) > 0 && (
        <View style={styles.balanceBadge}>
          <Text style={styles.balanceText}>
            Balance: Rs. {Number(customer.outstandingBalance).toLocaleString()}
          </Text>
        </View>
      )}
    </View>
    <View style={styles.cardActions}>
      <TouchableOpacity onPress={() => onEdit(customer)} style={styles.editBtn}>
        <MaterialIcons name="edit" size={18} color="#2563eb" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(customer.id)} style={styles.deleteBtn}>
        <MaterialIcons name="delete" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  </View>
);

// ── ADD/EDIT MODAL ────────────────────────────────────
const CustomerModal = ({ visible, onClose, editCustomer, queryClient }) => {
  const [formData, setFormData] = useState({
    name:    editCustomer?.name    || '',
    phone:   editCustomer?.phone   || '',
    email:   editCustomer?.email   || '',
    address: editCustomer?.address || '',
    notes:   editCustomer?.notes   || '',
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const createMutation = useMutation({
    mutationFn: (data) => customerAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      Alert.alert('Success! ✅', 'Customer added!');
      onClose();
    },
    onError: (err) => Alert.alert('Error', err.response?.data?.message || 'Failed!')
  });

  const updateMutation = useMutation({
    mutationFn: (data) => customerAPI.update(editCustomer.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      Alert.alert('Success! ✅', 'Customer updated!');
      onClose();
    },
    onError: (err) => Alert.alert('Error', err.response?.data?.message || 'Failed!')
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      Alert.alert('Error', 'Name and phone are required!');
      return;
    }
    editCustomer
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
          {editCustomer ? 'Edit Customer' : 'Add Customer'}
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

        {[
          { label: 'Full Name *',      field: 'name',    icon: 'person',       placeholder: 'e.g. Mohamed Hassan' },
          { label: 'Phone *',          field: 'phone',   icon: 'phone',        placeholder: 'e.g. 0771234567',  keyboard: 'phone-pad' },
          { label: 'Email',            field: 'email',   icon: 'email',        placeholder: 'e.g. mohamed@email.com', keyboard: 'email-address' },
          { label: 'Address',          field: 'address', icon: 'location-on',  placeholder: 'e.g. 123 Main St' },
        ].map((item) => (
          <View key={item.field} style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{item.label}</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name={item.icon} size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={item.placeholder}
                placeholderTextColor="#94a3b8"
                value={formData[item.field]}
                onChangeText={(v) => handleChange(item.field, v)}
                keyboardType={item.keyboard || 'default'}
                autoCapitalize={item.keyboard === 'email-address' ? 'none' : 'words'}
              />
            </View>
          </View>
        ))}

        {/* Notes */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Notes</Text>
          <TextInput
            style={[styles.fieldInput, { height: 80 }]}
            placeholder="Any additional notes..."
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

// ── MAIN CUSTOMERS SCREEN ─────────────────────────────
const CustomersScreen = () => {
  const queryClient                       = useQueryClient();
  const [search, setSearch]               = useState('');
  const [modalVisible, setModalVisible]   = useState(false);
  const [editCustomer, setEditCustomer]   = useState(null);
  const [refreshing, setRefreshing]       = useState(false);

  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn:  () => customerAPI.getAll().then(r => r.data.customers),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => customerAPI.delete(id),
    onSuccess:  ()  => queryClient.invalidateQueries(['customers']),
    onError:    ()  => Alert.alert('Error', 'Failed to delete customer!')
  });

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
      ]
    );
  };

  const handleEdit = (customer) => {
    setEditCustomer(customer);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditCustomer(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
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

      {/* Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <MaterialIcons name="people" size={20} color="#2563eb" />
          <Text style={styles.statValue}>{customers.length}</Text>
          <Text style={styles.statLabel}>Total Customers</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone or email..."
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

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people" size={60} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Customers Yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to add your first customer!</Text>
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
        <CustomerModal
          visible={modalVisible}
          onClose={handleCloseModal}
          editCustomer={editCustomer}
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
  statsBar: {
    backgroundColor: '#2563eb',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
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
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  cardInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
    flex: 1,
  },
  balanceBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  balanceText: {
    fontSize: 11,
    color: '#d97706',
    fontWeight: '600',
  },
  cardActions: {
    gap: 8,
  },
  editBtn: {
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
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
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
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
});

export default CustomersScreen;