import React, { useState, useContext } from "react";
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  StatusBar, 
  Platform 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/common/Header"; 
import { ThemeContext } from "../../context/ThemeContext";
import { Feather, FontAwesome5 } from "@expo/vector-icons";

const Community = () => {
  const { theme, isDarkMode } = useContext(ThemeContext);
  
  // 🔹 State for storing posts
  const [posts, setPosts] = useState([
    { id: 1, user: "@habitbuilder22", content: "Just completed my 30-day morning run challenge! 🏃‍♂️ #HabitSuccess" },
    { id: 2, user: "@mindsetMatters", content: '"Atomic Habits" changed my life! What are your key takeaways?' },
    { id: 3, user: "@wellnessWarrior", content: "Meditation for 10 minutes a day has been life-changing. Who's in? 🧘‍♀️" },
  ]);

  // 🔹 State for new post input
  const [newPost, setNewPost] = useState("");

  // 🔹 Function to handle new post submission
  const handlePostSubmit = () => {
    if (newPost.trim() === "") {
      Alert.alert("Error", "Post cannot be empty!");
      return;
    }

    const newPostData = {
      id: posts.length + 1,
      user: "@newUser", // Replace with actual username if you have authentication
      content: newPost,
    };

    setPosts([newPostData, ...posts]); // Add new post to the top
    setNewPost(""); // Clear input field
  };

  return (
    <ScrollView 
      style={[styles.scrollView, { backgroundColor: theme.backgroundColor }]} 
      showsVerticalScrollIndicator={false}
    >
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <Header />
      <Text style={[styles.title, { color: theme.textColor }]}>Community</Text>

      {/* Trending Topics */}
      <View style={[styles.trendingContainer, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>🔥 Trending Topics</Text>
        <View style={styles.topic}>
          <FontAwesome5 name="fire" size={20} color={theme.primaryColor} />
          <Text style={[styles.topicText, { color: theme.textColor }]}>Building Better Habits</Text>
        </View>
        <View style={styles.topic}>
          <FontAwesome5 name="dumbbell" size={20} color={theme.primaryColor} />
          <Text style={[styles.topicText, { color: theme.textColor }]}>Fitness Routines</Text>
        </View>
        <View style={styles.topic}>
          <FontAwesome5 name="book" size={20} color={theme.primaryColor} />
          <Text style={[styles.topicText, { color: theme.textColor }]}>Best Self-Help Books</Text>
        </View>
      </View>

      {/* Create a New Post */}
      <View style={[styles.newPostContainer, { backgroundColor: theme.cardBackground }]}>
        <TextInput
          style={[styles.input, { 
            borderBottomColor: theme.borderColor,
            color: theme.textColor 
          }]}
          placeholder="Share something with the community..."
          placeholderTextColor={theme.secondaryTextColor}
          value={newPost}
          onChangeText={setNewPost}
        />
        <TouchableOpacity 
          style={[styles.postButton, { backgroundColor: theme.primaryColor }]} 
          onPress={handlePostSubmit}
        >
          <Feather name="plus-circle" size={30} color={theme.white} />
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Posts */}
      <View style={styles.feedContainer}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>📢 Recent Posts</Text>
        {posts.map((post) => (
          <View key={post.id} style={[styles.post, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.postUser, { color: theme.primaryColor }]}>{post.user}</Text>
            <Text style={[styles.postContent, { color: theme.textColor }]}>{post.content}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Community;

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginTop: Platform.OS === "ios" ? 0 : 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  trendingContainer: {
    padding: 15,
    borderRadius: 15,
    marginTop: 15,
  },
  topic: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  topicText: {
    fontSize: 16,
    marginLeft: 10,
  },
  newPostContainer: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  feedContainer: {
    marginTop: 20,
    marginBottom: 50,
  },
  post: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  postUser: {
    fontWeight: "bold",
  },
  postContent: {
    fontSize: 14,
    marginTop: 5,
  },
  postButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
