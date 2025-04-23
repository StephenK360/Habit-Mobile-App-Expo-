import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import color from "../../constant/color";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";

const SignUpPage = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const slideUpAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.timing(slideUpAnim, { toValue: 0, duration: 800, useNativeDriver: true }).start();
  }, []);

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created successfully!");
      navigation.replace("SignUpSuccess"); // Navigate to success page
    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.headerText}>Join Us!</Text>
        <Text style={styles.subHeaderText}>Create your account to get started</Text>
      </View>

      <Animated.View style={[styles.bottomSection, { transform: [{ translateY: slideUpAnim }] }]}>
        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={color.black} value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={color.black} value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry placeholderTextColor={color.black} value={password} onChangeText={setPassword} />
        <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry placeholderTextColor={color.black} value={confirmPassword} onChangeText={setConfirmPassword} />

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color={color.white} /> : <Text style={styles.signUpButtonText}>Sign Up</Text>}
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("LoginPage")}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.white },
  topSection: { flex: 1, backgroundColor: color.primaryColor, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  headerText: { fontSize: 28, fontWeight: "bold", color: color.white },
  subHeaderText: { fontSize: 16, color: color.primaryLighter, marginTop: 5 },
  bottomSection: { flex: 2, backgroundColor: color.white, borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, shadowColor: color.black, shadowOpacity: 0.1, elevation: 5 },
  input: { width: "100%", borderWidth: 1, borderColor: color.primaryLight, borderRadius: 12, padding: 15, marginBottom: 16, fontSize: 16, color: color.black, backgroundColor: color.primaryLight },
  signUpButton: { backgroundColor: color.primaryColor, paddingVertical: 14, borderRadius: 12, alignItems: "center", marginBottom: 16 },
  signUpButtonText: { fontSize: 16, fontWeight: "600", color: color.white },
  linkContainer: { marginTop: 10, alignItems: "center" },
  linkText: { fontSize: 14, color: color.secondaryColor, textDecorationLine: "underline", marginVertical: 5 },
});

export default SignUpPage;