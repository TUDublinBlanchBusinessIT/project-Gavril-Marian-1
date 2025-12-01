import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Alert, 
  TextInput,
  StyleSheet 
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";   // ✅ FIXED Base64 error

import { firebase } from "../firebase/firebase";

export default function ProfileScreen({ navigation }) {
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("");
  const [editing, setEditing] = useState(false);

  const user = firebase.auth().currentUser;

  // 🔹 Load username + profile photo from Firestore
  useEffect(() => {
    firebase.firestore()
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
  }, []);

  // 🔹 Convert file to Base64
  const convertImageToBase64 = async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      return "data:image/jpeg;base64," + base64;
    } catch (error) {
      console.error("Base64 error:", error);
      return null;
    }
  };

  // 🔹 Pick image + save Base64 to Firestore
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      // Show image instantly
      setProfileImage(uri);

      // Convert to Base64
      const base64 = await convertImageToBase64(uri);
      if (!base64) {
        Alert.alert("Error", "Could not convert image");
        return;
      }

      // Save Base64 directly to Firestore
      await firebase.firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          profilePhoto: base64,
        });

      Alert.alert("Success!", "Profile photo updated.");
    }
  };

  // 🔹 Save updated username
  const saveUsername = () => {
    firebase.firestore()
      .collection("users")
      .doc(user.uid)
      .update({ username: username })
      .then(() => {
        setEditing(false);
        Alert.alert("Updated!", "Username updated.");
      });
  };

  // 🔹 Log out
  const handleLogout = () => {
    firebase.auth()
      .signOut()
      .then(() => navigation.replace("Login"))
      .catch((err) => Alert.alert("Error", err.message));
  };

  return (
    <View style={styles.container}>

      {/* 🔹 Profile Image */}
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

      {/* Change Photo button */}
      <TouchableOpacity style={styles.changeBtn} onPress={pickImage}>
        <Text style={styles.changeBtnText}>Change Profile Photo</Text>
      </TouchableOpacity>

      {/* 🔹 Username */}
      {editing ? (
        <View style={{ alignItems: "center" }}>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={saveUsername}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.username}>{username}</Text>

          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Text style={styles.editBtnText}>Edit Username</Text>
          </TouchableOpacity>
        </>
      )}

      {/* 🔹 Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6C288",
    alignItems: "center",
    paddingTop: 60,
  },

  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#E8DCC3",
  },

  changeBtn: {
    marginTop: 12,
    backgroundColor: "#E8DCC3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  changeBtnText: {
    color: "#312E2E",
    fontWeight: "bold",
    fontSize: 16,
  },

  username: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 30,
    color: "#312E2E",
  },

  input: {
    backgroundColor: "white",
    width: 200,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 20,
  },

  saveBtn: {
    backgroundColor: "#E8DCC3",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 10,
  },

  saveBtnText: {
    fontWeight: "bold",
    color: "#312E2E",
  },

  editBtn: {
    backgroundColor: "#E8DCC3",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 40,
  },

  editBtnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#312E2E",
  },

  logoutBtn: {
    backgroundColor: "#c97f7f",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 60,
  },

  logoutText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});
