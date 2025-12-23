import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Alert,
  RefreshControl,
  Modal,
  FlatList,
} from "react-native";
import { format, subWeeks, subMonths, subYears } from "date-fns";
import { Download, TrendingUp, Package, Clock, CheckCircle, XCircle, CalendarDays } from "lucide-react-native";

import { fetchReports, downloadReportAsPDF } from "../../services/reportService";

const screenWidth = Dimensions.get("window").width - 32;

export default function ReportDetailScreen({ route }) {
  const { shop_id, shop_name } = route.params;

  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({});
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Filter State
  const [activeFilter, setActiveFilter] = useState("Weekly");
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());

  const getReports = async (start = startDate, end = endDate) => {
    try {
      setLoading(true);
      const data = await fetchReports({
        shop_id,
        start_date: format(start, "yyyy-MM-dd"),
        end_date: format(end, "yyyy-MM-dd"),
      });
      setOrders(data.orders || []);
      setSummary(data.summary || {});
      setDailyStats(data.daily_stats || []);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch report data.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType) => {
    setActiveFilter(filterType);
    const end = new Date();
    let start = new Date();

    if (filterType === "Weekly") start = subWeeks(end, 1);
    else if (filterType === "Monthly") start = subMonths(end, 1);
    else if (filterType === "Yearly") start = subYears(end, 1);

    setStartDate(start);
    setEndDate(end);
    getReports(start, end);
  };

  const performDownload = async () => {
    try {
      setDownloading(true);
      await downloadReportAsPDF({
        shop_id,
        shop_name,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to generate PDF report.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (downloading) return;

    if (Platform.OS === "ios" || Platform.Version >= 33) {
      await performDownload();
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Storage Permission Required",
          message: "This app needs access to your storage to download the PDF report.",
          buttonPositive: "OK",
          buttonNegative: "Cancel",
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await performDownload();
      } else {
        Alert.alert("Permission Denied", "Storage permission is required to download the report.");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    handleFilterChange("Weekly");
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await getReports(startDate, endDate);
    setRefreshing(false);
  }, [startDate, endDate]);

  const FilterButton = ({ title }) => (
    <TouchableOpacity
      style={[styles.filterTab, activeFilter === title && styles.filterTabActive]}
      onPress={() => handleFilterChange(title)}
    >
      <Text style={[styles.filterTabText, activeFilter === title && styles.filterTabTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !summary.total_orders) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading report data...</Text>
      </View>
    );
  }

  const statusItems = [
    { label: "Total Orders", value: summary.total_orders, icon: TrendingUp, color: "#0f172a", bgColor: "#f1f5f9" },
    { label: "Received", value: summary.received_orders, icon: Package, color: "#3b82f6", bgColor: "#dbeafe" },
    { label: "In Progress", value: summary.in_progress_orders, icon: Clock, color: "#f59e0b", bgColor: "#fef3c7" },
    { label: "Ready", value: summary.ready_orders, icon: CheckCircle, color: "#8b5cf6", bgColor: "#ede9fe" },
    { label: "Collected", value: summary.collected_orders, icon: CheckCircle, color: "#10b981", bgColor: "#d1fae5" },
    { label: "Cancelled", value: summary.cancelled_orders, icon: XCircle, color: "#ef4444", bgColor: "#fee2e2" },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3b82f6"]} />}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{shop_name}</Text>
        <Text style={styles.subheader}>Analytics & Reports</Text>
      </View>

      {/* Filter Section */}
      <View style={styles.filterCard}>
        <View style={styles.filterHeaderRow}>
          <CalendarDays size={20} color="#64748b" />
          <Text style={styles.filterTitle}>Report Period</Text>
        </View>

        <View style={styles.filterTabsContainer}>
          <FilterButton title="Weekly" />
          <FilterButton title="Monthly" />
          <FilterButton title="Yearly" />
        </View>

        <Text style={styles.dateRangeText}>
          Showing data: {format(startDate, "MMM dd")} - {format(endDate, "MMM dd, yyyy")}
        </Text>
      </View>

      {/* Status Section */}
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Order Status</Text>
        <View style={styles.statusGrid}>
          {statusItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <View key={index} style={styles.statusCard}>
                <View style={[styles.statusIconBadge, { backgroundColor: item.bgColor }]}>
                  <IconComponent size={20} color={item.color} />
                </View>
                <Text style={styles.statusValue}>{item.value ?? 0}</Text>
                <Text style={styles.statusLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Order Details Button */}
      <View style={{ marginTop: 10, marginBottom: 30 }}>
        <TouchableOpacity
          style={[styles.downloadButton, { justifyContent: "center" }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.downloadButtonText}>Order Details</Text>
        </TouchableOpacity>
      </View>

      {/* Orders Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
          <View style={{ padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "700" }}>Orders {orders.length}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: "#3b82f6", fontWeight: "700" }}>Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={orders}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <View style={styles.orderCard}>
                <View>
                  <Text style={styles.orderId}>Order #{item.id}</Text>
                  <Text style={styles.orderPhone}>{item.customer_phone || "No Phone"}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.orderAmount}>Rs {item.total_amount}</Text>
                  <Text style={[styles.orderStatus, styles[item.status]]}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
            )}
          />

          {/* Download Button */}
          <TouchableOpacity
            style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
            onPress={handleDownloadPDF}
            disabled={downloading}
            activeOpacity={0.8}
          >
            <Download size={20} color="#fff" />
            <Text style={styles.downloadButtonText}>
              {downloading ? "Generating PDF..." : `Download ${activeFilter} Report`}
            </Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </View>
      </Modal>
    </ScrollView>
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
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  subheader: {
    fontSize: 14,
    color: "#64748b",
  },
  // New Filter Styles
  filterCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  filterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  filterTabsContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  /** SUMMARY GRID **/
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    color: "#222",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 2,
  },
  summaryValue: { fontSize: 20, fontWeight: "bold", color: "#1e90ff" },
  summaryLabel: { fontSize: 13, color: "#666", marginTop: 4 },

  /** ORDERS LIST **/
  listContainer: {
    marginTop: 10,
    marginLeft: 16,
    marginRight: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,

    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },
  orderId: { fontWeight: "bold", fontSize: 15, color: "#222" },
  orderPhone: { color: "#666", marginTop: 4, fontSize: 13 },
  orderAmount: { fontSize: 16, fontWeight: "bold", color: "#27ae60" },
  orderStatus: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    fontWeight: "bold",
    color: "#fff",
  },

  // STATUS COLORS
  received: { backgroundColor: "#3498db" },
  in_progress: { backgroundColor: "#f1c40f" },
  ready: { backgroundColor: "#9b59b6" },
  collected: { backgroundColor: "#27ae60" },
  cancelled: { backgroundColor: "#e74c3c" },
  requested: { backgroundColor: "#95a5a6" },

  /** DAILY STATS **/
  dailyStatsWrapper: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  dailyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  dailyDate: { fontSize: 14, color: "#222" },
  dailyOrders: { fontSize: 14, color: "#555" },
  dailyRevenue: { fontSize: 14, color: "#27ae60", fontWeight: "bold" },
  filterTabActive: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  filterTabTextActive: {
    color: "#3b82f6",
  },
  dateRangeText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#94a3b8',
  },
  // Existing Styles
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  statusSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statusCard: {
    width: (screenWidth - 64) / 2,
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  statusIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  chartSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  chartContainer: {
    alignItems: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  downloadButton: {
    flexDirection: "row",
    backgroundColor: "#10b981",
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  downloadButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  downloadButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});