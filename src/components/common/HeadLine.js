import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { useTabContext } from '../../navigation/TabContext';
import { FontAwesome5 } from "@expo/vector-icons";
import color from "../../constant/color";

// Import the same icon set from Category.js
const HABIT_ICONS = {
  health: { icon: "heart", color: "#FF6B6B", backgroundColor: "#FFEAEA" },
  fitness: { icon: "dumbbell", color: "#4D96FF", backgroundColor: "#EAF4FF" },
  productivity: { icon: "briefcase", color: "#6BCB77", backgroundColor: "#EAFBEC" },
  mindfulness: { icon: "brain", color: "#9D65C9", backgroundColor: "#F5EAFF" },
};

const HeadLine = () => {
  const { setActiveTab } = useTabContext();
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={{
        marginTop: 25,
        backgroundColor: theme.headlineColor,
        padding: 20,
        borderRadius: 30,
      }}
    >
      <Text style={styles.title}>Current Habit Progress with</Text>
      <Text style={styles.title}>Habit Tracker</Text>

      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <HabitIcon 
          iconName={HABIT_ICONS.health.icon} 
          backgroundColor={HABIT_ICONS.health.color} 
          index={0} 
        />
        <HabitIcon 
          iconName={HABIT_ICONS.fitness.icon} 
          backgroundColor={HABIT_ICONS.fitness.color} 
          index={1} 
        />
        <HabitIcon 
          iconName={HABIT_ICONS.productivity.icon} 
          backgroundColor={HABIT_ICONS.productivity.color} 
          index={2} 
        />
        <HabitIcon 
          iconName={HABIT_ICONS.mindfulness.icon} 
          backgroundColor={HABIT_ICONS.mindfulness.color} 
          index={3} 
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          marginTop: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          style={{
            paddingVertical: 5,
            paddingHorizontal: 12,
            backgroundColor: "#071F2C",
            borderRadius: 20,
          }}
        >
          <Text style={{ ...styles.title, fontSize: 14 }}>15+ Habits </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            backgroundColor: theme.white,
            borderRadius: 15,
          }}
          onPress={() => setActiveTab("AddHabit")}
        >
          <Text
            style={{ ...styles.title, fontSize: 14, color: theme.headlineColor }}
          >
            Check Progress
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HeadLine;

const styles = StyleSheet.create({
  title: {
    color: color.white,
    fontSize: 18,
    fontWeight: "700",
  },
});


const HabitIcon = ({ iconName, backgroundColor, index }) => {
  return (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: color.white,
        marginLeft: index === 0 ? 0 : -10,
        backgroundColor: color.white,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <FontAwesome5 
        name={iconName}
        size={16}
        color={backgroundColor}
        solid
      />
    </View>
  );
};
