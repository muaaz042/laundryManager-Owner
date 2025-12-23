import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Store, MapPin, Phone, Mail } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { fetchShops } from "../../services/shopService";

export default function ShopScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const getShops = async (url = null, append = false) => {
    try {
      const { results, next } = await fetchShops(url);
      setNextPageUrl(next);
      if (append) setShops((prev) => [...prev, ...results]);
      else setShops(results);
    } catch (error) {
      console.error("Failed to load shops:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getShops();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    getShops();
  };

  const loadMore = () => {
    if (nextPageUrl && !loadingMore) {
      setLoadingMore(true);
      getShops(nextPageUrl, true);
    }
  };

  const renderShop = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("ShopDetailScreen", { shop: item })}
    >
      <LinearGradient colors={["#e0f2fe", "#ffffff"]} style={styles.cardInner}>
        <View style={styles.imageContainer}>
          {item.logo ? (
            <Image source={{ uri: item.logo }} style={styles.logo} />
          ) : (
            <View style={styles.placeholder}>
              <Store size={30} color="#2563eb" />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.shopName} numberOfLines={1}>
            {item.name}
          </Text>

          {item.phone && (
            <View style={styles.row}>
              <Phone size={14} color="#2563eb" style={styles.icon} />
              <Text style={styles.text}>{item.phone}</Text>
            </View>
          )}

          {item.email && (
            <View style={styles.row}>
              <Mail size={14} color="#2563eb" style={styles.icon} />
              <Text style={styles.text}>{item.email}</Text>
            </View>
          )}

          {item.address && (
            <View style={styles.row}>
              <MapPin size={14} color="#2563eb" style={styles.icon} />
              <Text style={styles.text}>{item.address}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ color: "#2563eb", marginTop: 8 }}>Loading shops...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {shops.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Store size={60} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No Shops Available</Text>
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderShop}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color="#2563eb"
                style={{ marginVertical: 10 }}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f9ff" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#334155",
    marginTop: 12,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    backgroundColor: "#fff",
  },
  cardInner: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 16,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  shopName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  icon: { marginRight: 6 },
  text: {
    color: "#2563eb",
    fontSize: 13,
    flexShrink: 1,
  },
});
