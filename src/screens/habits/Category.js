import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { useTabContext } from '../../navigation/TabContext';
import { FontAwesome5 } from "@expo/vector-icons";

// Import the same icon set from AddHabit.js
const HABIT_ICONS = {
  health: { icon: "heart", color: "#FF6B6B", backgroundColor: "#FFEAEA" },
  fitness: { icon: "dumbbell", color: "#4D96FF", backgroundColor: "#EAF4FF" },
  productivity: { icon: "briefcase", color: "#6BCB77", backgroundColor: "#EAFBEC" },
  mindfulness: { icon: "brain", color: "#9D65C9", backgroundColor: "#F5EAFF" },
  music: { icon: "guitar", color: "#FF5A5F", backgroundColor: "#FFEBEC" },
  education: { icon: "book", color: "#2AB3C0", backgroundColor: "#E6F7F9" },
};

const Category = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={{ marginTop: 25 }}>
      <Text
        style={{
          ...styles.title,
          color: theme.textColor,
        }}
      >
        Habit Builder
      </Text>
      <View
        style={{
          alignItems: "center",
          justifyContent: "space-around",
          flexDirection: "row",
          gap: 25,
          marginTop: 18,
        }}
      >
        <IconButton 
          iconName={HABIT_ICONS.health.icon} 
          iconColor={HABIT_ICONS.health.color} 
          backgroundColor={HABIT_ICONS.health.backgroundColor} 
          category="health" 
        />
        <IconButton 
          iconName={HABIT_ICONS.fitness.icon} 
          iconColor={HABIT_ICONS.fitness.color} 
          backgroundColor={HABIT_ICONS.fitness.backgroundColor} 
          category="fitness" 
        />
        <IconButton 
          iconName={HABIT_ICONS.productivity.icon} 
          iconColor={HABIT_ICONS.productivity.color} 
          backgroundColor={HABIT_ICONS.productivity.backgroundColor} 
          category="productivity" 
        />
        <IconButton 
          iconName={HABIT_ICONS.mindfulness.icon} 
          iconColor={HABIT_ICONS.mindfulness.color} 
          backgroundColor={HABIT_ICONS.mindfulness.backgroundColor} 
          category="mindfulness" 
        />
      </View>
      <View
        style={{
          alignItems: "center",
          justifyContent: "space-around",
          flexDirection: "row",
          gap: 25,
          marginTop: 18,
        }}
      >
        <IconButton 
          iconName={HABIT_ICONS.music.icon} 
          iconColor={HABIT_ICONS.music.color} 
          backgroundColor={HABIT_ICONS.music.backgroundColor} 
          category="music" 
        />
        <IconButton 
          iconName={HABIT_ICONS.education.icon} 
          iconColor={HABIT_ICONS.education.color} 
          backgroundColor={HABIT_ICONS.education.backgroundColor} 
          category="education" 
        />
        {/* You could add more categories here or leave space for future ones */}
        <TouchableOpacity
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { height: 0.2, width: 0.2 },
            elevation: 1,
            padding: 12,
            borderRadius: 20,
            backgroundColor: theme.cardBackground,
            height: 60,
            width: 60,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome5 name="utensils" size={22} color="#FFA500" solid />
        </TouchableOpacity>
        <SeeAllButton />
      </View>
    </View>
  );
};

export default Category;

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
});

const IconButton = ({ iconName, iconColor, backgroundColor, category }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <TouchableOpacity
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { height: 0.2, width: 0.2 },
        elevation: 1,
        padding: 12,
        borderRadius: 20,
        backgroundColor: backgroundColor || theme.cardBackground,
        height: 60,
        width: 60,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FontAwesome5 
        name={iconName}
        size={22}
        color={iconColor}
        solid
      />
    </TouchableOpacity>
  );
};

const SeeAllButton = () => {
  const { setActiveTab } = useTabContext();
  const { theme } = useContext(ThemeContext);
  
  return (
    <TouchableOpacity
      style={{
        borderRadius: 20,
        backgroundColor: theme.secondaryColor,
        height: 60,
        width: 60,
        alignItems: "center",
        justifyContent: "center",
      }}
      onPress={() => setActiveTab("AddHabit")}
    >
      <Text style={{ color: theme.white, fontSize: 14 }}> See all</Text>
    </TouchableOpacity>
  );
};