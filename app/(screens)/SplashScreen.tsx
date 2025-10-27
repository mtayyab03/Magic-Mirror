import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

// hooks
import { useAudio } from "@/providers/AudioProvider";

// componenets
import ScreenWrapper from "@/components/Specific/ScreenWrapper";
// constants
import { Colors } from "../../constants/Colors";
import { FontFamily } from "../../constants/font";
import icons from "../../constants/icons";

export default function SplashScreen() {
  const router = useRouter();
  const { playLoopingMusic } = useAudio();

  useFocusEffect(
    React.useCallback(() => {
      playLoopingMusic(); // 🔊 start music when HomeScreen is focused
    }, [])
  );

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Navigate after 3s
    const timeout = setTimeout(() => {
      router.push("/LoginScreen");
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <ScreenWrapper style={styles.customBackground}>
      <View style={styles.content}>
        <Animated.Image
          source={icons.logo}
          style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
          resizeMode="contain"
        />
        <Animated.Text
          style={[styles.title, { transform: [{ scale: scaleAnim }] }]}
        >
          Magic Mirror
        </Animated.Text>
      </View>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  customBackground: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: RFPercentage(18),
    height: RFPercentage(18),
    marginBottom: 20,
  },
  title: {
    fontSize: RFPercentage(5),
    fontFamily: FontFamily.Bold,
    color: Colors.primary,
  },
});
