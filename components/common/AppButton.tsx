// components/common/AppButton.tsx

import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

// componenets
import { ThemedText } from "@/components/ThemedText";

// config
import { Colors } from "../../constants/Colors";
import { FontFamily } from "../../constants/font";

type AppButtonProps = {
  title: string;
  colors?: [string, string] | [string, string, ...string[]]; // ✅ fix
  onPress?: () => void;
};

export default function AppButton({
  title,
  colors = [Colors.primary, Colors.secondary, Colors.primary], // fallback colors
}: AppButtonProps) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0.5, y: 0 }} // top-center
      end={{ x: 0.5, y: 1 }} // bottom-center
      style={styles.button}
    >
      <ThemedText type="button">{title}</ThemedText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "90%",
    height: RFPercentage(5.7),
    borderRadius: RFPercentage(2),
    alignItems: "center",
    justifyContent: "center",
    marginTop: RFPercentage(2),
  },
  buttontext: {
    color: Colors.white,
    fontSize: RFPercentage(2.2),
    fontFamily: FontFamily.Bold,
    marginBottom: RFPercentage(0.4),
  },
});
