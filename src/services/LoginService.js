// src/services/LoginService.js
import { baseUrl } from "../utils/utils"

export const loginToLMS = async (email, password) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  const res = await fetch(`${baseUrl}/api/users/auth/token/`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};