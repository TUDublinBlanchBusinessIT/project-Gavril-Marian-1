import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import { firebase } from "../firebase/firebase";

export default function ChatScreen({ route }) {
  const { chatId, chatWith } = route.params || {};

  const currentUser = firebase.auth().currentUser;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!chatId || !chatWith || !currentUser?.uid) return;

    const chatRef = firebase.firestore().collection("chats").doc(chatId);

    chatRef.set(
      {
        users: [currentUser.uid, chatWith],
        lastMessage: "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const unsubscribe = chatRef
      .collection("messages")
      .orderBy("createdAt", "asc")
      .onSnapshot((snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);
      });

    return unsubscribe;
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) return;
    if (!chatId || !currentUser?.uid) return;

    const chatRef = firebase.firestore().collection("chats").doc(chatId);

    await chatRef.collection("messages").add({
      text,
      senderId: currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await chatRef.set(
      {
        lastMessage: text,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    setText("");
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.senderId === currentUser?.uid
          ? styles.myMessage
          : styles.theirMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#8A7C6E"
          value={text}
          onChangeText={setText}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0D29B",
  },
  messageBubble: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 18,
    maxWidth: "75%",
  },
  myMessage: {
    backgroundColor: "#D9A95B",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#FFF1D1",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#000",
    fontSize: 16,
  },

  inputRow: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#F0D29B",
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: "#3A2F2F",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  sendBtn: {
    backgroundColor: "#4A342A",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginLeft: 10,
  },

  sendBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
