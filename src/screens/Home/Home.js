import { Platform, ScrollView, StyleSheet, View } from "react-native";
import React, { useContext } from "react";
import Header from "../../components/common/Header";
import Search from "../../components/common/Search";
import HeadLine from "../../components/common/HeadLine";
import Category from "../habits/Category";
import Habit from "../habits/Habit";
import { ThemeContext } from "../../context/ThemeContext";

const Home = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ScrollView
      style={{
        paddingHorizontal: 20,
        paddingTop: 10,
        marginTop: Platform.OS === "ios" ? 0 : 30,
        backgroundColor: theme.backgroundColor,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Header />
      <Search />
      <HeadLine />
      <Category />
      <Habit />
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({});
