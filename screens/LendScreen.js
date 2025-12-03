import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { firebase } from "../firebase/firebase";

export default function LendScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [showCategories, setShowCategories] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64Img = "data:image/jpeg;base64," + result.assets[0].base64;
      setImageBase64(base64Img);
    }
  };

  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const reverse = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });

    const a = reverse[0];
    const fullAddress = `${a.street || ""}, ${a.city || ""}, ${a.region || ""}`;

    setAddress(fullAddress);
    setCoords({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  const handleSave = async () => {
    if (!title || !desc || !price || !address || !category || !imageBase64) {
      Alert.alert("Error", "Please complete all fields & select an image.");
      return;
    }

    const user = firebase.auth().currentUser;

    await firebase.firestore().collection("lend_items").add({
      title,
      desc,
      price,
      category,
      ownerId: user.uid,
      imageBase64,
      address,
      latitude: coords.latitude,
      longitude: coords.longitude,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    Alert.alert("Success!", "Item posted successfully.");
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>

        {/* IMAGE */}
        <View style={styles.imageWrapper}>
          <Image
            source={
              imageBase64
                ? { uri: imageBase64 }
                : require("../assets/defaultProduct.png")
            }
            style={styles.image}
          />

          <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
            <Text style={styles.addImageText}>
              {imageBase64 ? "Change Image" : "Add Image"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowCategories(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : "Select Category"}
          </Text>
        </TouchableOpacity>


        <TextInput
          placeholder="Title"
          placeholderTextColor="#7A7A7A"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />


        <TextInput
          placeholder="Description"
          placeholderTextColor="#7A7A7A"
          value={desc}
          onChangeText={setDesc}
          style={styles.input}
        />

        {/* PRICE */}
        <View style={styles.priceRow}>
          <Text style={styles.euroSymbol}>€</Text>
          <TextInput
            placeholder="Price"
            placeholderTextColor="#7A7A7A"
            value={price}
            onChangeText={setPrice}
            style={styles.priceInput}
            keyboardType="numeric"
          />
        </View>

        {/* LOCATION */}
        <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
          <Text style={styles.locationButtonText}>Add My Location</Text>
        </TouchableOpacity>

        {address ? (
          <Text style={styles.addressText}>{address}</Text>
        ) : null}

        {/* POST BUTTON */}
        <TouchableOpacity style={styles.postButton} onPress={handleSave}>
          <Text style={styles.postButtonText}>Post Item</Text>
        </TouchableOpacity>

      </View>

      {/* CATEGORY MODAL */}
      {showCategories && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>Select Category</Text>

            {[
              "tools",
              "electronics",
              "household",
              "books",
              "sports",
              "games",
              "clothes",
              "other"
            ].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  setCategory(cat);
                  setShowCategories(false);
                }}
                style={styles.modalOption}
              >
                <Text style={styles.modalOptionText}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowCategories(false)}
              style={styles.modalCancel}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>

          </View>
        </View>
      )}

    </ScrollView>
  );
}

/* ----------------- STYLES ------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6C288",
  },

  card: {
    backgroundColor: "#E8DCC3",
    margin: 20,
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    elevation: 4,
  },

  imageWrapper: {
    alignItems: "center",
    marginBottom: 15,
  },

  image: {
    width: 160,
    height: 160,
    borderRadius: 12,
    backgroundColor: "#D8C7A5",
  },

  addImageButton: {
    backgroundColor: "#5A3E2B",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },

  addImageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  dropdownButton: {
    width: "100%",
    backgroundColor: "#F4EAD5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },

  dropdownButtonText: {
    fontSize: 16,
    color: "#312E2E",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    backgroundColor: "#F4EAD5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    color: "#312E2E",
    fontSize: 16,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4EAD5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    width: "100%",
  },

  euroSymbol: {
    fontSize: 18,
    color: "#312E2E",
    marginRight: 10,
    fontWeight: "bold",
  },

  priceInput: {
    flex: 1,
    fontSize: 16,
    color: "#312E2E",
  },

  locationButton: {
    backgroundColor: "#5A3E2B",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },

  locationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  addressText: {
    fontSize: 15,
    color: "#312E2E",
    marginBottom: 15,
    marginTop: -5,
  },

  postButton: {
    backgroundColor: "#5A3E2B",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },

  postButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  /* ---------- MODAL STYLES ----------- */

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    paddingBottom: 50,
  },

  modalBox: {
    backgroundColor: "#E8DCC3",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#312E2E",
  },

  modalOption: {
    paddingVertical: 12,
  },

  modalOptionText: {
    fontSize: 16,
    color: "#312E2E",
  },

  modalCancel: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: "#5A3E2B",
    borderRadius: 10,
    alignItems: "center",
  },

  modalCancelText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
