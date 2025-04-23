import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import color from "../../constant/color";

const SignupSuccess = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.successText}>🎉 Signup Successful!</Text>
      <Text style={styles.message}>Welcome aboard! You can now log in and start your journey.</Text>

      {/* Go to Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.replace("LoginPage")}>
        <Text style={styles.loginButtonText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: color.white, paddingHorizontal: 20 },
  successText: { fontSize: 28, fontWeight: "bold", color: color.primaryColor, textAlign: "center" },
  message: { fontSize: 16, color: color.black, textAlign: "center", marginVertical: 10 },
  loginButton: { backgroundColor: color.primaryColor, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, marginTop: 20 },
  loginButtonText: { fontSize: 16, fontWeight: "600", color: color.white },
});

export default SignupSuccess;