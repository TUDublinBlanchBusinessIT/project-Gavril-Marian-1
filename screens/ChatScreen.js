import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet } from "react-native";
import { firebase } from "../firebase/firebase";

export default function ChatScreen({ route }) {
  const { chatId, chatWith } = route.params;

  const currentUser = firebase.auth().currentUser;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
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
        item.senderId === currentUser.uid ? styles.myMessage : styles.theirMessage,
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
    backgroundColor: "#E6C288",
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "75%",
  },
  myMessage: {
    backgroundColor: "#5A3E2B",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#E8DCC3",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#000",
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#E8DCC3",
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  sendBtn: {
    backgroundColor: "#5A3E2B",
    paddingHorizontal: 15,
    justifyContent: "center",
    marginLeft: 8,
    borderRadius: 8,
  },
  sendBtnText: {
    color: "white",
    fontWeight: "bold",
  },
});
