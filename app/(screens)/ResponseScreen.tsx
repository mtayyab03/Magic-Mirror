import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import LottieView from "lottie-react-native"; // ✅ Lottie import
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  Easing,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
// componenets
import { ThemedText } from "@/components/ThemedText";
import AppButton from "@/components/common/AppButton";
// constants
import { RFPercentage } from "react-native-responsive-fontsize";
import { Colors } from "../../constants/Colors";

const ResponseScreen = () => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);
  const [displayedText, setDisplayedText] = useState("");

  const { answer } = useLocalSearchParams<{ answer: string }>();

  // Stop speech when app goes to background
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        Speech.stop();
      }
    });
    return () => sub.remove();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      if (!answer || typeof answer !== "string") return;

      let isActive = true;
      let index = 0;
      const words = answer.trim().split(/\s+/);
      let typingInterval: number | null = null;

      const prepareAndSpeak = async () => {
        try {
          const isSpeaking = await Speech.isSpeakingAsync();
          if (isSpeaking) {
            await Speech.stop();
            await new Promise((res) => setTimeout(res, 300));
          }

          lottieRef.current?.reset();
          lottieRef.current?.play();

          typingInterval = setInterval(() => {
            if (!isActive) {
              clearInterval(typingInterval!);
              return;
            }
            if (index < words.length) {
              setDisplayedText((prev) => prev + words[index++] + " ");
            } else {
              clearInterval(typingInterval!);
            }
          }, 300);

          Speech.speak(answer, {
            pitch: 0.7,
            rate: 0.1,
            onDone: () => {
              if (isActive) {
                lottieRef.current?.pause();
              }
            },
          });
        } catch (e) {
          console.warn("Speech error", e);
        }
      };

      setDisplayedText("");
      prepareAndSpeak();

      return () => {
        isActive = false;
        if (typingInterval) clearInterval(typingInterval);
        try {
          Speech.stop();
        } catch (e) {
          console.warn("Speech stop error", e);
        }
        lottieRef.current?.pause();
      };
    }, [answer])
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

    // Play Lottie animation
    lottieRef.current?.play();

    // Stop after 30 seconds
    const timeout = setTimeout(() => {
      lottieRef.current?.pause(); // or .reset() to restart from beginning
    }, 30000);

    return () => clearTimeout(timeout); // Cleanup on unmount
  }, []);

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoContainer}>
          <LottieView
            ref={lottieRef}
            source={require("../../assets/lotties/mirror.json")}
            autoPlay={false} // Let useEffect control it
            loop
            style={styles.mirror}
          />
        </View>

        <View
          style={{
            width: "95%",
          }}
        >
          <ThemedText
            type="default"
            style={{
              fontSize: RFPercentage(3),
              color: Colors.primary,
            }}
          >
            The Mirror Says......
          </ThemedText>
        </View>
        <View
          style={{
            width: "80%",
            height: RFPercentage(20), // 👈 adjust height as needed
            marginTop: RFPercentage(2),
            borderWidth: 0.5,
            borderColor: Colors.white,
            borderRadius: RFPercentage(1),
            padding: RFPercentage(1),
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: RFPercentage(1),
            }}
          >
            <ThemedText
              type="default"
              style={{
                fontSize: RFPercentage(2.2),
                textAlign: "center",
                color: Colors.white,
              }}
            >
              {displayedText}
            </ThemedText>
          </ScrollView>
        </View>

        <View
          style={{
            width: "95%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            position: "absolute",
            bottom: RFPercentage(5),
          }}
        >
          <TouchableOpacity
            style={styles.loginbutton}
            activeOpacity={0.7}
            onPress={() => {
              Speech.stop(); // 👈 Stop voice
              lottieRef.current?.pause(); // 👈 Stop animation
              router.replace("/AskMirrorScreen");
            }}
          >
            <AppButton
              title={"Ask Again"}
              colors={[Colors.primary, "#E9C39A", Colors.primary] as const}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Speech.stop(); // 👈 Stop voice
              lottieRef.current?.pause(); // 👈 Stop animation
              router.push("/SettingsScreen");
            }}
            style={styles.loginbutton}
            activeOpacity={0.7}
          >
            <AppButton
              title={"Save History"}
              colors={[Colors.primary, "#E9C39A", Colors.primary] as const}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ResponseScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.darkPurple,
  },
  safeArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    marginTop: RFPercentage(5),
  },
  logoContainer: {
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
  loginbutton: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: RFPercentage(1),
  },
});
