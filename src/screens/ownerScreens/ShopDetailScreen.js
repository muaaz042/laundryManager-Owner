import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Store, MapPin, Phone, Mail } from "lucide-react-native";

export default function ShopDetail({ route }) {
  const { shop } = route.params;

  // Exclude keys we don’t need to show
  const excludeKeys = ["id", "logo", "name", "address", "phone", "email", "description", "created_at", "is_active"];

  // Filter stats-type data
  const statsEntries = Object.entries(shop || {}).filter(
    ([key]) => !excludeKeys.includes(key)
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <LinearGradient colors={["#3b82f6", "#60a5fa"]} style={styles.header}>
        {shop.logo ? (
          <Image source={{ uri: shop.logo }} style={styles.logo} />
        ) : (
          <View style={styles.placeholder}>
            <Store size={60} color="#fff" />
          </View>
        )}
        <Text style={styles.shopName}>{shop.name || "Unnamed Shop"}</Text>
      </LinearGradient>

      {/* Basic Info */}
      <View style={styles.infoCard}>
        {shop.address && (
          <View style={styles.infoRow}>
            <MapPin size={18} color="#2563eb" />
            <Text style={styles.infoText}>{shop.address}</Text>
          </View>
        )}
        {shop.phone && (
          <View style={styles.infoRow}>
            <Phone size={18} color="#2563eb" />
            <Text style={styles.infoText}>{shop.phone}</Text>
          </View>
        )}
        {shop.email && (
          <View style={styles.infoRow}>
            <Mail size={18} color="#2563eb" />
            <Text style={styles.infoText}>{shop.email}</Text>
          </View>
        )}
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Shop Statistics</Text>
      <View style={styles.gridContainer}>
        {statsEntries.map(([key, value]) => (
          <View key={key} style={styles.gridItem}>
            <Text style={styles.gridLabel}>{key.replace(/_/g, " ").toUpperCase()}</Text>
            <Text style={styles.gridValue}>{String(value)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f0f9ff",
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 24,
    marginBottom: 20,
    elevation: 3,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  placeholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  shopName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#1e293b",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  gridItem: {
    backgroundColor: "#fff",
    width: "48%",
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 6,
  },
  gridValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1e293b",
  },
});
