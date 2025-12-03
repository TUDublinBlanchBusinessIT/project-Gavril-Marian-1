import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet 
} from "react-native";
import { firebase } from "../firebase/firebase";

export default function ItemDetails({ route, navigation }) {
  const { item, itemData } = route.params;
  const realItem = item || itemData;

  const [ownerName, setOwnerName] = useState("");

  useEffect(() => {
    if (!realItem) return;

    firebase
      .firestore()
      .collection("users")
      .doc(realItem.ownerId)
      .get()
      .then((doc) => {
        if (doc.exists) setOwnerName(doc.data().username);
      });
  }, []);

  const startChat = () => {
    const currentUser = firebase.auth().currentUser;

    const chatId =
      currentUser.uid < realItem.ownerId
        ? `${currentUser.uid}_${realItem.ownerId}`
        : `${realItem.ownerId}_${currentUser.uid}`;

    navigation.navigate("ChatScreen", {
      chatId: chatId,
      chatWith: realItem.ownerId,
      chatWithName: ownerName,
    });
  };

  if (!realItem) {
    return (
      <View style={styles.container}>
        <Text>Loading item...</Text>
      </View>
    );
  }

  const imageSource = realItem.imageBase64
    ? { uri: realItem.imageBase64 }
    : require("../assets/defaultProfile.png");

  return (
    <View style={styles.container}>
      
      <Image source={imageSource} style={styles.image} />

      <Text style={styles.title}>{realItem.title}</Text>

      <Text style={styles.category}>
        {realItem.category ? realItem.category.toUpperCase() : ""}
      </Text>

      <Text style={styles.price}>€{realItem.price}</Text>

      <Text style={styles.subPrice}>
        Price {realItem.price}€ per day
      </Text>

      <Text style={styles.address}>📍 {realItem.address}</Text>

      <Text style={styles.owner}>Owner: {ownerName}</Text>

      <TouchableOpacity style={styles.button} onPress={startChat}>
        <Text style={styles.buttonText}>Message Owner</Text>
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
    width: 300,
    height: 300,
    borderRadius: 18,
    marginBottom: 25,
    backgroundColor: "#E8DCC3",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#312E2E",
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5A3E2B",
    marginBottom: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#5A3E2B",
    marginBottom: 4,
  },
  subPrice: {
    fontSize: 16,
    color: "#312E2E",
    marginBottom: 22,
  },
  address: {
    fontSize: 18,
    color: "#312E2E",
    fontWeight: "600",
    marginBottom: 22,
  },
  owner: {
    fontSize: 18,
    fontWeight: "600",
    color: "#312E2E",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#5A3E2B",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
