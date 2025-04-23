import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  Animated
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/common/Header";
import { ThemeContext } from "../../context/ThemeContext";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Notification = () => {
  const { theme, isDarkMode } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Load notifications when component mounts
  useEffect(() => {
    loadNotifications();
    
    // Animate fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  // Load notifications from AsyncStorage
  const loadNotifications = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem("notifications");
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications);
      } else {
        // Default notifications for demo purposes
        const defaultNotifications = [
          {
            id: 1,
            title: "Morning Run",
            message: "You've created a new habit: Morning Run",
            time: "2 hours ago",
            type: "habit_created",
            read: false,
            icon: "running",
            iconColor: "#4D96FF",
            iconBgColor: "#EAF4FF"
          },
          {
            id: 2,
            title: "Meditation",
            message: "You've created a new habit: Daily Meditation",
            time: "Yesterday",
            type: "habit_created",
            read: true,
            icon: "brain",
            iconColor: "#9D65C9",
            iconBgColor: "#F5EAFF"
          },
          {
            id: 3,
            title: "Streak Milestone!",
            message: "Congratulations! You've maintained a 7-day streak for Reading",
            time: "2 days ago",
            type: "streak_milestone",
            read: true,
            icon: "fire",
            iconColor: "#FF6B6B",
            iconBgColor: "#FFEAEA"
          }
        ];
        setNotifications(defaultNotifications);
        await AsyncStorage.setItem("notifications", JSON.stringify(defaultNotifications));
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  // This section is to add a new notification when a habit is created
  const addNotification = async (habit) => {
    try {
      const newNotification = {
        id: Date.now(),
        title: habit.name,
        message: `You've created a new habit: ${habit.name}`,
        time: "Just now",
        type: "habit_created",
        read: false,
        icon: habit.icon || "star",
        iconColor: habit.iconColor || "#FFC107",
        iconBgColor: habit.iconBgColor || "#FFF9E6"
      };

      const updatedNotifications = [newNotification, ...notifications];
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  // this will Mark a notification as read
  const markAsRead = async (id) => {
    try {
      const updatedNotifications = notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Here im making it mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      await AsyncStorage.setItem("notifications", JSON.stringify([]));
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // Get unread notification count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Render notification icon based on type
  const renderNotificationIcon = (notification) => {
    return (
      <View style={[styles.iconContainer, { backgroundColor: notification.iconBgColor }]}>
        <FontAwesome5 
          name={notification.icon} 
          size={20} 
          color={notification.iconColor} 
          solid 
        />
      </View>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.backgroundColor} />
      <Header />

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: theme.textColor }]}>Notifications</Text>
        <View style={styles.headerActions}>
          {notifications.length > 0 && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.primaryLight }]}
                onPress={markAllAsRead}
              >
                <Text style={[styles.actionText, { color: theme.primaryColor }]}>
                  Mark all as read
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: theme.primaryLight }]}
                onPress={clearAllNotifications}
              >
                <Feather name="trash-2" size={16} color={theme.primaryColor} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Notification Counter */}
      {unreadCount > 0 && (
        <View style={[styles.counterContainer, { backgroundColor: theme.cardBackground }]}>
          <View style={[styles.badge, { backgroundColor: theme.primaryColor }]}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
          <Text style={[styles.counterText, { color: theme.textColor }]}>
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Notification List */}
      <Animated.View style={{ opacity: fadeAnim }}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <TouchableOpacity 
              key={notification.id}
              style={[
                styles.notificationCard, 
                { 
                  backgroundColor: theme.cardBackground,
                  borderLeftColor: notification.read ? 'transparent' : theme.primaryColor,
                  borderLeftWidth: notification.read ? 0 : 4
                }
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              {renderNotificationIcon(notification)}
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={[styles.notificationTitle, { color: theme.textColor }]}>
                    {notification.title}
                  </Text>
                  <Text style={[styles.notificationTime, { color: theme.secondaryTextColor }]}>
                    {notification.time}
                  </Text>
                </View>
                <Text style={[styles.notificationMessage, { color: theme.secondaryTextColor }]}>
                  {notification.message}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Image 
              source={require('../../asset/icon/notification.png')} 
              style={[styles.emptyIcon, { tintColor: theme.secondaryTextColor }]} 
            />
            <Text style={[styles.emptyText, { color: theme.secondaryTextColor }]}>
              No notifications yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.secondaryTextColor }]}>
              When you create new habits or reach milestones, you'll see them here
            </Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    marginTop: Platform.OS === "ios" ? 0 : 30,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  counterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
}); 