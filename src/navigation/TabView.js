import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import React, { useState, useRef, useEffect, useContext } from "react";
import { SafeAreaView, TouchableOpacity } from "react-native";
import Home from "../screens/Home/Home";
import Profile from "../screens/profile/Profile";
import Community from "../screens/community/Community";
import AddHabit from "../screens/habits/AddHabit";
import Notification from "../screens/notifications/Notification";
import { Foundation } from "@expo/vector-icons";
import color from "../constant/color";
import { TabProvider } from './TabContext';
import { ThemeContext } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TabView = () => {
  const [activeTab, setActiveTab] = useState("Home");
  const { theme, isDarkMode } = useContext(ThemeContext);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Animation values for each tab
  const homeScale = useRef(new Animated.Value(1)).current;
  const addHabitScale = useRef(new Animated.Value(1)).current;
  const communityScale = useRef(new Animated.Value(1)).current;
  const notificationScale = useRef(new Animated.Value(1)).current;
  const profileScale = useRef(new Animated.Value(1)).current;
  
  // Animation value for highlight
  const highlightOpacity = useRef(new Animated.Value(0)).current;
  const highlightWidth = useRef(new Animated.Value(0)).current;
  
  // Tap highlight animation values
  const tapHighlightScale = useRef(new Animated.Value(0)).current;
  const tapHighlightOpacity = useRef(new Animated.Value(0)).current;
  const [tapPosition, setTapPosition] = useState({ x: 0, y: 0 });
  
  // Function to animate tab selection
  const animateTab = (tabName, tabX) => {
    // Set tap position for highlight effect
    setTapPosition({ x: tabX, y: 0 });
    
    // Tap highlight animation
    tapHighlightScale.setValue(0);
    tapHighlightOpacity.setValue(0.7);
    
    Animated.parallel([
      Animated.timing(tapHighlightScale, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(tapHighlightOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
    
    // Reset all animations
    Animated.parallel([
      Animated.timing(homeScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(addHabitScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(communityScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(notificationScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(profileScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate selected tab
    let selectedScale;
    switch (tabName) {
      case "Home":
        selectedScale = homeScale;
        break;
      case "AddHabit":
        selectedScale = addHabitScale;
        break;
      case "Community":
        selectedScale = communityScale;
        break;
      case "Notification":
        selectedScale = notificationScale;
        break;
      case "Profile":
        selectedScale = profileScale;
        break;
      default:
        selectedScale = homeScale;
    }

    // Pulse animation for selected tab
    Animated.sequence([
      Animated.timing(selectedScale, {
        toValue: 1.2,
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(selectedScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start();

    // Highlight animation
    Animated.parallel([
      Animated.timing(highlightOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(highlightWidth, {
        toValue: 1,
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Reset highlight animation for next use
      highlightOpacity.setValue(0);
      highlightWidth.setValue(0);
    });
  };

  const handleTabChange = (tabName, tabX) => {
    if (activeTab === tabName) return;
    
    setActiveTab(tabName);
    animateTab(tabName, tabX);
    
    // Reset notification count when navigating to Notification screen
    if (tabName === "Notification") {
      setNotificationCount(0);
    }
  };

  // Initialize animation for default tab
  useEffect(() => {
    animateTab("Home", 0);
  }, []);
  
  // Load notification count
  useEffect(() => {
    const loadNotificationCount = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem("notifications");
        if (storedNotifications) {
          const notifications = JSON.parse(storedNotifications);
          const unreadCount = notifications.filter(notification => !notification.read).length;
          setNotificationCount(unreadCount);
        }
      } catch (error) {
        console.error("Error loading notification count:", error);
      }
    };
    
    loadNotificationCount();
    
    // Set up interval to check for new notifications
    const interval = setInterval(loadNotificationCount, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Update notification count when activeTab changes
  useEffect(() => {
    if (activeTab !== "Notification") {
      const loadNotificationCount = async () => {
        try {
          const storedNotifications = await AsyncStorage.getItem("notifications");
          if (storedNotifications) {
            const notifications = JSON.parse(storedNotifications);
            const unreadCount = notifications.filter(notification => !notification.read).length;
            setNotificationCount(unreadCount);
          }
        } catch (error) {
          console.error("Error loading notification count:", error);
        }
      };
      
      loadNotificationCount();
    }
  }, [activeTab]);
  
  // Create the context value that will be provided to other components
  const tabContextValue = {
    setActiveTab: (tabName) => {
      // Get window width to calculate approximate position for animation
      const windowWidth = Dimensions.get('window').width;
      // Calculate an estimated x position based on tab index
      let tabX = 0;
      
      switch(tabName) {
        case "Home":
          tabX = windowWidth * 0.1;
          break;
        case "AddHabit":
          tabX = windowWidth * 0.3;
          break;
        case "Community":
          tabX = windowWidth * 0.5;
          break;
        case "Notification":
          tabX = windowWidth * 0.7;
          break;
        case "Profile":
          tabX = windowWidth * 0.9;
          break;
        default:
          tabX = windowWidth * 0.1;
      }
      
      // Call the tab change handler with the name and estimated position
      handleTabChange(tabName, tabX);
    }
  };

  return (
    <TabProvider value={tabContextValue}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.backgroundColor} />

        {/* Render Home, Profile, or Community based on activeTab */}
        {activeTab === "Home" && <Home />}
        {activeTab === "AddHabit" && <AddHabit />}
        {activeTab === "Community" && <Community />}
        {activeTab === "Profile" && <Profile />}
        {activeTab === "Notification" && <Notification />}

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNavContainer}>
          <View style={[styles.wrapper, { backgroundColor: theme.cardBackground }]}>
            {/* Tap Highlight Animation */}
            <Animated.View
              style={[
                styles.tapHighlight,
                {
                  opacity: tapHighlightOpacity,
                  backgroundColor: theme.primaryLight,
                  transform: [
                    { translateX: tapPosition.x - 40 },
                    { scale: tapHighlightScale }
                  ],
                },
              ]}
            />
            
            {/* Home Tab */}
            <TouchableOpacity 
              onPress={(event) => {
                const tabX = event.nativeEvent.pageX;
                handleTabChange("Home", tabX);
              }}
            >
              <Animated.View 
                style={[
                  styles.tabButton(activeTab === "Home", theme),
                  { transform: [{ scale: homeScale }] }
                ]}
              >
                <Foundation name="home" size={24} color={activeTab === "Home" ? theme.primaryColor : theme.textColor} />
                <Text style={styles.tabText(activeTab === "Home", theme)}>Home</Text>
                {activeTab === "Home" && (
                  <Animated.View 
                    style={[
                      styles.activeHighlight,
                      {
                        backgroundColor: theme.primaryColor,
                        opacity: highlightOpacity,
                        width: highlightWidth.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%']
                        })
                      }
                    ]}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Calendar Icon (AddHabit) */}
            <TouchableOpacity 
              onPress={(event) => {
                const tabX = event.nativeEvent.pageX;
                handleTabChange("AddHabit", tabX);
              }}
            >
              <Animated.View 
                style={[
                  styles.iconContainer(activeTab === "AddHabit", theme),
                  { transform: [{ scale: addHabitScale }] }
                ]}
              >
                <Image
                  source={require("../asset/icon/calendar.png")}
                  style={[
                    styles.icon,
                    { tintColor: activeTab === "AddHabit" ? theme.primaryColor : theme.textColor }
                  ]}
                />
                {activeTab === "AddHabit" && (
                  <Animated.View 
                    style={[
                      styles.iconHighlight,
                      {
                        backgroundColor: theme.primaryColor,
                        opacity: highlightOpacity,
                        width: highlightWidth.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 40]
                        })
                      }
                    ]}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Community Tab (Message Icon) */}
            <TouchableOpacity 
              onPress={(event) => {
                const tabX = event.nativeEvent.pageX;
                handleTabChange("Community", tabX);
              }}
            >
              <Animated.View 
                style={[
                  styles.iconContainer(activeTab === "Community", theme),
                  { transform: [{ scale: communityScale }] }
                ]}
              >
                <Image
                  source={require("../asset/icon/message.png")}
                  style={[
                    styles.icon,
                    { tintColor: activeTab === "Community" ? theme.primaryColor : theme.textColor }
                  ]}
                />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
                {activeTab === "Community" && (
                  <Animated.View 
                    style={[
                      styles.iconHighlight,
                      {
                        backgroundColor: theme.primaryColor,
                        opacity: highlightOpacity,
                        width: highlightWidth.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 40]
                        })
                      }
                    ]}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Notification Icon */}
            <TouchableOpacity 
              onPress={(event) => {
                const tabX = event.nativeEvent.pageX;
                handleTabChange("Notification", tabX);
              }}
            >
              <Animated.View 
                style={[
                  styles.iconContainer(activeTab === "Notification", theme),
                  { transform: [{ scale: notificationScale }] }
                ]}
              >
                <Image
                  source={require("../asset/icon/notification.png")}
                  style={[
                    styles.icon,
                    { tintColor: activeTab === "Notification" ? theme.primaryColor : theme.textColor }
                  ]}
                />
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>{notificationCount > 99 ? '99+' : notificationCount}</Text>
                  </View>
                )}
                {activeTab === "Notification" && (
                  <Animated.View 
                    style={[
                      styles.iconHighlight,
                      {
                        backgroundColor: theme.primaryColor,
                        opacity: highlightOpacity,
                        width: highlightWidth.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 40]
                        })
                      }
                    ]}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Profile Tab (User Icon) */}
            <TouchableOpacity 
              onPress={(event) => {
                const tabX = event.nativeEvent.pageX;
                handleTabChange("Profile", tabX);
              }}
            >
              <Animated.View 
                style={[
                  styles.iconContainer(activeTab === "Profile", theme),
                  { transform: [{ scale: profileScale }] }
                ]}
              >
                <Image
                  source={require("../asset/icon/user.png")}
                  style={[
                    styles.icon,
                    { tintColor: activeTab === "Profile" ? theme.primaryColor : theme.textColor }
                  ]}
                />
                {activeTab === "Profile" && (
                  <Animated.View 
                    style={[
                      styles.iconHighlight,
                      {
                        backgroundColor: theme.primaryColor,
                        opacity: highlightOpacity,
                        width: highlightWidth.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 40]
                        })
                      }
                    ]}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TabProvider>
  );
};

export default TabView;

const styles = StyleSheet.create({
  // Styles remain the same
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  wrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    padding: 4,
    height: Platform.OS === "ios" ? 80 : 70,
    paddingBottom: Platform.OS === "ios" ? 17 : 5,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 3,
    elevation: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabButton: (isActive, theme) => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: isActive ? theme.primaryLight : "transparent",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 30,
    overflow: "hidden",
  }),
  tabText: (isActive, theme) => ({
    fontSize: 12,
    fontWeight: isActive ? "600" : "400",
    color: isActive ? theme.primaryColor : theme.textColor,
  }),
  iconContainer: (isActive, theme) => ({
    position: "relative",
    padding: 10,
    borderRadius: 30,
    backgroundColor: isActive ? theme.primaryLight : "transparent",
  }),
  icon: {
    width: 25,
    height: 25,
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 15,
    height: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.secondaryColor,
    zIndex: 2,
  },
  badgeText: {
    fontSize: 10,
    color: color.white,
    textAlign: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 1,
    right: 5,
    width: 5,
    height: 5,
    borderRadius: 10,
    backgroundColor: color.primaryColor,
    zIndex: 2,
  },
  activeHighlight: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 3,
    borderRadius: 1.5,
  },
  iconHighlight: {
    position: "absolute",
    bottom: -5,
    left: -5,
    height: 3,
    width: 35,
    borderRadius: 1.5,
  },
  tapHighlight: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    zIndex: 0,
  }
});