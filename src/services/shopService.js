import AsyncStorage from "@react-native-async-storage/async-storage";

// 📦 Fetch all public shops (with pagination)
export const fetchShops = async (url = null) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("No authentication token found");

    const endpoint =
      url || "http://103.184.0.121:8002/api/Shops/owner/";

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch shops");
    }

    return {
      results: data.results || [],
      next: data.next,
      previous: data.previous,
    };
  } catch (error) {
    console.error("Error fetching shops:", error);
    throw error;
  }
};