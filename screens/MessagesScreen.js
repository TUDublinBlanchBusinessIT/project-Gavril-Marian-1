import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { firebase } from "../firebase/firebase";

export default function MessagesScreen({ navigation }) {
  const currentUser = firebase.auth().currentUser;
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("chats")
      .where("users", "array-contains", currentUser.uid)
      .orderBy("updatedAt", "desc")
      .onSnapshot(async (snapshot) => {
        const chatList = [];

        for (const doc of snapshot.docs) {
          const chatData = doc.data();
          const otherUserId = chatData.users.find(
            (id) => id !== currentUser.uid
          );

          const userDoc = await firebase
            .firestore()
            .collection("users")
            .doc(otherUserId)
            .get();

          const otherUsername = userDoc.exists
            ? userDoc.data().username
            : "Unknown";

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
    <TouchableOpacity
      style={styles.chatRow}
      activeOpacity={0.7}
      onPress={() => openChat(item)}
    >
      <View style={styles.chatInfo}>
        <Text style={styles.username}>{item.otherUsername}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage || "No messages yet"}
        </Text>
      </View>

      <Text style={styles.time}>
        {item.updatedAt
          ? new Date(item.updatedAt.toDate()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>

      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a chat by lending or borrowing an item.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={(item) => item.chatId}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0D29B",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: "700",
    color: "#5A3E2B",
    marginBottom: 25,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8DCC3",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  chatInfo: {
    flex: 1,
  },
  username: {
    fontSize: 19,
    fontWeight: "700",
    color: "#5A3E2B",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#5A3E2B",
    opacity: 0.8,
  },
  time: {
    fontSize: 12,
    color: "#5A3E2B",
    opacity: 0.6,
    marginLeft: 10,
  },
  emptyContainer: {
    marginTop: 120,
    alignItems: "center",
    opacity: 0.85,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#5A3E2B",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#5A3E2B",
  },
});
