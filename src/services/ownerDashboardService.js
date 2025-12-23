// services/dashboardService.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://103.184.0.121:8002";

export const fetchOwnerStats = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/api/dashboard/stats-shopowner/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to load dashboard stats");
    return data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};
