import React from "react";
import { View, Text,TouchableOpacity, Alert } from "react-native";
import { firebase } from "../firebase/firebase";


export default function ProfileScreen({ navigation }) {

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            firebase.auth().signOut()
              .then(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              })
              .catch((err) => Alert.alert("Error", err.message));
          }
        }
      ]
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#E6C288",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
      }}
    >
      <Text
        style={{
          fontSize: 26,
          fontWeight: "bold",
          marginBottom: 30,
        }}
      >
        Profile
      </Text>

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: "#E8DCC3",
          paddingVertical: 15,
          paddingHorizontal: 40,
          borderRadius: 10,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#312E2E" }}>
          Log Out
        </Text>
      </TouchableOpacity>
    </View>
  );
}