import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabView from "./src/navigation/TabView";
import Settings from "./src/screens/profile/Settings";
import AddHabit from "./src/screens/habits/AddHabit";
import LoginPage from "./src/screens/auth/LoginPage";
import SignUpPage from "./src/screens/auth/SignUpPage";
import { ThemeProvider } from './src/context/ThemeContext';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
   <ThemeProvider>
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}
        initialRouteName="LoginPage"
      >
        <Stack.Screen name="LoginPage" component={LoginPage} />
        <Stack.Screen name="SignUpPage" component={SignUpPage} />
        <Stack.Screen name="TabView" component={TabView} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="AddHabit" component={AddHabit} />
      </Stack.Navigator>
    </NavigationContainer>
   </ThemeProvider>
  );
}
