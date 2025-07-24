import { Audio } from "expo-av";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native"; // ✅ Lottie import
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  Easing,
  Platform,
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

const GOOGLE_TTS_API_KEY = "AIzaSyDypRS1Lo_ou4zE7iCK9HklFR4BlpueABU";

const ResponseScreen = () => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const { answer, selectedLanguage = "en" } = useLocalSearchParams<{
    answer: string;
    selectedLanguage?: "en" | "hi" | "ja" | "bn";
  }>();
  const voiceConfig = {
    languageCode: "en-US",
    name: "en-US-Wavenet-B",
    ssmlGender: "MALE",
  };

  if (selectedLanguage === "hi") {
    voiceConfig.languageCode = "hi-IN";
    voiceConfig.name = "hi-IN-Standard-B"; // use Standard if Wavenet is unsupported
  } else if (selectedLanguage === "ja") {
    voiceConfig.languageCode = "ja-JP";
    voiceConfig.name = "ja-JP-Wavenet-B";
  } else if (selectedLanguage === "bn") {
    voiceConfig.languageCode = "bn-IN";
    voiceConfig.name = "bn-IN-Wavenet-B";
  }

  const [displayedText, setDisplayedText] = useState("");

  // Cleanup on background
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") stopSpeech();
    });
    return () => sub.remove();
  }, []);

  // Stop and unload sound + pause animation
  const stopSpeech = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (err) {
      console.warn("stopSpeech error:", err);
    }
    lottieRef.current?.pause();
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!answer || typeof answer !== "string") return;

      let isActive = true;
      let index = 0;
      let typingInterval: number | null = null;
      const words = answer.trim().split(/\s+/);

      const playResponse = async () => {
        try {
          await stopSpeech(); // cleanup if any
          await new Promise((res) => setTimeout(res, 300));

          setDisplayedText("");
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

          const res = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                input: { text: answer },
                voice: voiceConfig,
                audioConfig: {
                  audioEncoding: "MP3",
                  pitch: -10.0,
                  speakingRate: 0.55,
                },
              }),
            }
          );

          const data = await res.json();
          if (!data.audioContent) throw new Error("No audio content");

          const uri = `data:audio/mp3;base64,${data.audioContent}`;
          const { sound } = await Audio.Sound.createAsync({ uri });
          soundRef.current = sound;

          sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) return;
            if (status.didJustFinish && isActive) {
              lottieRef.current?.pause(); // stop animation exactly when done
            }
          });

          await sound.playAsync();
        } catch (err) {
          console.warn("TTS error:", err);
        }
      };

      playResponse();

      return () => {
        isActive = false;
        if (typingInterval) clearInterval(typingInterval);
        stopSpeech();
      };
    }, [answer])
  );

  useEffect(() => {
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
  }, []);

  const handleAskAgain = async () => {
    await stopSpeech();
    setDisplayedText("");
    router.replace("/AskMirrorScreen");
  };

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
            bottom: Platform.OS === "ios" ? RFPercentage(5) : RFPercentage(7),
          }}
        >
          <TouchableOpacity
            style={styles.loginbutton}
            activeOpacity={0.7}
            onPress={handleAskAgain}
          >
            <AppButton
              title={"Ask Again"}
              colors={[Colors.primary, "#E9C39A", Colors.primary] as const}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              stopSpeech();
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
