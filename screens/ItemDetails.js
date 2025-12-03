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
  const { item } = route.params;
  const [ownerName, setOwnerName] = useState("");

  useEffect(() => {
    firebase
      .firestore()
      .collection("users")
      .doc(item.ownerId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          setOwnerName(doc.data().username);
        }
      });
  }, []);

 const startChat = () => {
  const currentUser = firebase.auth().currentUser;

  const chatId =
    currentUser.uid < item.ownerId
      ? `${currentUser.uid}_${item.ownerId}`
      : `${item.ownerId}_${currentUser.uid}`;

  navigation.navigate("ChatScreen", {
    chatId: chatId,
    chatWith: item.ownerId,
    chatWithName: ownerName,
  });
};


  return (
    <View style={styles.container}>

      
      <Image source={{ uri: item.imageBase64 }} style={styles.image} />

      <Text style={styles.title}>{item.title}</Text>

      <Text style={styles.category}>{item.category.toUpperCase()}</Text>

      <Text style={styles.price}>€{item.price}</Text>

      <Text style={styles.desc}>{item.desc}</Text>

      <Text style={styles.address}>📍 {item.address}</Text>

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
    width: 260,
    height: 260,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#E8DCC3",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#312E2E",
  },
  category: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5A3E2B",
    marginTop: 5,
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5A3E2B",
    marginBottom: 15,
  },
  desc: {
    fontSize: 16,
    color: "#312E2E",
    textAlign: "center",
    marginBottom: 20,
  },
  address: {
    fontSize: 16,
    fontWeight: "600",
    color: "#312E2E",
    marginBottom: 20,
  },
  owner: {
    fontSize: 16,
    fontWeight: "600",
    color: "#312E2E",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#5A3E2B",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
