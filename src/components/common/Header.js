import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTabContext } from "../../navigation/TabContext";
import color from "../../constant/color";

const Header = () => {
  const [username, setUsername] = useState("Username");
  const [profileImage, setProfileImage] = useState(null);
  const navigation = useNavigation();
  const tabContext = useTabContext();
  
  // Load user data when component mounts
  useEffect(() => {
    loadUserData();
  }, []);
  
  // Refresh user data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
      return () => {};
    }, [])
  );
  
  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUsername(parsedData.username || "Username");
        setProfileImage(parsedData.profileImage);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Navigate to Profile screen and open edit profile modal
  const navigateToEditProfile = () => {
    if (tabContext && tabContext.setActiveTab) {
      // First navigate to Profile tab
      tabContext.setActiveTab("Profile");
      
      // Then set a flag in AsyncStorage to open the edit profile modal
      AsyncStorage.setItem("openEditProfileModal", "true").catch(error => 
        console.error("Error setting edit profile flag:", error)
      );
    } else {
      // If not in tab context, navigate back to TabView and then to Profile
      navigation.navigate("TabView", { screen: "Profile", params: { openEditProfile: true } });
    }
  };

  // Open location edit modal
  const openLocationModal = () => {
    if (tabContext && tabContext.setActiveTab) {
      // First navigate to Profile tab
      tabContext.setActiveTab("Profile");
      
      // Then set a flag in AsyncStorage to open the location modal
      AsyncStorage.setItem("openLocationModal", "true").catch(error => 
        console.error("Error setting location modal flag:", error)
      );
    } else {
      // If not in tab context, navigate back to TabView and then to Profile
      navigation.navigate("TabView", { screen: "Profile", params: { openLocationModal: true } });
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <TouchableOpacity onPress={navigateToEditProfile}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={{ width: 30, height: 30, borderRadius: 15 }}
          />
        ) : (
          <Image
            source={require("../../asset/icon/cutie.png")}
            style={{ width: 30, height: 30 }}
          />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={openLocationModal}
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 4,
          alignItems: "center",
        }}
      >
        <MaterialIcons
          name="location-on"
          size={24}
          color={color.primaryColor}
        />
        <Text
          style={{
            color: color.black,
            fontSize: 14,
          }}
        >
          {username}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({});
