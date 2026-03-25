import AsyncStorage from "@react-native-async-storage/async-storage";
import { baseUrl } from "../utils/utils"

// 📦 Fetch all public shops (with pagination)
export const fetchShops = async (url = null) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("No authentication token found");

    const endpoint =
      url || `${baseUrl}/api/Shops/owner/`;

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