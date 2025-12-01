import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Linking, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firebase } from "../firebase/firebase";
import * as Location from "expo-location";

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [locationText, setLocationText] = useState("");

  const user = firebase.auth().currentUser;

  useEffect(() => {
    firebase.firestore()
      .collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (doc.exists) setUsername(doc.data().username);
      });
  }, []);

  
  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    
    
    const address = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });

    if (address.length > 0) {
      const a = address[0];

      const fullAddress = `${a.street || ""}, ${a.city || ""}, ${a.region || ""}`;

      setLocationText(fullAddress);
    }
  };

  return (
    <View style={styles.container}>
      

      
      <Text style={styles.welcomeText}>
        Welcome back{username ? `, ${username}` : ""}!
      </Text>

      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Check Our Instagram for News!</Text>

        <TouchableOpacity 
          style={styles.igButton}
          onPress={() => Linking.openURL("https://www.instagram.com/grabgo_company?igsh=M2JzbjZqZHFha3lr&utm_source=qr")}
        >
          <Ionicons name="logo-instagram" size={22} color="white" />
          <Text style={styles.igButtonText}>Open Instagram</Text>
        </TouchableOpacity>
      </View>

      
      <View style={styles.card}>

        <Text style={styles.cardTitle}>Use My Current Location</Text>

        <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
          <Ionicons name="location-outline" size={22} color="white" />
          <Text style={styles.locationButtonText}>Get My Location</Text>
        </TouchableOpacity>

        {locationText ? (
          <Text style={styles.locationText}>{locationText}</Text>
        ) : null}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6C288",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  menuButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },

  welcomeText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#312E2E",
    marginTop: 80,
  },

  card: {
    backgroundColor: "#E8DCC3",
    padding: 20,
    borderRadius: 12,
    marginTop: 30,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#312E2E",
    marginBottom: 15,
  },

  
  igButton: {
    flexDirection: "row",
    backgroundColor: "#D9534F",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  igButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },

  
  locationButton: {
    flexDirection: "row",
    backgroundColor: "#5A3E2B",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  locationButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },

  locationText: {
    marginTop: 10,
    fontSize: 16,
    color: "#312E2E",
    fontWeight: "600",
  },
});
