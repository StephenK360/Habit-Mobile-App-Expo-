import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Pressable
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTabContext } from '../../navigation/TabContext';


// Define the icons for each habit type (matching AddHabit.js)
const HABIT_ICONS = {
  health: { icon: "heart", color: "#FF6B6B", backgroundColor: "#FFEAEA" },
  fitness: { icon: "dumbbell", color: "#4D96FF", backgroundColor: "#EAF4FF" },
  productivity: { icon: "briefcase", color: "#6BCB77", backgroundColor: "#EAFBEC" },
  mindfulness: { icon: "brain", color: "#9D65C9", backgroundColor: "#F5EAFF" },
  music: { icon: "guitar", color: "#FF5A5F", backgroundColor: "#FFEBEC" },
  education: { icon: "book", color: "#2AB3C0", backgroundColor: "#E6F7F9" },
  default: { icon: "star", color: "#FFC107", backgroundColor: "#FFF9E6" }
};

// Default habits if none are found in storage
const defaultHabits = [
  // ... your default habits array
];

const Habit = () => {
  const { setActiveTab } = useTabContext();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme, isDarkMode } = useContext(ThemeContext);

  // Load habits from AsyncStorage
  const loadHabits = async () => {
    try {
      setLoading(true);
      const storedHabits = await AsyncStorage.getItem("habits");
      
      if (storedHabits) {
        const parsedHabits = JSON.parse(storedHabits);
        // Transform the habit data to match the format expected by Habit.js
        const formattedHabits = parsedHabits.map(habit => {
          // Get icon info based on habit type
          const iconInfo = HABIT_ICONS[habit.type] || HABIT_ICONS.default;
          
          return {
            id: habit.id,
            name: habit.name,
            position: habit.typeName || habit.type.charAt(0).toUpperCase() + habit.type.slice(1),
            // Add icon properties instead of image
            icon: habit.icon || iconInfo.icon,
            iconColor: habit.iconColor || iconInfo.color,
            iconBgColor: habit.iconBgColor || iconInfo.backgroundColor,
            // Add additional properties that might be needed for the Details screen
            progress: habit.progress,
            goal: habit.goal,
            streak: habit.streak,
            time: habit.time,
            type: habit.type,
            // Include all original properties for proper editing/deleting
            ...habit
          };
        });
        setHabits(formattedHabits);
      } else {
        setHabits(defaultHabits);
      }
    } catch (error) {
      console.error("Error loading habits:", error);
      setHabits(defaultHabits);
    } finally {
      setLoading(false);
    }
  };

  // Load habits when the component mounts
  useEffect(() => {
    loadHabits();
  }, []);

  // Reload habits whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadHabits();
    }, [])
  );

  const handleEditHabit = (habit) => {
    // Navigate to the AddHabit screen with the habit data for editing
    setActiveTab("AddHabit");
  };

  // Function to delete a habit
  const deleteHabit = async (id) => {
    try {
      // Get current habits from storage
      const storedHabits = await AsyncStorage.getItem("habits");
      if (storedHabits) {
        const parsedHabits = JSON.parse(storedHabits);
        // Filter out the habit to delete
        const updatedHabits = parsedHabits.filter(habit => habit.id !== id);
        // Save updated habits back to storage
        await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));
        // Update state to reflect changes
        loadHabits();
      }
    } catch (error) {
      console.error("Error deleting habit:", error);
      Alert.alert("Error", "Failed to delete habit. Please try again.");
    }
  };

  // Function to show confirmation dialog before deleting
  const confirmDelete = (habit) => {
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habit.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteHabit(habit.id)
        }
      ]
    );
  };

  // Function to toggle habit completion for today
  const toggleHabitCompletion = async (habit) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      
      // Get current habits from storage
      const storedHabits = await AsyncStorage.getItem("habits");
      if (storedHabits) {
        const parsedHabits = JSON.parse(storedHabits);
        
        // Find and update the habit
        const updatedHabits = parsedHabits.map(h => {
          if (h.id === habit.id) {
            // Initialize completionLog if it doesn't exist
            if (!h.completionLog) {
              h.completionLog = {};
            }
            
            // Toggle completion status for today
            h.completionLog[today] = !h.completionLog[today];
            
            // Update progress if needed
            if (h.progress !== undefined && h.goal !== undefined) {
              h.progress = h.completionLog[today] ? Math.min(h.progress + 1, h.goal) : Math.max(h.progress - 1, 0);
            }
            
            // Update streak if needed
            if (h.streak !== undefined) {
              if (h.completionLog[today]) {
                h.streak = (h.streak || 0) + 1;
              } else {
                h.streak = Math.max((h.streak || 0) - 1, 0);
              }
            }
          }
          return h;
        });
        
        // Save updated habits back to storage
        await AsyncStorage.setItem("habits", JSON.stringify(updatedHabits));
        
        // Update state to reflect changes
        loadHabits();
      }
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      Alert.alert("Error", "Failed to update habit completion. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
      </View>
    );
  }

  return (
    <View style={{ marginTop: 25 }}>
      <Text style={[styles.title, { color: theme.textColor }]}>Current Habits</Text>
      
      {habits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="calendar" size={50} color={theme.secondaryTextColor} />
          <Text style={[styles.emptyText, { color: theme.secondaryTextColor }]}>No habits added yet</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.primaryColor }]}
            onPress={() => setActiveTab("AddHabit")}
          >
            <Text style={[styles.addButtonText, { color: theme.white }]}>Add Your First Habit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        habits.map((item, index) => {
          // Check if habit is completed today
          const today = new Date().toISOString().split('T')[0];
          const isCompletedToday = item.completionLog && item.completionLog[today];
          
          return (
            <Pressable
              onPress={() => setActiveTab("AddHabit")}
              key={item.id || index}
              style={[styles.habitCard, { backgroundColor: theme.cardBackground }]}
            >
              <View style={styles.iconContainer}>
                <View style={[styles.iconBackground, { backgroundColor: item.iconBgColor }]}>
                  <FontAwesome5
                    name={item.icon} 
                    size={22} 
                    color={item.iconColor} 
                    solid
                  />
                </View>
              </View>
              
              <View style={styles.contentContainer}>
                <View style={styles.textContainer}>
                  <Text style={[styles.habitName, { color: theme.textColor }]} numberOfLines={1} ellipsizeMode="tail">
                    {item?.name}
                  </Text>
                  <Text style={[styles.habitPosition, { color: theme.secondaryTextColor }]}>{item?.position}</Text>
                  {item.progress !== undefined && item.goal !== undefined && (
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { backgroundColor: theme.progressBackground }]}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              width: `${(item.progress / item.goal) * 100}%`,
                              backgroundColor: item.iconColor || theme.primaryColor 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.habitGoal, { color: theme.secondaryTextColor }]}>
                        {item.progress}/{item.goal}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.actionsContainer}>
                  {item.streak !== undefined && (
                    <View style={styles.streakContainer}>
                      <Text style={[styles.streak, { color: theme.textColor }]}>{item.streak}</Text>
                      <Feather name="flame" size={16} color="#F97316" />
                    </View>
                  )}
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[
                        styles.completeButton,
                        isCompletedToday && { backgroundColor: item.iconColor || theme.primaryColor }
                      ]}
                      onPress={() => toggleHabitCompletion(item)}
                    >
                      <Feather 
                        name={isCompletedToday ? "check" : "circle"} 
                        size={22} 
                        color={isCompletedToday ? "#FFF" : theme.primaryColor} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => confirmDelete(item)}
                    >
                      <Feather name="trash-2" size={22} color="#FF6B6B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditHabit(item)}
                    >
                      <Feather name="edit" size={22} color={isDarkMode ? theme.secondaryColor : theme.primaryColor} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })
      )}
      <View style={{ paddingBottom: 100 }}></View>
    </View>
  );
};

export default Habit;

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  habitCard: {
    flexDirection: "row",
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { height: 0.2, width: 0.2 },
    elevation: 3,
    borderRadius: 15,
  },
  iconContainer: {
    marginRight: 15,
  },
  iconBackground: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  habitPosition: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  habitGoal: {
    fontSize: 12,
    minWidth: 40,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streak: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  deleteButton: {
    padding: 5,
  },
  editButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  completeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});