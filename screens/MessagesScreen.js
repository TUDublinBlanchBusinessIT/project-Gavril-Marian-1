import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet 
} from "react-native";
import { firebase } from "../firebase/firebase";

export default function MessagesScreen({ navigation }) {
  const currentUser = firebase.auth().currentUser;
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase.firestore()
      .collection("chats")
      .where("users", "array-contains", currentUser.uid)
      .orderBy("updatedAt", "desc")
      .onSnapshot(async (snapshot) => {
        const chatList = [];
        
        for (const doc of snapshot.docs) {
          const chatData = doc.data();
          const otherUserId = chatData.users.find(id => id !== currentUser.uid);

          const userDoc = await firebase.firestore()
            .collection("users")
            .doc(otherUserId)
            .get();

          const otherUsername = userDoc.exists ? userDoc.data().username : "Unknown";

          chatList.push({
            chatId: doc.id,
            otherUserId,
            otherUsername,
            lastMessage: chatData.lastMessage,
            updatedAt: chatData.updatedAt,
          });
        }

        setChats(chatList);
      });

    return unsubscribe;
  }, []);

  const openChat = (chat) => {
  navigation.navigate("ChatScreen", {
    chatId: chat.chatId,
    chatWith: chat.otherUserId,
    chatWithName: chat.otherUsername,
  });
};

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.chatRow} onPress={() => openChat(item)}>
      <Text style={styles.username}>{item.otherUsername}</Text>
      <Text style={styles.lastMessage}>{item.lastMessage}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>

      <FlatList 
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.chatId}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
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
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#312E2E",
    marginBottom: 20,
  },
  chatRow: {
    backgroundColor: "#E8DCC3",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
    color: "#312E2E",
  },
  lastMessage: {
    fontSize: 14,
    color: "#5A3E2B",
    marginTop: 4,
  },
});
