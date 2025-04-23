import React, { useContext, useState } from "react";
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/common/Header"; 
import { ThemeContext } from "../../context/ThemeContext";
import { Feather, MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Settings = () => {
  const navigation = useNavigation();
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  // State for settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [dataCollectionEnabled, setDataCollectionEnabled] = useState(true);
  
  // State for privacy policy modal
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  
  // Function to show "under development" message
  const showDevelopmentMessage = (feature) => {
    Alert.alert(
      "Under Development",
      `The ${feature} feature is currently under development and will be available in a future update.`,
      [{ text: "OK", onPress: () => console.log(`${feature} alert closed`) }]
    );
  };
  
  // Function to clear all app data
  const confirmClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all app data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear Data", 
          style: "destructive",
          onPress: clearAllData
        }
      ]
    );
  };
  
  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert(
        "Data Cleared",
        "All app data has been successfully cleared.",
        [{ text: "OK", onPress: () => navigation.navigate("LoginPage") }]
      );
    } catch (error) {
      console.error("Error clearing data:", error);
      Alert.alert("Error", "Failed to clear data. Please try again.");
    }
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.backgroundColor }]} 
      showsVerticalScrollIndicator={false}
    >
      <Header />

      <Text style={[styles.title, { color: theme.textColor }]}>Settings</Text>

      {/* Account Settings */}
      <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Account</Text>
      <View style={styles.settingsContainer}>
        <TouchableOpacity 
          style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}
          onPress={() => showDevelopmentMessage("Change Password")}
        >
          <Ionicons name="lock-closed-outline" size={24} color={theme.primaryColor} />
          <Text style={[styles.settingText, { color: theme.textColor }]}>Change Password</Text>
          <Feather name="chevron-right" size={20} color={theme.secondaryTextColor} style={styles.arrowIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}
          onPress={() => showDevelopmentMessage("Email Preferences")}
        >
          <MaterialIcons name="email" size={24} color={theme.primaryColor} />
          <Text style={[styles.settingText, { color: theme.textColor }]}>Email Preferences</Text>
          <Feather name="chevron-right" size={20} color={theme.secondaryTextColor} style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>

      {/* Privacy Settings */}
      <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Privacy</Text>
      <View style={styles.settingsContainer}>
        <View style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}>
          <Ionicons name="notifications-outline" size={24} color={theme.primaryColor} />
          <Text style={[styles.settingText, { color: theme.textColor }]}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#767577", true: theme.primaryColor }}
            thumbColor="#f4f3f4"
            style={styles.switchControl}
          />
        </View>
        
        <View style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}>
          <MaterialIcons name="location-on" size={24} color={theme.primaryColor} />
          <Text style={[styles.settingText, { color: theme.textColor }]}>Location Services</Text>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: "#767577", true: theme.primaryColor }}
            thumbColor="#f4f3f4"
            style={styles.switchControl}
          />
        </View>
        
        <View style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}>
          <Feather name="database" size={24} color={theme.primaryColor} />
          <Text style={[styles.settingText, { color: theme.textColor }]}>Data Collection</Text>
          <Switch
            value={dataCollectionEnabled}
            onValueChange={setDataCollectionEnabled}
            trackColor={{ false: "#767577", true: theme.primaryColor }}
            thumbColor="#f4f3f4"
            style={styles.switchControl}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}
          onPress={() => setPrivacyModalVisible(true)}
        >
          <Feather name="shield" size={24} color={theme.primaryColor} />
          <Text style={[styles.settingText, { color: theme.textColor }]}>Privacy Policy</Text>
          <Feather name="chevron-right" size={20} color={theme.secondaryTextColor} style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>

      {/* Appearance */}
      <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Appearance</Text>
      <View style={styles.settingsContainer}>
        <View style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}>
          <Ionicons 
            name={isDarkMode ? "sunny" : "moon"} 
            size={24} 
            color={theme.primaryColor} 
          />
          <Text style={[styles.settingText, { color: theme.textColor }]}>
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: theme.primaryColor }}
            thumbColor="#f4f3f4"
            style={styles.switchControl}
          />
        </View>
      </View>

      {/* Support */}
      <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Support</Text>
      <View style={styles.settingsContainer}>
        <TouchableOpacity 
          style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}
          onPress={() => showDevelopmentMessage("Contact Us")}
        >
          <Feather name="mail" size={24} color={theme.primaryColor} />
          <Text style={[styles.settingText, { color: theme.textColor }]}>Contact Us</Text>
          <Feather name="chevron-right" size={20} color={theme.secondaryTextColor} style={styles.arrowIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}
          onPress={() => showDevelopmentMessage("Help Center")}
        >
          <Feather name="help-circle" size={24} color={theme.primaryColor} />
          <Text style={[styles.settingText, { color: theme.textColor }]}>Help Center</Text>
          <Feather name="chevron-right" size={20} color={theme.secondaryTextColor} style={styles.arrowIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}
          onPress={() => Alert.alert("App Version", "Habit Tracker v1.0.0")}
        >
          <Ionicons name="information-circle-outline" size={24} color={theme.primaryColor} />
          <Text style={[styles.settingText, { color: theme.textColor }]}>About App</Text>
          <Feather name="chevron-right" size={20} color={theme.secondaryTextColor} style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <Text style={[styles.sectionTitle, { color: "#FF6B6B" }]}>Erase All Data</Text>
      <View style={styles.settingsContainer}>
        <TouchableOpacity 
          style={[styles.settingOption, { borderBottomColor: theme.borderColor }]}
          onPress={confirmClearData}
        >
          <Feather name="trash-2" size={24} color="#FF6B6B" />
          <Text style={[styles.settingText, { color: "#FF6B6B" }]}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      {/* Back to Profile */}
      <TouchableOpacity 
        style={[styles.backButton, { backgroundColor: theme.headlineColor }]} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text style={styles.backButtonText}>Back to Profile</Text>
      </TouchableOpacity>
      
      {/* Privacy Policy Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={privacyModalVisible}
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>Privacy Policy</Text>
            
            <ScrollView style={styles.modalScrollView}>
              <Text style={[styles.privacyText, { color: theme.textColor }]}>
                This Privacy Policy describes how your personal information is collected, used, and shared when you use our Habit Tracker application.
              </Text>
              
              <Text style={[styles.privacySubtitle, { color: theme.textColor }]}>Information We Collect</Text>
              <Text style={[styles.privacyText, { color: theme.textColor }]}>
                We collect information you provide directly to us, such as your name, profile picture, location, and habit data. We also collect usage data to improve the app experience.
              </Text>
              
              <Text style={[styles.privacySubtitle, { color: theme.textColor }]}>How We Use Your Information</Text>
              <Text style={[styles.privacyText, { color: theme.textColor }]}>
                We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect our users.
              </Text>
              
              <Text style={[styles.privacySubtitle, { color: theme.textColor }]}>Data Storage</Text>
              <Text style={[styles.privacyText, { color: theme.textColor }]}>
                All your data is stored locally on your device using AsyncStorage. We do not upload your personal information to any servers.
              </Text>
              
              <Text style={[styles.privacySubtitle, { color: theme.textColor }]}>Changes to This Policy</Text>
              <Text style={[styles.privacyText, { color: theme.textColor }]}>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy in the app.
              </Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: theme.headlineColor }]}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 25,
    marginBottom: 10,
  },
  settingsContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 5,
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
    flex: 1,
  },
  arrowIcon: {
    marginLeft: 'auto',
  },
  switchControl: {
    marginLeft: 'auto',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 50,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
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
    maxHeight: '80%',
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
  modalScrollView: {
    maxHeight: 400,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 15,
  },
  privacySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});
