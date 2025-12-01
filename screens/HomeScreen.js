import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView 
      contentContainerStyle={{
        padding: 20,
      }}
      style={{ flex: 1, backgroundColor: "#E6C288" }}
    >
      <Text 
        style={{ 
          fontSize: 26, 
          fontWeight: "bold",
          marginTop: 40,
          textAlign: "center" 
        }}
      >
        Welcome to Grab and Go!
      </Text>
    </ScrollView>
  );
}

