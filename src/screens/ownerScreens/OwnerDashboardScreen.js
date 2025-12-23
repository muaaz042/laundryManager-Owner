import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  Store,
  ShoppingBag,
  Users,
  DollarSign,
  UserCheck,
  UserX,
  ListChecks,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { fetchOwnerStats } from "../../services/ownerDashboardService";

export default function OwnerDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const data = await fetchOwnerStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: "#2563eb" }}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load dashboard data.</Text>
      </View>
    );
  }

  // ✅ Cards based on given stats
  const cards = [
    {
      id: 1,
      label: "Total Shops",
      value: stats.total_shops,
      colors: ["#3b82f6", "#60a5fa"],
      icon: <Store size={32} color="#fff" />,
    },
    {
      id: 2,
      label: "Total Orders",
      value: stats.total_orders,
      colors: ["#10b981", "#34d399"],
      icon: <ShoppingBag size={32} color="#fff" />,
    },
    {
      id: 3,
      label: "Total Revenue",
      value: `Rs.${stats.total_revenue}`,
      colors: ["#f59e0b", "#fbbf24"],
      icon: <DollarSign size={32} color="#fff" />,
    },
    {
      id: 4,
      label: "Registered Customers",
      value: stats.registered_customers,
      colors: ["#8b5cf6", "#a78bfa"],
      icon: <UserCheck size={32} color="#fff" />,
    },
    {
      id: 5,
      label: "Unregistered Customers",
      value: stats.unregistered_customers,
      colors: ["#ef4444", "#f87171"],
      icon: <UserX size={32} color="#fff" />,
    },
    {
      id: 6,
      label: "Total Customers",
      value: stats.total_customers,
      colors: ["#0ea5e9", "#38bdf8"],
      icon: <Users size={32} color="#fff" />,
    },
    {
      id: 7,
      label: "Total Services",
      value: stats.total_services,
      colors: ["#22c55e", "#86efac"],
      icon: <ListChecks size={32} color="#fff" />,
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.cardContainer}>
        {cards.map((card) => (
          <View key={card.id} style={{ width: "48%", marginBottom: 16 }}>
            <LinearGradient colors={card.colors} style={styles.card}>
              {card.icon}
              <Text style={styles.cardLabel}>{card.label}</Text>
              <Text style={styles.cardValue}>{card.value}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 24,
    backgroundColor: "#f0f9ff",
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "800",
    color: "#1e3a8a",
    textAlign: "center",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    height: 140,
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
    elevation: 5,
  },
  cardLabel: {
    color: "#e0f2fe",
    fontSize: 15,
    fontWeight: "600",
  },
  cardValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "right",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
