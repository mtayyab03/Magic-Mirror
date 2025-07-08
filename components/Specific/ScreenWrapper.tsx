import React, { ReactNode } from "react";
import {
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

// constants
import { Colors } from "@/constants/Colors";
import icons from "@/constants/icons";

interface ScreenWrapperProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  statusBarColor?: string;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  statusBarColor = Colors.darkPurple,
}) => {
  return (
    <ImageBackground
      source={icons.splash}
      style={styles.background}
      resizeMode="cover"
    >
      {/* ✅ Android status bar control */}

      <StatusBar backgroundColor={statusBarColor} barStyle="light-content" />

      {/* ✅ iOS Safe Area Support */}
      <SafeAreaView style={[styles.safeArea, style]}>{children}</SafeAreaView>
    </ImageBackground>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.darkPurple,
  },
  safeArea: {
    flex: 1,
  },
});
