import { useFocusEffect, useRouter } from "expo-router";
import LottieView from "lottie-react-native"; // ✅ Lottie import
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

// hooks
import { useAudio } from "@/providers/AudioProvider";

// componenets
import ScreenWrapper from "@/components/Specific/ScreenWrapper";
import { ThemedText } from "@/components/ThemedText";
import AppButton from "@/components/common/AppButton";

// constants
import icons from "@/constants/icons";
import { Colors } from "../../constants/Colors";

const HomeScreen = () => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);

  const { playLoopingMusic } = useAudio();

  useFocusEffect(
    React.useCallback(() => {
      playLoopingMusic(); // 🔊 start music when HomeScreen is focused

      return () => {};
    }, [])
  );

  useEffect(() => {
    // Start pulsing logo animation
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

    // Start Lottie animation (if needed)
    lottieRef.current?.play();
  }, []);

  return (
    <ScreenWrapper style={{ alignItems: "center" }}>
      <ThemedText
        type="title"
        style={{ marginTop: Platform.OS === "ios" ? 10 : RFPercentage(5) }}
      >
        Magic Mirror
      </ThemedText>

      <View style={styles.logoContainer}>
        <View style={styles.smokeRow}>
          <LottieView
            source={require("../../assets/lotties/smoke.json")}
            autoPlay
            loop
            style={[styles.smoke, { left: -100 }]} // slightly right
          />
          <LottieView
            source={require("../../assets/lotties/smoke.json")}
            autoPlay
            loop
            style={[
              styles.smoke,
              {
                width: RFPercentage(60), // adjust size as needed
                height: RFPercentage(60),
                left: -100,
                bottom: -120,
              },
            ]}
          />
          <LottieView
            source={require("../../assets/lotties/smoke.json")}
            autoPlay
            loop
            style={[styles.smoke, { left: 100 }]} // slightly right
          />
        </View>
        <Animated.Image
          source={icons.logo}
          style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity
        style={styles.loginbutton}
        activeOpacity={0.7}
        onPress={() => {
          router.push("/AskMirrorScreen");
        }}
      >
        <AppButton
          title={"Ask the Mirror"}
          colors={[Colors.primary, "#E9C39A", Colors.primary] as const}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginbutton}
        activeOpacity={0.7}
        onPress={() => router.push("/SettingsScreen")}
      >
        <AppButton
          title={"Settings"}
          colors={[Colors.purple, "#DB90DD", Colors.purple] as const}
        />
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

export default HomeScreen;
const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.darkPurple,
  },
  logoContainer: {
    width: RFPercentage(25),
    height: RFPercentage(25),
    marginTop: RFPercentage(14),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: RFPercentage(8),
  },
  logo: {
    width: RFPercentage(20),
    height: RFPercentage(20),
    zIndex: 1,
  },
  smokeRow: {
    // backgroundColor: Colors.primary,
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: "100%",
    zIndex: 0,
    marginRight: RFPercentage(15),
  },
  smoke: {
    position: "absolute",
    width: RFPercentage(40), // adjust size as needed
    height: RFPercentage(40),
  },
  loginbutton: {
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: RFPercentage(1),
  },
  logoContainere: {
    width: "100%",
    height: RFPercentage(60),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: RFPercentage(2),
  },
  mirror: {
    width: RFPercentage(60), // adjust size as needed
    height: RFPercentage(60),
  },
});
