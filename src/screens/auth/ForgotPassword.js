import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import color from "../../constant/color";

const ForgotPassword = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚧 Page Under Construction 🚧</Text>
      <Text style={styles.message}>This feature is coming soon! Stay tuned.</Text>

      {/* Go Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: color.white, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: color.primaryColor, textAlign: "center" },
  message: { fontSize: 16, color: color.black, textAlign: "center", marginVertical: 10 },
  backButton: { backgroundColor: color.primaryColor, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, marginTop: 20 },
  backButtonText: { fontSize: 16, fontWeight: "600", color: color.white },
});

export default ForgotPassword;