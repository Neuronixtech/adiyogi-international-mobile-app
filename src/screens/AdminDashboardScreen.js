import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../api/client';
import AdminLayout from './AdminLayout';
import { COLORS, FONTS, SPACING } from '../constants';

export default function AdminDashboardScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const statCards = stats
    ? [
        { label: 'Total Products', value: stats.totalProducts ?? 0, icon: 'cube-outline', color: COLORS.navy, bg: COLORS.navyBg },
        { label: 'Total Orders', value: stats.totalOrders ?? 0, icon: 'receipt-outline', color: COLORS.champagneDark, bg: '#FFF8E8' },
        { label: 'Pending Orders', value: stats.pendingOrders ?? 0, icon: 'time-outline', color: '#ea580c', bg: '#fff7ed' },
        { label: 'Collections', value: stats.totalCollections ?? 0, icon: 'folder-outline', color: '#16a34a', bg: '#f0fdf4' },
      ]
    : [];

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.champagne} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.champagne} />
          }
        >
          <Text style={styles.greeting}>Admin Overview</Text>

          {stats && (
            <View style={styles.statsGrid}>
              {statCards.map((card) => (
                <View key={card.label} style={[styles.statCard, { backgroundColor: card.bg }]}>
                  <View style={[styles.statIcon, { backgroundColor: card.color }]}>
                    <Ionicons name={card.icon} size={20} color={COLORS.white} />
                  </View>
                  <Text style={styles.statValue}>{card.value}</Text>
                  <Text style={styles.statLabel}>{card.label}</Text>
                </View>
              ))}
            </View>
          )}

          {stats?.recentOrders?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              {stats.recentOrders.slice(0, 5).map((order) => (
                <View key={order._id} style={styles.recentOrder}>
                  <View style={styles.recentOrderLeft}>
                    <Text style={styles.recentOrderId}>{order.orderId}</Text>
                    <Text style={styles.recentOrderName}>{order.customer?.name ?? 'Unknown'}</Text>
                  </View>
                  <View style={[styles.statusBadge, getStatusStyle(order.status)]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status}
                    </Text>
                  </View>
                </View>
              ))}
              <View style={styles.viewAllWrap}>
                <View
                  style={styles.viewAllBtn}
                  onTouchEnd={() => navigation.navigate('AdminOrders')}
                >
                  <Text style={styles.viewAllText}>View All Orders →</Text>
                </View>
              </View>
            </View>
          )}

          {stats?.lowStockProducts?.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#ea580c' }]}>Low Stock Alert</Text>
              {stats.lowStockProducts.map((p) => (
                <View key={p._id} style={styles.lowStockItem}>
                  <Ionicons name="alert-circle" size={16} color="#ea580c" />
                  <Text style={styles.lowStockName}>{p.name}</Text>
                  <Text style={styles.lowStockQty}>Stock: {p.stock ?? 0}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </AdminLayout>
  );
}

function getStatusStyle(status) {
  switch (status) {
    case 'Pending': return { backgroundColor: '#fff7ed' };
    case 'Confirmed': return { backgroundColor: '#f0fdf4' };
    case 'Shipped': return { backgroundColor: '#eff6ff' };
    case 'Delivered': return { backgroundColor: '#f0fdf4' };
    case 'Cancelled': return { backgroundColor: '#fef2f2' };
    default: return { backgroundColor: COLORS.gray100 };
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'Pending': return '#c2410c';
    case 'Confirmed': return '#16a34a';
    case 'Shipped': return '#2563eb';
    case 'Delivered': return '#16a34a';
    case 'Cancelled': return '#dc2626';
    default: return COLORS.gray600;
  }
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: SPACING.lg, paddingBottom: 40, gap: 16 },
  greeting: {
    fontFamily: FONTS.display, fontSize: 20, fontWeight: 'bold', color: COLORS.navy,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%', borderRadius: 16, padding: 16, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: {
    fontFamily: FONTS.display, fontSize: 28, fontWeight: '900', color: COLORS.navy,
  },
  statLabel: { fontSize: 12, color: COLORS.gray500 },
  section: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: {
    fontFamily: FONTS.display, fontSize: 15, fontWeight: 'bold',
    color: COLORS.navy, marginBottom: 12,
  },
  recentOrder: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.gray100,
  },
  recentOrderLeft: {},
  recentOrderId: {
    fontFamily: FONTS.mono, fontSize: 12, fontWeight: 'bold', color: COLORS.navy,
  },
  recentOrderName: { fontSize: 12, color: COLORS.gray500, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  viewAllWrap: { marginTop: 12, alignItems: 'center' },
  viewAllBtn: { padding: 8 },
  viewAllText: { fontSize: 13, fontWeight: '600', color: COLORS.navy },
  lowStockItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray100,
  },
  lowStockName: { flex: 1, fontSize: 13, fontWeight: '500', color: COLORS.gray700 },
  lowStockQty: { fontSize: 12, fontWeight: '600', color: '#ea580c' },
});
