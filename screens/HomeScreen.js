import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firebase } from "../firebase/firebase";
import * as Location from "expo-location";

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [locationText, setLocationText] = useState("");
  const [recentItems, setRecentItems] = useState([]);

  const user = firebase.auth().currentUser;

  useEffect(() => {
    firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (doc.exists) setUsername(doc.data().username);
      });

    const unsubscribe = firebase
      .firestore()
      .collection("lend_items")
      .orderBy("createdAt", "desc")
      .limit(10)
      .onSnapshot((snapshot) => {
        const items = snapshot.docs
          .filter((doc) => doc && doc.data())
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || "Untitled Item",
              imageBase64: data.imageBase64 || null,
              category: data.category || "",
              price: data.price || "",
              address: data.address || "Location not provided",
              ownerId: data.ownerId || "",
              ownerName: data.ownerName || "",
            };
          });

        setRecentItems(items);
      });

    return unsubscribe;
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
      setLocationText(`${a.street || ""}, ${a.city || ""}, ${a.region || ""}`);
    }
  };

  const renderItem = ({ item }) => {
    if (!item) return null;

    const imageSource = item.imageBase64
      ? { uri: item.imageBase64 }
      : require("../assets/defaultProfile.png");

    return (
      <TouchableOpacity
        style={styles.carouselCard}
        onPress={() =>
          navigation.navigate("ItemDetails", {
            itemData: item,
          })
        }
      >
        <Image source={imageSource} style={styles.carouselImage} />
        <Text style={styles.carouselItemTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      <Text style={styles.welcomeText}>
        Welcome back{username ? `, ${username}` : ""}!
      </Text>

      <Text style={styles.tagline}>Grab&Go — borrow easy, lend smarter.</Text>

      {/* RECENTLY ADDED SECTION */}
      <View style={styles.carouselContainer}>
        <Text style={styles.carouselTitle}>Recently Added</Text>

        <FlatList
          data={recentItems}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* INSTAGRAM CARD (restored UI) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Check Our Instagram for News!</Text>

        <TouchableOpacity
          style={styles.igButton}
          onPress={() =>
            Linking.openURL(
              "https://www.instagram.com/grabgo_company?igsh=M2JzbjZqZHFha3lr&utm_source=qr"
            )
          }
        >
          <Ionicons name="logo-instagram" size={22} color="white" />
          <Text style={styles.igButtonText}>Open Instagram</Text>
        </TouchableOpacity>
      </View>

      {/* LOCATION CARD (restored UI) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Use My Current Location</Text>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleGetLocation}
        >
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

  welcomeText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#312E2E",
    marginTop: 20,
  },

  tagline: {
    fontSize: 16,
    fontWeight: "500",
    color: "#5A3E2B",
    marginTop: 4,
    marginBottom: 25,
    opacity: 0.9,
  },

  /* RECENT ITEMS */
  carouselContainer: {
    marginBottom: 30,
  },
  carouselTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#5A3E2B",
    marginBottom: 12,
  },
  carouselCard: {
    backgroundColor: "#E8DCC3",
    width: 150,
    height: 180,
    borderRadius: 16,
    padding: 10,
    marginRight: 12,
  },
  carouselImage: {
    width: "100%",
    height: 110,
    borderRadius: 10,
  },
  carouselItemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#312E2E",
    marginTop: 10,
  },

  /* CARDS */
  card: {
    backgroundColor: "#E8DCC3",
    padding: 20,
    borderRadius: 12,
    marginTop: 15,
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
    fontWeight: "600",
    color: "#312E2E",
  },
});
