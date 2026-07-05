import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import AdminLayout from './AdminLayout';
import { COLORS, FONTS, SPACING, ORDER_STATUSES } from '../constants';

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/admin/orders', { params });
      setOrders(Array.isArray(data) ? data : data.orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to update status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#c2410c';
      case 'Confirmed': return '#16a34a';
      case 'Shipped': return '#2563eb';
      case 'Delivered': return '#16a34a';
      case 'Cancelled': return '#dc2626';
      default: return COLORS.gray600;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'Pending': return '#fff7ed';
      case 'Confirmed': return '#f0fdf4';
      case 'Shipped': return '#eff6ff';
      case 'Delivered': return '#f0fdf4';
      case 'Cancelled': return '#fef2f2';
      default: return COLORS.gray100;
    }
  };

  return (
    <AdminLayout title="Orders">
      <View style={styles.filterBar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            placeholderTextColor={COLORS.gray400}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusScroll}
        contentContainerStyle={styles.statusContent}
      >
        {['', ...ORDER_STATUSES].map((s) => (
          <TouchableOpacity
            key={s || 'all'}
            style={[styles.statusChip, statusFilter === s && styles.statusChipActive]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.statusChipText, statusFilter === s && styles.statusChipTextActive]}>
              {s || 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.champagne} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.champagne} />}
        >
          {orders.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="receipt-outline" size={48} color={COLORS.gray300} />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          ) : (
            orders.map((order) => (
              <TouchableOpacity
                key={order._id}
                style={styles.orderCard}
                onPress={() => setSelectedOrder(order)}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>{order.orderId}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBg(order.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.orderBody}>
                  <Text style={styles.orderName}>{order.customer?.name ?? 'Unknown'}</Text>
                  <Text style={styles.orderWhatsapp}>{order.customer?.whatsapp}</Text>
                </View>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>₹{order.total?.toFixed(2)}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={!!selectedOrder} transparent animationType="slide" onRequestClose={() => setSelectedOrder(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Order {selectedOrder.orderId}</Text>
                  <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                    <Ionicons name="close" size={22} color={COLORS.gray400} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Customer</Text>
                  <Text style={styles.modalValue}>{selectedOrder.customer?.name}</Text>
                  <Text style={styles.modalValue}>{selectedOrder.customer?.whatsapp}</Text>
                  {selectedOrder.customer?.email && (
                    <Text style={styles.modalValue}>{selectedOrder.customer.email}</Text>
                  )}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Items</Text>
                  {selectedOrder.items?.map((item, i) => (
                    <View key={i} style={styles.modalItem}>
                      <Text style={styles.modalItemName}>{item.name}</Text>
                      <Text style={styles.modalItemQty}>{item.quantity} PAC × ₹{item.price}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Update Status</Text>
                  <View style={styles.statusOptions}>
                    {ORDER_STATUSES.map((s) => {
                      const active = selectedOrder.status === s;
                      return (
                        <TouchableOpacity
                          key={s}
                          style={[
                            styles.statusOption,
                            active && { backgroundColor: getStatusBg(s), borderColor: getStatusColor(s) },
                          ]}
                          onPress={() => handleStatusUpdate(selectedOrder._id, s)}
                        >
                          <Text style={[styles.statusOptionText, active && { color: getStatusColor(s), fontWeight: '700' }]}>
                            {s}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Payment Mode</Text>
                    <Text style={styles.summaryValue}>{selectedOrder.paymentMode}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total</Text>
                    <Text style={[styles.summaryValue, { fontWeight: 'bold', fontSize: 16 }]}>
                      ₹{selectedOrder.total?.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date</Text>
                    <Text style={styles.summaryValue}>
                      {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  filterBar: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12,
    paddingHorizontal: 12, height: 40,
    borderWidth: 1, borderColor: COLORS.gray200,
  },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.gray700, paddingVertical: 0, marginLeft: 6 },
  statusScroll: { maxHeight: 44, marginBottom: 8 },
  statusContent: { paddingHorizontal: SPACING.lg, gap: 8 },
  statusChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200,
  },
  statusChipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  statusChipText: { fontSize: 12, fontWeight: '600', color: COLORS.gray600 },
  statusChipTextActive: { color: COLORS.white },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: SPACING.lg, gap: 12, paddingBottom: 40 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.gray400 },
  orderCard: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: 'bold', color: COLORS.navy },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderBody: { marginBottom: 8 },
  orderName: { fontSize: 14, fontWeight: '600', color: COLORS.gray700 },
  orderWhatsapp: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontFamily: FONTS.display, fontSize: 16, fontWeight: 'bold', color: COLORS.navy },
  orderDate: { fontSize: 11, color: COLORS.gray400 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.xl, maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: FONTS.display, fontSize: 18, fontWeight: 'bold', color: COLORS.navy },
  modalSection: { marginBottom: 16 },
  modalSectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  modalValue: { fontSize: 14, color: COLORS.gray700, lineHeight: 20 },
  modalItem: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  modalItemName: { fontSize: 13, fontWeight: '600', color: COLORS.gray700 },
  modalItemQty: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusOption: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: COLORS.gray200, backgroundColor: COLORS.gray50,
  },
  statusOptionText: { fontSize: 12, fontWeight: '600', color: COLORS.gray600 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 13, color: COLORS.gray500 },
  summaryValue: { fontSize: 13, fontWeight: '600', color: COLORS.gray700 },
});
