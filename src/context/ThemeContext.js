import React, { createContext, useState, useEffect } from 'react';
import color from '../constant/color';

// Create expanded theme object with light and dark variants
const themes = {
  light: {
    ...color,
    backgroundColor: "#F8F9FA",
    cardBackground: "#FFFFFF",
    textColor: "#000000", 
    secondaryTextColor: "gray",
    borderColor: "#ddd",
    progressBackground: "#ddd",
    iconColor: color.primaryColor,
    settingsTextColor: color.primaryColor,
    headlineColor: color.primaryColor, // Same as primaryColor in light mode
    // Keep logout color consistent
    logoutColor: "red"
  },
  dark: {
    ...color,
    backgroundColor: "#121212",
    cardBackground: "#1E1E1E",
    textColor: "#FFFFFF",
    secondaryTextColor: "#BBBBBB",
    borderColor: "#333333",
    progressBackground: "#333333",
    primaryColor: "#FF9B55", // Orange for most UI elements in dark mode
    iconColor: "#FF9B55", // Orange for icons in dark mode
    headlineColor: "#071F2C", // Keep the dark blue color for headlines in dark mode
    settingsTextColor: "#FFFFFF", // White text for settings in dark mode
    // Keep logout color consistent
    logoutColor: "red"
  }
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Get current theme based on dark mode state
  const theme = isDarkMode ? themes.dark : themes.light;
  
  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Save to async storage
    try {
      localStorage.setItem('darkMode', JSON.stringify(!isDarkMode));
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };
  
  // Load saved theme preference on startup
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  }, []);
  
  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};