import React, { useContext, useState, useEffect } from "react";
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Header from "../../components/common/Header"; 
import { Feather, MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTabContext } from '../../navigation/TabContext';

const Profile = ({ route }) => {
  const navigation = useNavigation();
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { setActiveTab } = useTabContext();
  
  // State for user data
  const [username, setUsername] = useState("Username");
  const [location, setLocation] = useState("Location");
  const [profileImage, setProfileImage] = useState(null);
  
  // State for modals
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  
  // Form state
  const [newUsername, setNewUsername] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // State for habit statistics
  const [habitStats, setHabitStats] = useState({
    totalHabits: 0,
    completionRate: 0
  });

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
    loadHabitStatistics();
    checkLocationModalFlag();
    
    // Check for route params to open modals
    if (route?.params?.openEditProfile) {
      setEditProfileModalVisible(true);
    }
    
    if (route?.params?.openLocationModal) {
      setLocationModalVisible(true);
    }
  }, [route?.params]);

  // Refresh habit statistics when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadHabitStatistics();
      checkModalFlags();
      return () => {};
    }, [])
  );

  // Save user data to AsyncStorage
  const saveUserData = async (data) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(data));
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  // Load user data from AsyncStorage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUsername(parsedData.username || "Username");
        setLocation(parsedData.location || "Location");
        setProfileImage(parsedData.profileImage);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Load habit statistics from AsyncStorage
  const loadHabitStatistics = async () => {
    try {
      const habitsJSON = await AsyncStorage.getItem('habits');
      
      if (habitsJSON) {
        const habits = JSON.parse(habitsJSON);
        
        // Calculate total habits
        const totalHabits = habits.length;
        
        // Calculate completion rate
        let completedCount = 0;
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        
        habits.forEach(habit => {
          // Check if habit has a completionLog and if today is marked as completed
          if (habit.completionLog && habit.completionLog[today]) {
            completedCount++;
          }
        });
        
        const completionRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
        
        // Update state with calculated statistics
        setHabitStats({
          totalHabits,
          completionRate
        });
      }
    } catch (error) {
      console.error('Error loading habit statistics:', error);
    }
  };

  // Check if location modal should be opened
  const checkLocationModalFlag = async () => {
    try {
      const shouldOpenLocationModal = await AsyncStorage.getItem("openLocationModal");
      if (shouldOpenLocationModal === "true") {
        // Open location modal
        setLocationModalVisible(true);
        // Clear the flag
        await AsyncStorage.removeItem("openLocationModal");
      }
    } catch (error) {
      console.error("Error checking location modal flag:", error);
    }
  };

  // Check for modal flags in AsyncStorage
  const checkModalFlags = async () => {
    try {
      // Check for edit profile modal flag
      const openEditProfile = await AsyncStorage.getItem("openEditProfileModal");
      if (openEditProfile === "true") {
        setEditProfileModalVisible(true);
        await AsyncStorage.removeItem("openEditProfileModal");
      }
      
      // Check for location modal flag
      const openLocation = await AsyncStorage.getItem("openLocationModal");
      if (openLocation === "true") {
        setLocationModalVisible(true);
        await AsyncStorage.removeItem("openLocationModal");
      }
    } catch (error) {
      console.error("Error checking modal flags:", error);
    }
  };

  // Handle profile image selection
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      
      // Save the updated profile image
      const userData = {
        username,
        location,
        profileImage: result.assets[0].uri
      };
      saveUserData(userData);
    }
  };

  // Handle profile update
  const handleProfileUpdate = () => {
    const updatedUsername = newUsername.trim() !== "" ? newUsername : username;
    
    // Update state
    setUsername(updatedUsername);
    
    // Save to AsyncStorage
    const userData = {
      username: updatedUsername,
      location,
      profileImage
    };
    saveUserData(userData);
    
    // Reset form and close modal
    setNewUsername("");
    setEditProfileModalVisible(false);
  };

  // Handle location update
  const handleLocationUpdate = () => {
    const updatedLocation = newLocation.trim() !== "" ? newLocation : location;
    
    // Update state
    setLocation(updatedLocation);
    
    // Save to AsyncStorage
    const userData = {
      username,
      location: updatedLocation,
      profileImage
    };
    saveUserData(userData);
    
    // Reset form and close modal
    setNewLocation("");
    setLocationModalVisible(false);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.backgroundColor }]} 
      showsVerticalScrollIndicator={false}
    >
      <Header />

      {/* Profile Section */}
      <View style={[styles.profileCard, { backgroundColor: theme.headlineColor }]}>
        <View style={styles.profileInfo}>
          <TouchableOpacity onPress={pickImage}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <Image
                source={require("../../asset/icon/cutie.png")}
                style={styles.profileImage}
              />
            )}
            <View style={styles.editImageBadge}>
              <Feather name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <View>
            <Text style={[styles.username, { color: theme.white }]}>{username}</Text>
            <View style={styles.locationWrapper}>
              <FontAwesome5 name="map-marker-alt" size={14} color={theme.white} />
              <Text style={[styles.userLocation, { color: theme.white }]}>{location}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Habit Statistics */}
      <View style={[styles.statsContainer, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity 
          style={styles.statBox}
          onPress={() => setActiveTab("Home")}
        >
          <FontAwesome5 name="tasks" size={24} color={theme.primaryColor} />
          <Text style={[styles.statNumber, { color: theme.textColor }]}>
            {habitStats.totalHabits}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondaryTextColor }]}>Total Habits</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statBox}
          onPress={() => setActiveTab("AddHabit")}
        >
          <FontAwesome5 name="chart-line" size={24} color={theme.primaryColor} />
          <Text style={[styles.statNumber, { color: theme.textColor }]}>
            {habitStats.completionRate}%
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondaryTextColor }]}>Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Settings */}
      <View style={styles.settingsContainer}>
        <TouchableOpacity 
          style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}
          onPress={() => {
            setNewUsername(username);
            setEditProfileModalVisible(true);
          }}
        >
          <Feather name="edit" size={24} color={theme.primaryColor} />
          <Text style={[styles.settingText, { color: theme.textColor }]}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingOption, { borderBottomColor: theme.borderColor }]} 
          onPress={() => navigation.navigate("Settings")}
        >
          <Feather name="settings" size={24} color={theme.primaryColor} />
          <Text style={[styles.settingText, { color: theme.textColor }]}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}
          onPress={() => {
            setNewLocation(location);
            setLocationModalVisible(true);
          }}
        >
          <MaterialIcons name="location-on" size={24} color={theme.primaryColor} />
          <Text style={[styles.settingText, { color: theme.textColor }]}>Location</Text>
        </TouchableOpacity>

        {/* Dark mode toggle button */}
        <TouchableOpacity 
          style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}
          onPress={toggleTheme}
        >
          <Ionicons 
            name={isDarkMode ? "sunny" : "moon"} 
            size={24} 
            color={theme.primaryColor} 
          />
          <Text style={[styles.settingText, { color: theme.textColor }]}>
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingOption, styles.logout, { borderBottomColor: theme.borderColor }]}
          onPress={() => navigation.navigate("LoginPage")}
        >
         <MaterialIcons name="logout" size={24} color="#FF6B6B" />
         <Text style={[styles.settingText, { color: "#FF6B6B" }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editProfileModalVisible}
        onRequestClose={() => setEditProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>Edit Profile</Text>
            
            <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.modalProfileImage} />
              ) : (
                <Image source={require("../../asset/icon/cutie.png")} style={styles.modalProfileImage} />
              )}
              <View style={styles.cameraIconContainer}>
                <Feather name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            
            <Text style={[styles.inputLabel, { color: theme.secondaryTextColor }]}>Username</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.inputBackground, 
                color: theme.textColor,
                borderColor: theme.borderColor
              }]}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter username"
              placeholderTextColor={theme.secondaryTextColor}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.borderColor }]}
                onPress={() => setEditProfileModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: theme.textColor }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.headlineColor }]}
                onPress={handleProfileUpdate}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={locationModalVisible}
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>Set Location</Text>
            
            <Text style={[styles.inputLabel, { color: theme.secondaryTextColor }]}>Your Location</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.inputBackground, 
                color: theme.textColor,
                borderColor: theme.borderColor
              }]}
              value={newLocation}
              onChangeText={setNewLocation}
              placeholder="Enter your location"
              placeholderTextColor={theme.secondaryTextColor}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.borderColor }]}
                onPress={() => setLocationModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: theme.textColor }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.headlineColor }]}
                onPress={handleLocationUpdate}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 15,
  },
  editImageBadge: {
    position: 'absolute',
    bottom: 0,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
  },
  locationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  userLocation: {
    fontSize: 14,
    marginLeft: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 3,
  },
  settingsContainer: {
    marginTop: 30,
  },
  settingOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 10,
  },
  logout: {
    marginTop: 10,
    borderBottomWidth: 0,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  modalProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    marginRight: 10,
  },
  saveButton: {
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});