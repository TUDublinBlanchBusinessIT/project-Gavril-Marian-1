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
  const [imageUri, setImageUri] = useState(null);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
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
      longitude: loc.coords.longitude
    });

    Alert.alert("Success", "Location added to your item.");
  };

  const uploadImageToStorage = async () => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const filename = "lend_item_" + Date.now();
    const ref = firebase.storage().ref().child("lendItems/" + filename);

    await ref.put(blob);
    return await ref.getDownloadURL();
  };

  const handleSave = async () => {
    if (!title || !desc || !price || !imageUri || !address || !category) {
      Alert.alert("Error", "Please fill all fields, choose image, and select category.");
      return;
    }

    const imageUrl = await uploadImageToStorage();
    const user = firebase.auth().currentUser;

    await firebase.firestore().collection("lend_items").add({
      title,
      desc,
      price,
      category,
      imageUrl,
      ownerId: user.uid,
      address,
      latitude: coords.latitude,
      longitude: coords.longitude,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    Alert.alert("Success!", "Item added for lending.");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>

      {/* IMAGE PICKER */}
      <TouchableOpacity onPress={pickImage} style={{ marginTop: 40 }}>
        <Image
          source={
            imageUri ? { uri: imageUri } : require("../assets/defaultProduct.png")
          }
          style={styles.image}
        />
      </TouchableOpacity>

      {/* TITLE */}
      <TextInput 
        placeholder="Title" 
        value={title} 
        onChangeText={setTitle} 
        style={styles.input} 
        placeholderTextColor="#7A7A7A"
      />

      {/* DESCRIPTION */}
      <TextInput 
        placeholder="Description" 
        value={desc} 
        onChangeText={setDesc} 
        style={styles.input} 
        placeholderTextColor="#7A7A7A"
      />

      {/* PRICE */}
      <TextInput 
        placeholder="Price (€)" 
        value={price} 
        onChangeText={setPrice} 
        style={styles.input}
        keyboardType="numeric"
        placeholderTextColor="#7A7A7A"
      />

      {/* CATEGORY DROPDOWN */}
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
          <Picker.Item label="Clothing & Accessories" value="clothes" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

      {/* LOCATION BUTTON */}
      <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
        <Text style={styles.locationText}>Add My Location</Text>
      </TouchableOpacity>

      {address ? <Text style={styles.address}>{address}</Text> : null}

      {/* SAVE BUTTON */}
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
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 10,
    backgroundColor: "#E8DCC3",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#E8DCC3",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: "#312E2E",
  },
  pickerBox: {
    width: "100%",
    backgroundColor: "#E8DCC3",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },
  locationButton: {
    backgroundColor: "#E8DCC3",
    padding: 12,
    borderRadius: 10,
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
    marginBottom: 20,
    color: "#312E2E",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#5A3E2B",
    padding: 15,
    borderRadius: 10,
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
