import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
  RefreshControl
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI, aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ── STAT CARD ─────────────────────────────────────────
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statCardContent}>
      <View>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
      <View style={[styles.statIconBox, { backgroundColor: `${color}20` }]}>
        <MaterialIcons name={icon} size={28} color={color} />
      </View>
    </View>
  </View>
);

// ── SECTION HEADER ────────────────────────────────────
const SectionHeader = ({ title, icon }) => (
  <View style={styles.sectionHeader}>
    <MaterialIcons name={icon} size={20} color="#2563eb" />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const DashboardScreen = () => {
  const { user, logout }      = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [loadingAI, setLoadingAI]   = useState(false);

  // Fetch dashboard data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => dashboardAPI.get().then(r => r.data.dashboard),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleGetInsights = async () => {
    setLoadingAI(true);
    try {
      const res = await aiAPI.insights();
      setAiInsights(res.data.insights);
    } catch {
      // silently fail
    } finally {
      setLoadingAI(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.name?.split(' ')[0]}! 👋
          </Text>
          <Text style={styles.businessName}>{user?.businessName}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Today's Stats */}
      <SectionHeader title="Today's Overview" icon="today" />

      <StatCard
        title="Today's Revenue"
        value={`Rs. ${Number(data?.today?.revenue || 0).toLocaleString()}`}
        icon="trending-up"
        color="#10b981"
        subtitle={`${data?.today?.salesCount || 0} sales today`}
      />
      <StatCard
        title="Today's Expenses"
        value={`Rs. ${Number(data?.today?.expenses || 0).toLocaleString()}`}
        icon="trending-down"
        color="#ef4444"
      />
      <StatCard
        title="Today's Profit"
        value={`Rs. ${Number(data?.today?.profit || 0).toLocaleString()}`}
        icon="account-balance"
        color="#2563eb"
      />

      {/* This Month */}
      <SectionHeader title="This Month" icon="calendar-month" />

      <View style={styles.monthRow}>
        <View style={[styles.monthCard, { borderColor: '#10b981' }]}>
          <Text style={styles.monthLabel}>Revenue</Text>
          <Text style={[styles.monthValue, { color: '#10b981' }]}>
            Rs. {Number(data?.thisMonth?.revenue || 0).toLocaleString()}
          </Text>
        </View>
        <View style={[styles.monthCard, { borderColor: '#ef4444' }]}>
          <Text style={styles.monthLabel}>Expenses</Text>
          <Text style={[styles.monthValue, { color: '#ef4444' }]}>
            Rs. {Number(data?.thisMonth?.expenses || 0).toLocaleString()}
          </Text>
        </View>
        <View style={[styles.monthCard, { borderColor: '#2563eb' }]}>
          <Text style={styles.monthLabel}>Profit</Text>
          <Text style={[styles.monthValue, { color: '#2563eb' }]}>
            Rs. {Number(data?.thisMonth?.profit || 0).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <SectionHeader title="Quick Stats" icon="bar-chart" />

      <View style={styles.quickStatsRow}>
        {[
          { label: 'Products',  value: data?.inventory?.totalProducts || 0, icon: 'inventory',  color: '#2563eb' },
          { label: 'Customers', value: data?.counts?.customers || 0,        icon: 'people',     color: '#10b981' },
          { label: 'Suppliers', value: data?.counts?.suppliers || 0,        icon: 'local-shipping', color: '#f59e0b' },
          { label: 'Low Stock', value: data?.inventory?.lowStockCount || 0, icon: 'warning',    color: '#ef4444' },
        ].map((stat) => (
          <View key={stat.label} style={styles.quickStatCard}>
            <MaterialIcons name={stat.icon} size={24} color={stat.color} />
            <Text style={[styles.quickStatValue, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={styles.quickStatLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Low Stock Alert */}
      {data?.inventory?.lowStockProducts?.length > 0 && (
        <>
          <SectionHeader title="Low Stock Alert" icon="warning" />
          {data.inventory.lowStockProducts.map((product) => (
            <View key={product.id} style={styles.lowStockItem}>
              <MaterialIcons name="inventory" size={18} color="#ef4444" />
              <Text style={styles.lowStockName}>{product.name}</Text>
              <View style={styles.lowStockBadge}>
                <Text style={styles.lowStockBadgeText}>
                  {product.stockQuantity} left
                </Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Recent Sales */}
      <SectionHeader title="Recent Sales" icon="receipt" />

      {data?.recentSales?.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialIcons name="receipt" size={40} color="#cbd5e1" />
          <Text style={styles.emptyText}>No sales yet!</Text>
        </View>
      ) : (
        data?.recentSales?.slice(0, 5).map((sale) => (
          <View key={sale.id} style={styles.saleItem}>
            <View style={styles.saleIconBox}>
              <MaterialIcons name="receipt" size={20} color="#2563eb" />
            </View>
            <View style={styles.saleInfo}>
              <Text style={styles.saleInvoice}>{sale.invoiceNumber}</Text>
              <Text style={styles.saleCustomer}>
                {sale.customer?.name || 'Walk-in Customer'}
              </Text>
            </View>
            <Text style={styles.saleAmount}>
              Rs. {Number(sale.finalAmount).toLocaleString()}
            </Text>
          </View>
        ))
      )}

      {/* AI Insights */}
      <SectionHeader title="AI Insights" icon="smart-toy" />

      <TouchableOpacity
        style={styles.aiBtn}
        onPress={handleGetInsights}
        disabled={loadingAI}
      >
        {loadingAI ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <MaterialIcons name="smart-toy" size={20} color="#fff" />
            <Text style={styles.aiBtnText}>Analyze My Business</Text>
          </>
        )}
      </TouchableOpacity>

      {aiInsights.map((insight, index) => (
        <View
          key={index}
          style={[
            styles.insightCard,
            {
              borderLeftColor:
                insight.type === 'warning' ? '#f59e0b' :
                insight.type === 'positive' ? '#10b981' : '#2563eb'
            }
          ]}
        >
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.insightMessage}>{insight.message}</Text>
        </View>
      ))}

      <View style={{ height: 30 }} />
    </ScrollView>
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
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    padding: 20,
    paddingTop: 50,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  businessName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 6,
  },
  statCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  statTitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  statIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  monthCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  monthLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  monthValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  lowStockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fee2e2',
    gap: 8,
  },
  lowStockName: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 8,
    fontWeight: '500',
  },
  lowStockBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  lowStockBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  saleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  saleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  saleInfo: {
    flex: 1,
  },
  saleInvoice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  saleCustomer: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  saleAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  emptyBox: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 8,
    fontSize: 14,
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    elevation: 4,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  aiBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  insightCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  insightMessage: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
});

export default DashboardScreen;