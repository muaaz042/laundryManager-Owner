import React, { useState, useCallback } from "react";
import { View, ActivityIndicator, TouchableOpacity } from "react-native";
import { enableScreens } from "react-native-screens";
enableScreens();

import { NavigationContainer, useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { ChartNoAxesCombined, ScanQrCode, Store, FileText, LogOut } from "lucide-react-native";


import LoginScreen from "./src/screens/LoginScreen";
import ManagerDashboardScreen from './src/screens/managerScreens/ManagerDashboardScreen';
import ScanBarcodeScreen from './src/screens/managerScreens/ScanBarcodeScreen';
import OwnerDashboardScreen from './src/screens/ownerScreens/OwnerDashboardScreen';
import ReportScreen from './src/screens/ownerScreens/ReportScreen';
import ReportDetailScreen from './src/screens/ownerScreens/ReportDetailScreen';
import ShopScreen from './src/screens/ownerScreens/ShopScreen';
import ShopDetailScreen from './src/screens/ownerScreens/ShopDetailScreen'


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("first_name");
    await AsyncStorage.removeItem("userRole");

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  // 1. Get params from the previous screen
  const route = useRoute();
  const { role: paramRole, name: paramName } = route.params || {};

  // 2. Initialize state using params if they exist
  const [userFirstName, setUserFirstName] = useState(paramName || "");
  const [role, setRole] = useState(paramRole || "");

  const [isLoading, setIsLoading] = useState(!paramRole);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        // If we already have the role from params, we can skip the async fetch
        if (role) return;

        try {
          const name = await AsyncStorage.getItem("first_name");
          if (name) setUserFirstName(name);

          const r = await AsyncStorage.getItem("userRole");
          if (r) setRole(r);
        } catch (e) {
          console.error("Error loading auth info", e);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, [role])
  );

  // 🔥 Dynamic screens based on role
  const isOwner = role === "shopowner";

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      key={role}
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: { fontWeight: "700", fontSize: 12 },
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#e2e8f0",
        },
        headerStyle: { backgroundColor: "#2563eb" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold", fontSize: 20 },

        // 🔥 Logout button in header-right
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
            <LogOut color="white" size={26} />
          </TouchableOpacity>
        ),
      }}
    >

      {/* --------- MANAGER SCREENS --------- */}
      {!isOwner && (
        <>
          <Tab.Screen
            name="ManagerDashboardScreen"
            component={ManagerDashboardScreen}
            options={{
              title: userFirstName ? `Welcome, ${userFirstName}` : "Dashboard",
              tabBarLabel: "Dashboard",
              tabBarIcon: ({ color }) => (
                <ChartNoAxesCombined color={color} size={30} />
              ),
            }}
          />

          <Tab.Screen
            name="ScanBarcodeScreen"
            component={ScanBarcodeScreen}
            options={{
              title: "Scan Barcode",
              tabBarLabel: "Scan",
              tabBarIcon: ({ color }) => (
                <ScanQrCode color={color} size={30} />
              ),
            }}
          />
        </>
      )}

      {/* --------- OWNER SCREENS --------- */}
      {isOwner && (
        <>
          <Tab.Screen
            name="OwnerDashboardScreen"
            component={OwnerDashboardScreen}
            options={{
              title: "Owner Dashboard",
              tabBarLabel: "Dashboard",
              tabBarIcon: ({ color }) => (
                <ChartNoAxesCombined color={color} size={30} />
              ),
            }}
          />

          <Tab.Screen
            name="ShopScreen"
            component={ShopScreen}
            options={{
              title: "Shops",
              tabBarLabel: "Shops",
              tabBarIcon: ({ color }) => (
                <Store color={color} size={30} />
              ),
            }}
          />

          <Tab.Screen
            name="ReportScreen"
            component={ReportScreen}
            options={{
              title: "Reports",
              tabBarLabel: "Reports",
              tabBarIcon: ({ color }) => (
                <FileText color={color} size={30} />
              ),
            }}
          />
        </>
      )}

    </Tab.Navigator>
  );
}


export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="HomeTabs" component={BottomTabs} />

          <Stack.Screen
            name="ShopDetailScreen"
            component={ShopDetailScreen}
            options={{
              headerShown: true,
              title: "Shop Details",
              headerStyle: { backgroundColor: "#2563eb" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
            }}
          />

          <Stack.Screen
            name="ReportDetailScreen"
            component={ReportDetailScreen}
            options={{
              headerShown: true,
              title: "Report Details",
              headerStyle: { backgroundColor: "#2563eb" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold", fontSize: 20 },
            }}
          />


        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
