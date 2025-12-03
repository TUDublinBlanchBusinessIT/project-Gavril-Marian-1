import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LendScreen from "../screens/LendScreen";


const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#E8DCC3",
          height: 60,
          paddingBottom: 5,
        },

        tabBarActiveTintColor: "#312E2E",
        tabBarInactiveTintColor: "#7A7A7A",

        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "HomeTab") iconName = "home-outline";
          if (route.name === "Search") iconName = "search-outline";
          if (route.name === "Messages") iconName = "chatbubble-outline";
          if (route.name === "Profile") iconName = "person-circle-outline";
          if (route.name === "Lend") iconName = "add-circle-outline";

          return <Ionicons name={iconName} size={25} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Lend" component={LendScreen} />
    </Tab.Navigator>
  );
}
