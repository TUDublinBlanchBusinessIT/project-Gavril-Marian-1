import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet 
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import { firebase } from "../firebase/firebase";

export default function LendScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);

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

    Alert.alert("Success", "Location added.");
  };

  const handleSave = async () => {
    if (!title || !desc || !price || !address || !category) {
      Alert.alert("Error", "Please complete all fields.");
      return;
    }

    const user = firebase.auth().currentUser;

    await firebase.firestore().collection("lend_items").add({
      title,
      desc,
      price,
      category,
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
      
      <Text style={styles.header}>Post an Item to Lend</Text>

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

      <TextInput 
        placeholder="Price (€)" 
        placeholderTextColor="#7A7A7A"
        value={price} 
        onChangeText={setPrice} 
        style={styles.input}
        keyboardType="numeric"
      />

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
    paddingTop: 80,           // <<< LOWER EVERYTHING
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#312E2E",
    marginBottom: 30,         // Space before fields start
  },
  input: {
    width: "100%",
    backgroundColor: "#E8DCC3",
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,         // More spacing between fields
    color: "#312E2E",
    fontSize: 16,
  },
  pickerBox: {
    width: "100%",
    backgroundColor: "#E8DCC3",
    borderRadius: 12,
    marginBottom: 18,
    overflow: "hidden",
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
