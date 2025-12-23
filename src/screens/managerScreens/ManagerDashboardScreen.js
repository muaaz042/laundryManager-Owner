import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { fetchManagerStats } from "../../services/managerDashboardService";

import {
  Package,        
  Wrench,    
  Banknote,       
  Users,          
  User,           
  Users2,         
  Cog,            
  BarChart,    
  AlertTriangle
} from "lucide-react-native";

export default function ManagerDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");
      if (!loading) setRefreshing(true);
      const data = await fetchManagerStats();
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <AlertTriangle color={colors.error} size={40} />
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }
  
  // Helper to determine card style based on metric
  const getCardStyle = (label) => {
    if (label === "Total Revenue" || label === "Total Orders") {
      return styles.highlightCard;
    } else if (label === "In Progress Orders") {
      return styles.warningCard;
    }
    return styles.defaultCard;
  };
  
  // Helper to determine icon component based on metric
  const getCardIcon = (label) => {
    switch(label) {
        case "Total Orders": return Package;
        case "In Progress Orders": return Wrench;
        case "Total Revenue": return Banknote;
        case "Registered Customers": return Users;
        case "Unregistered Customers": return User;
        case "Total Customers": return Users2;
        case "Total Services": return Cog;
        default: return BarChart;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadDashboard} colors={[colors.primary]} tintColor={colors.primary} />}
    >
      {/* HEADER CARD */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>{stats.shop_name}</Text>
        <Text style={styles.headerSubtitle}>Shop Dashboard</Text>
      </View>

      <Text style={styles.sectionTitle}>Key Metrics</Text>
      
      {/* --- REVENUE CARD (Full Width) --- */}
      {renderBox(
        "Total Revenue", 
        `Rs. ${stats.total_revenue}`, 
        getCardStyle("Total Revenue"), 
        getCardIcon("Total Revenue"),
        styles.fullWidthCard // Apply full-width style
      )}

      {/* --- OTHER KEY METRICS (Grid) --- */}
      <View style={styles.grid}>
        {renderBox("Total Orders", stats.total_orders, getCardStyle("Total Orders"), getCardIcon("Total Orders"))}
        {renderBox("In Progress Orders", stats.in_progress_orders, getCardStyle("In Progress Orders"), getCardIcon("In Progress Orders"))}
      </View>

      <Text style={styles.sectionTitle}>Customer & Service</Text>

      {/* --- CUSTOMER STATS (Grid) --- */}
      <View style={styles.grid}>
        {renderBox("Registered Customers", stats.registered_customers, getCardStyle("Registered Customers"), getCardIcon("Registered Customers"))}
        {renderBox("Unregistered Customers", stats.unregistered_customers, getCardStyle("Unregistered Customers"), getCardIcon("Unregistered Customers"))}
        {renderBox("Total Customers", stats.total_customers, getCardStyle("Total Customers"), getCardIcon("Total Customers"))}
        {renderBox("Total Services", stats.total_services, getCardStyle("Total Services"), getCardIcon("Total Services"))}
      </View>
    </ScrollView>
  );
}


const renderBox = (label, value, cardStyle, IconComponent, cardWidthStyle = {}) => {
  // Get the icon color from the dynamic card style
  const iconColor = cardStyle.cardValue.color;
  
  return (
    <View style={[styles.card, cardStyle, cardWidthStyle]} key={label}>
      <IconComponent size={30} color={iconColor} style={styles.cardIcon} />
      <Text style={cardStyle.cardValue}>{value}</Text>
      <Text style={cardStyle.cardLabel}>{label}</Text>
    </View>
  );
};

const colors = {
    primary: "#1d4ed8", // Strong Blue
    secondary: "#93c5fd", // Light Blue
    background: "#f8fafc", // Very Light Gray/Blue
    text: "#1e293b", // Dark Text
    label: "#475569", // Subdued Text
    highlightBg: "#dbeafe", // Very Light Primary
    warningBg: "#fef3c7", // Light Yellow
    warning: "#d97706", // Darker Yellow
    error: "#ef4444", // Red
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
    headerCard: {
    backgroundColor: "#2563eb",
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#2563eb",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textTransform: "capitalize",
  },

  headerSubtitle: {
    color: "#e0e7ff",
    marginTop: 4,
    fontSize: 14,
  },
  shopTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    textTransform: "capitalize",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 15,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  
  // --- CARD STYLES ---
  card: {
    width: "48%", // Default width
    marginBottom: 15,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    alignItems: "center",
    justifyContent: 'center',
  },
  
  fullWidthCard: {
    width: "100%", // Override for full-width card
  },

  // Default Card (for most stats)
  defaultCard: {
    backgroundColor: "#fff",
    cardValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.primary, // Primary color for value
    },
    cardLabel: {
        marginTop: 5,
        fontSize: 14,
        color: colors.label,
        textAlign: "center",
        fontWeight: "500",
    },
  },

  // Highlight Card (for Revenue, Total Orders)
  highlightCard: {
    backgroundColor: colors.highlightBg,
    borderWidth: 1,
    borderColor: colors.primary,
    cardValue: {
        fontSize: 26,
        fontWeight: "900",
        color: colors.primary,
    },
    cardLabel: {
        marginTop: 5,
        fontSize: 15,
        color: colors.text,
        textAlign: "center",
        fontWeight: "600",
    },
  },

  // Warning Card (for In Progress Orders)
  warningCard: {
    backgroundColor: colors.warningBg,
    cardValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.warning,
    },
    cardLabel: {
        marginTop: 5,
        fontSize: 14,
        color: colors.warning,
        textAlign: "center",
        fontWeight: "500",
    },
  },

  cardIcon: {
    marginBottom: 10, // Use margin for spacing
  },
  
  // --- LOADING/ERROR STYLES ---
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  loadingText: {
      marginTop: 15,
      fontSize: 16,
      color: colors.label,
  },
  errorText: {
      color: colors.error,
      fontSize: 18,
      fontWeight: "600",
      textAlign: 'center',
      marginTop: 15,
  }
});