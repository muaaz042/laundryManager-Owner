// src/screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginToLMS } from "../services/LoginService";
import { User, Lock, LogIn, Eye, EyeOff } from "lucide-react-native";
import LinearGradient from "react-native-linear-gradient";
import CustomAlert from "../components/CustomAlert";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // CustomAlert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (message) => {
    setAlertMessage(message);
    setAlertVisible(true);
  };

const handleLogin = async () => {
    if (email.trim() === "" || password.trim() === "") {
      showAlert("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const response = await loginToLMS(email, password);
      const token = response?.access;
      const first_name = response?.user?.first_name;
      const role = response?.user?.role; 

      if (token) {
        // 1. Keep saving to storage (So the app remembers you next time you open it)
        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("first_name", first_name || "");
        await AsyncStorage.setItem("userRole", role || "manager"); 
        
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "HomeTabs",
              params: { 
                role: role || "manager", // <--- Passing the role directly
                name: first_name || ""   // <--- Passing the name directly
              }, 
            },
          ],
        });

      } else {
        showAlert("No token received");
      }
    } catch (error) {
      showAlert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };


  return (
    <LinearGradient
      colors={["#dbeafe", "#eff6ff", "#bfdbfe"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Image
            source={require("../assets/tracky.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.card}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>Log in to get started</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <User color="#2563eb" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Lock color="#2563eb" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff color="#2563eb" size={20} />
                ) : (
                  <Eye color="#2563eb" size={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={["#2563eb", "#1d4ed8"]}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.buttonContent}>
                    <LogIn color="#fff" size={20} style={{ marginRight: 8 }} />
                    <Text style={styles.buttonText}>Login</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: "#2563eb",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e3a8a",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#475569",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dbeafe",
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111",
  },
  button: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  registerText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
    fontSize: 15,
  },
  registerLink: {
    marginLeft: 8,
    textDecorationLine: "underline",
    color: "#2563eb",
    fontWeight: "700",
  },
});

export default LoginScreen;
