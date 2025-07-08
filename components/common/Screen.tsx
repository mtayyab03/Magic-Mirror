import React, { ReactNode } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

//config
import { Colors } from "../../constants/Colors";

interface ScreenProps {
  children: ReactNode;
  statusBarColor?: string;
  style?: StyleProp<ViewStyle>;
}

const Screen: React.FC<ScreenProps> = ({
  children,
  statusBarColor = Colors.white,
  style,
}) => {
  return (
    <SafeAreaView style={[styles.screen, style]}>
      <StatusBar backgroundColor={statusBarColor} barStyle="light-content" />

      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});

export default Screen;
