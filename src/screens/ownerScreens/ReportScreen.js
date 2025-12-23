import React, { useEffect, useState, useCallback } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl 
} from "react-native";
import { fetchReports } from "../../services/reportService";
import { Layers, ListChecks, ChevronRight, Store } from "lucide-react-native";

export default function ReportScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getReports = useCallback(async () => {
    try {
      // Only show full screen loader on initial load, not on refresh
      if (!refreshing && shops.length === 0) setLoading(true);
      
      const data = await fetchReports();
      setShops(data.shops || []);
      setSummary(data.summary || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing, shops.length]);

  useEffect(() => {
    getReports();
  }, [getReports]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getReports();
  }, [getReports]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  const renderShopItem = ({ item }) => (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() => navigation.navigate("ReportDetailScreen", { shop_id: item.id, shop_name: item.name })}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Store size={24} color="#3b82f6" />
        </View>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{item.name}</Text>
          <Text style={styles.shopSubtext}>View detailed report</Text>
        </View>
        <ChevronRight size={24} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );

  // This component contains everything above the list
  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Reports Overview</Text>
        <Text style={styles.subheader}>Track your business performance</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={[styles.iconBadge, { backgroundColor: "#dbeafe" }]}>
            <ListChecks size={28} color="#3b82f6" />
          </View>
          <Text style={styles.summaryLabel}>Total Orders</Text>
          <Text style={styles.summaryValue}>{summary.total_orders ?? 0}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.iconBadge, { backgroundColor: "#dcfce7" }]}>
            <Layers size={28} color="#16a34a" />
          </View>
          <Text style={styles.summaryLabel}>Revenue</Text>
          <Text style={[styles.summaryValue, { color: "#16a34a" }]}>
            {(summary.revenue ?? 0).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Shops List Title */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Shops</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{shops.length}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={shops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderShopItem}
        // Pass the header content here
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // This refresh control now pulls down the entire page including the header
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#3b82f6" 
            colors={["#3b82f6"]} // Android specific
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  subheader: {
    fontSize: 14,
    color: "#64748b",
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 20, 
  },
  shopCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 16, // Added Horizontal margin specifically for cards
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 2,
  },
  shopSubtext: {
    fontSize: 13,
    color: "#94a3b8",
  },
});