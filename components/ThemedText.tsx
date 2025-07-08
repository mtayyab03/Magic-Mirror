import { StyleSheet, Text, type TextProps } from "react-native";

import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/font";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RFPercentage } from "react-native-responsive-fontsize";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "button";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "button" ? styles.button : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: RFPercentage(2.8),
    color: Colors.blacky,
    fontFamily: FontFamily.Regular,
  },
  button: {
    fontSize: RFPercentage(2.3),
    color: Colors.blacky,
    fontFamily: FontFamily.Bold,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: RFPercentage(5),
    fontFamily: FontFamily.Bold,
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
