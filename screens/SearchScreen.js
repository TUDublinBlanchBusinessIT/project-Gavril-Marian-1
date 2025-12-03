import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { firebase } from "../firebase/firebase";

export default function SearchScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    "tools",
    "electronics",
    "household",
    "books",
    "sports",
    "games",
    "clothes",
    "other"
  ];

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("lend_items")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(list);
        setFilteredItems(list);
      });

    return unsubscribe;
  }, []);

  const applyFilter = (cat) => {
    setSelectedCategory(cat);
    setShowFilter(false);

    if (cat === "all") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter((item) => item.category === cat));
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate("ItemDetails", { item })}
    >
      <Image 
        source={{ uri: item.imageBase64 }}
        style={styles.image}
      />

      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>€{item.price}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* FILTER BUTTON */}
      <View style={styles.filterRow}>
        <TouchableOpacity onPress={() => setShowFilter(!showFilter)}>
          <Ionicons name="filter-outline" size={28} color="#312E2E" />
        </TouchableOpacity>

        {showFilter && (
          <View style={styles.filterBox}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat}
                onPress={() => applyFilter(cat)}
                style={styles.filterOption}
              >
                <Text style={[
                  styles.filterText,
                  selectedCategory === cat ? styles.selectedFilter : null
                ]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* LIST */}
      <FlatList 
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6C288",
    padding: 15,
  },

  filterRow: {
    alignItems: "flex-end",
    marginBottom: 10,
  },

  filterBox: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#E8DCC3",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    zIndex: 10,
  },

  filterOption: {
    paddingVertical: 6,
  },

  filterText: {
    fontSize: 16,
    color: "#312E2E",
  },

  selectedFilter: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },

  card: {
    backgroundColor: "#E8DCC3",
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: "row",
    padding: 10,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },

  info: {
    marginLeft: 12,
    justifyContent: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#312E2E",
  },

  price: {
    fontSize: 16,
    marginTop: 2,
    color: "#5A3E2B",
    fontWeight: "bold",
  },

  category: {
    fontSize: 14,
    marginTop: 4,
    color: "#6E6E6E",
  },
});
