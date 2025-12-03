import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  StyleSheet,
  ScrollView
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { SafeAreaView } from "react-native-safe-area-context";

import { firebase } from "../firebase/firebase";

export default function ProfileScreen({ navigation }) {
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("");
  const [editing, setEditing] = useState(false);
  const [myItems, setMyItems] = useState([]);

  const user = firebase.auth().currentUser;

  useEffect(() => {
    firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setUsername(data.username);
          if (data.profilePhoto) setProfileImage(data.profilePhoto);
        }
      });

    const unsubscribe = firebase
      .firestore()
      .collection("lend_items")
      .where("ownerId", "==", user.uid)
      .onSnapshot((snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setMyItems(items);
      });

    return () => unsubscribe();
  }, []);

  const convertImageToBase64 = async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
      return "data:image/jpeg;base64," + base64;
    } catch {
      return null;
    }
  };

  const pickImage = async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync();

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: false,
      quality: 0.6,
      aspect: [1, 1]
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);

      const base64 = await convertImageToBase64(uri);
      if (!base64) return;

      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .update({ profilePhoto: base64 });

      Alert.alert("Success", "Picture uploaded successfully.");
    }
  };

  const saveUsername = async () => {
    await firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .update({ username });

    setEditing(false);
  };

  const toggleStatus = async (item) => {
    const newStatus = !item.available;

    await firebase
      .firestore()
      .collection("lend_items")
      .doc(item.id)
      .update({ available: newStatus });

    await firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .set(
        {
          items: {
            [item.id]: {
              title: item.title,
              available: newStatus,
              imageBase64: item.imageBase64
            }
          }
        },
        { merge: true }
      );
  };

  const deleteItem = async (itemId) => {
    await firebase.firestore().collection("lend_items").doc(itemId).delete();

    await firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .set(
        {
          items: {
            [itemId]: firebase.firestore.FieldValue.delete()
          }
        },
        { merge: true }
      );
  };

  const handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => navigation.replace("Login"));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#E6C288" }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require("../assets/defaultProfile.png")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.changeBtn} onPress={pickImage}>
          <Text style={styles.changeBtnText}>Change Profile Photo</Text>
        </TouchableOpacity>

        {editing ? (
          <>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveUsername}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.username}>{username}</Text>

            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editBtnText}>Edit Username</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.itemsTitle}>My Items: {myItems.length}</Text>

        {myItems.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Image
              source={require("../assets/emptyBox.png")}
              style={{ width: 120, height: 120, marginBottom: 10, opacity: 0.8 }}
            />
            <Text style={styles.emptyText}>You haven’t posted any items yet.</Text>
          </View>
        ) : (
          myItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.imageBase64 }} style={styles.itemImg} />

              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemStatus}>
                  {item.available ? "Available" : "Borrowed"}
                </Text>

                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.toggleBtn}
                    onPress={() => toggleStatus(item)}
                  >
                    <Text style={styles.toggleText}>
                      {item.available ? "Set Borrowed" : "Set Available"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteItem(item.id)}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 70
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginTop: 30,
    marginBottom: 10
  },
  changeBtn: {
    backgroundColor: "#E8DCC3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  changeBtnText: {
    fontWeight: "700",
    color: "#312E2E"
  },
  username: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
    color: "#312E2E"
  },
  input: {
    width: 200,
    height: 40,
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 20
  },
  saveBtn: {
    backgroundColor: "#E8DCC3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10
  },
  saveBtnText: {
    fontWeight: "700",
    color: "#312E2E"
  },
  editBtn: {
    backgroundColor: "#E8DCC3",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20
  },
  editBtnText: {
    fontWeight: "700",
    fontSize: 18,
    color: "#312E2E"
  },
  itemsTitle: {
    marginTop: 35,
    fontSize: 22,
    fontWeight: "bold",
    color: "#312E2E"
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#444"
  },
  itemCard: {
    width: "90%",
    backgroundColor: "#E8DCC3",
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
    flexDirection: "row"
  },
  itemImg: {
    width: 80,
    height: 80,
    borderRadius: 10
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#312E2E"
  },
  itemStatus: {
    marginTop: 4,
    fontSize: 14,
    color: "#5A3E2B",
    fontWeight: "600"
  },
  row: {
    flexDirection: "row",
    marginTop: 10
  },
  toggleBtn: {
    backgroundColor: "#5A3E2B",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10
  },
  toggleText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13
  },
  deleteBtn: {
    backgroundColor: "#c97f7f",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  deleteText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13
  },
  logoutBtn: {
    backgroundColor: "#c97f7f",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 40
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18
  }
});
