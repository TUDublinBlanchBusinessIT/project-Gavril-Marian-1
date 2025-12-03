import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image,
  Alert, 
  StyleSheet
} from "react-native";

import { Picker } from "@react-native-picker/picker";
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
    <View style={styles.container}>

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

      <View style={styles.pickerBox}>
        <Picker
          selectedValue={category}
          onValueChange={(value) => setCategory(value)}
        >
          <Picker.Item label="Select Category" value="" />
          <Picker.Item label="Tools" value="tools" />
          <Picker.Item label="Electronics" value="electronics" />
          <Picker.Item label="Household" value="household" />
          <Picker.Item label="Books" value="books" />
          <Picker.Item label="Sports Equipment" value="sports" />
          <Picker.Item label="Games" value="games" />
          <Picker.Item label="Clothing" value="clothes" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

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

      {/* ⭐ PRICE WITH EURO SYMBOL ⭐ */}
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

      <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
        <Text style={styles.locationText}>Add My Location</Text>
      </TouchableOpacity>

      {address ? <Text style={styles.address}>{address}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Post Item</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6C288",
    padding: 20,
    alignItems: "center",
    paddingTop: 40,
  },

  imageWrapper: {
    alignItems: "center",
    marginBottom: 15,
  },

  image: {
    width: 160,
    height: 160,
    borderRadius: 10,
    backgroundColor: "#E8DCC3",
  },

  addImageButton: {
    backgroundColor: "#5A3E2B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },

  addImageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  pickerBox: {
    width: "100%",
    backgroundColor: "#E8DCC3",
    borderRadius: 12,
    marginBottom: 18,
  },

  input: {
    width: "100%",
    backgroundColor: "#E8DCC3",
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    color: "#312E2E",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8DCC3",
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    width: "100%",
  },

  euroSymbol: {
    fontSize: 18,
    color: "#312E2E",
    fontWeight: "bold",
    marginRight: 8,
  },

  priceInput: {
    flex: 1,
    fontSize: 16,
    color: "#312E2E",
  },

  locationButton: {
    backgroundColor: "#E8DCC3",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },

  locationText: {
    fontSize: 16,
    color: "#312E2E",
    fontWeight: "bold",
  },

  address: {
    fontSize: 16,
    marginBottom: 25,
    color: "#312E2E",
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#5A3E2B",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
