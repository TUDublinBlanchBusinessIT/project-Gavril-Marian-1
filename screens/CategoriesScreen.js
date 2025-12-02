import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";

export default function SearchScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [km, setKm] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const allItems = [
    { id: "1", title: "Football Ball", category: "Sports", distance: 5, availableFrom: "2025-06-01", availableTo: "2025-06-15" },
    { id: "2", title: "Guitar", category: "Music", distance: 12, availableFrom: "2025-05-20", availableTo: "2025-06-30" },
    { id: "3", title: "Drill Machine", category: "Tools", distance: 3, availableFrom: "2025-06-02", availableTo: "2025-06-05" },
    { id: "4", title: "Party Lights", category: "Party", distance: 15, availableFrom: "2025-07-01", availableTo: "2025-07-30" }
  ];

  const [results, setResults] = useState(allItems);

  function applyFilters() {
    let filtered = allItems;

    if (search.trim() !== "") {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategory !== null) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    filtered = filtered.filter(item => item.distance <= km);

    if (startDate) {
      filtered = filtered.filter(item => item.availableFrom >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(item => item.availableTo <= endDate);
    }

    setResults(filtered);
  }

  function handleCategoryPress(category) {
    setSelectedCategory(category);
    applyFilters();
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#E8DCC3" }}>

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 15, width: 40 }}>
        <Ionicons name="arrow-back" size={28} color="#5A3E2B" />
      </TouchableOpacity>

      <Text style={{ fontSize: 26, fontWeight: "bold", color: "#5A3E2B", marginBottom: 15 }}>
        Search
      </Text>

      <TextInput
        placeholder="Search anything..."
        value={search}
        onChangeText={text => {
          setSearch(text);
          applyFilters();
        }}
        style={{
          backgroundColor: "#fff",
          padding: 15,
          borderRadius: 12,
          fontSize: 16,
          borderWidth: 1,
          borderColor: "#F0D29B",
          marginBottom: 20
        }}
      />

      <Text style={{ fontSize: 18, fontWeight: "600", color: "#5A3E2B", marginBottom: 10 }}>
        What are you looking for?
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 25 }}>
        {["Sports", "Music", "Household", "Party", "Tools", "Electronics"].map(category => (
          <TouchableOpacity
            key={category}
            onPress={() => handleCategoryPress(category)}
            style={{
              backgroundColor: "#F0D29B",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 12,
              marginRight: 10,
              marginBottom: 10
            }}
          >
            <Text style={{ fontSize: 16, color: "#5A3E2B", fontWeight: "600" }}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ fontSize: 18, fontWeight: "600", color: "#5A3E2B", marginBottom: 5 }}>
        Distance (km): {km}
      </Text>

      <Slider
        minimumValue={1}
        maximumValue={100}
        step={1}
        value={km}
        onValueChange={value => {
          setKm(value);
          applyFilters();
        }}
        minimumTrackTintColor="#5A3E2B"
        thumbTintColor="#5A3E2B"
        style={{ marginBottom: 20 }}
      />

      <Text style={{ fontSize: 18, fontWeight: "600", color: "#5A3E2B", marginBottom: 5 }}>
        Availability
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        <TextInput
          placeholder="Start From (YYYY-MM-DD)"
          value={startDate}
          onChangeText={text => {
            setStartDate(text);
            applyFilters();
          }}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#F0D29B"
          }}
        />

        <TextInput
          placeholder="To (YYYY-MM-DD)"
          value={endDate}
          onChangeText={text => {
            setEndDate(text);
            applyFilters();
          }}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#F0D29B"
          }}
        />
      </View>

      {results.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Text style={{ color: "#5A3E2B", fontSize: 18 }}>
            No listings available now
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={{
              padding: 15,
              marginBottom: 10,
              backgroundColor: "#F0D29B",
              borderRadius: 12
            }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#5A3E2B" }}>
                {item.title}
              </Text>
              <Text style={{ color: "#5A3E2B" }}>{item.category}</Text>
              <Text style={{ color: "#5A3E2B" }}>Distance: {item.distance} km</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

