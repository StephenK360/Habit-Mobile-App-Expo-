import React, { useState, useContext } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons"; // or any other icon library
import { ThemeContext } from "../../context/ThemeContext";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { borderColor: theme.borderColor }]}>
      <TouchableOpacity style={styles.searchIconContainer}>
        <AntDesign name="search1" size={24} color={theme.primaryColor} />
      </TouchableOpacity>
      <TextInput
        style={[styles.textInput, { color: theme.textColor }]}
        placeholder="Search Habits ..."
        placeholderTextColor={theme.secondaryTextColor}
        value={searchTerm}
        onChangeText={(text) => setSearchTerm(text)}
      />
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 15,
    paddingHorizontal: 10,
    marginTop: 20,
    borderWidth: 1,
  },
  searchIconContainer: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    height: 42,
  },
});
