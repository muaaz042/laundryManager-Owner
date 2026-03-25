import { baseUrl } from "../utils/utils"
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function verifyToken(qrData) {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) throw new Error("No authentication token found");


  const res = await fetch(
    `${baseUrl}/api/orders/orders/${qrData.order_id}/verify_collection_token/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ token: qrData.collection_token }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    let errorMessage = "Verification failed. Unknown error.";

    if (data.error === "Invalid token") {
      errorMessage = "The QR token has expired or already been used.";
    } else if (data.error) {
      errorMessage = data.error;
    } else if (data.message) {
      errorMessage = data.message;
    }

    const error = new Error(errorMessage);
    error.data = data;
    throw error;
  }


  return data;
}