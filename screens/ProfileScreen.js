import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Alert, 
  StyleSheet 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { firebase } from "../firebase/firebase";

export default function ProfileScreen({ navigation }) {
  const [profileImage, setProfileImage] = useState(null);

  
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Needed", "We need access to your photo gallery.");
      }
    })();
  }, []);

  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  
  const handleLogout = () => {
    firebase.auth().signOut()
      .then(() => navigation.replace("Login"))
      .catch((err) => Alert.alert("Error", err.message));
  };

  return (
    <View style={styles.container}>

      {/* Profile Image */}
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

      
      <Text style={styles.username}>Your Username</Text>

      
      

      
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
