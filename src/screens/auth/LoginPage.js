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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig"; 


const LoginPage = ({ navigation }) => {
  // State for email, password, and loading indicator
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Add error state


  // Ref for animation
  const slideUpAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    // Slide-up animation on mount
    Animated.timing(slideUpAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);


  // Function to handle login with Firebase Authentication
  const handleLogin = async () => {
    setError(""); // Clear previous errors
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace("TabView");
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "Invalid email format";
          break;
        case 'auth/user-disabled':
          errorMessage = "Account disabled";
          break;
        case 'auth/user-not-found':
          errorMessage = "User Not Found";
          break;
        case 'auth/wrong-password':
          errorMessage = "Invalid email or password";
          break;
        case 'auth/invalid-credential':
          errorMessage = "Inavlied Credentials";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many attempts. Try later";
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage); // Set error state
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.topSection}>
        <Text style={styles.headerText}>Welcome Back!</Text>
        <Text style={styles.subHeaderText}>Login to continue</Text>
      </View>

      {/* Login Form */}
      <Animated.View style={[styles.bottomSection, { transform: [{ translateY: slideUpAnim }] }]}>

        {/* Add error display */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={color.black}
          value={email}
          onChangeText={setEmail}
        />
        
        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          placeholderTextColor={color.black}
          value={password}
          onChangeText={setPassword}
        />

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={color.white} /> : <Text style={styles.loginButtonText}>Login</Text>}
        </TouchableOpacity>

        {/* Navigation Links */}
        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("SignUpPage")}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.white,
  },
  topSection: {
    flex: 1,
    backgroundColor: color.primaryColor,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: color.white,
  },
  subHeaderText: {
    fontSize: 16,
    color: color.primaryLight,
    marginTop: 5,
  },
  bottomSection: {
    flex: 2,
    backgroundColor: color.primaryLight,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    shadowColor: color.black,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: color.primaryLighter,
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
    color: color.black,
    backgroundColor: color.white,
  },
  loginButton: {
    backgroundColor: color.secondaryColor,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: color.white,
  },
  
  linkContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    color: color.secondaryColor,
    textDecorationLine: "underline",
    marginVertical: 5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDEDED',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F5C6CB'
  },
  errorText: {
    color: color.errorText,
    fontSize: 14,
    marginLeft: 10,
    flexShrink: 1
  }
  
});

export default LoginPage;