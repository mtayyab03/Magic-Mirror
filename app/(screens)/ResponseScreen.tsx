import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
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
import { Buffer } from "buffer";
import { RFPercentage } from "react-native-responsive-fontsize";
import { Colors } from "../../constants/Colors";
global.Buffer = global.Buffer || Buffer;

const ELEVENLABS_API_KEY =
  "sk_a54c3ecf393a06eb066abc38d177bbaa47899466f4c0aa95";
const ResponseScreen = () => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const {
    answer,
    selectedLanguage = "en",
    emotion = "neutral",
  } = useLocalSearchParams<{
    answer: string;
    selectedLanguage?:
      | "en"
      | "hi"
      | "ja"
      | "bn"
      | "ur"
      | "es"
      | "zh"
      | "fr"
      | "ar"
      | "pa";
    emotion?: "happy" | "sad" | "angry" | "surprise" | "neutral";
  }>();

  const getVoiceId = (lang: string) => {
    switch (lang) {
      case "hi":
        return "mHbDjPgC1xHlwoxsW9yF"; // Hindi-compatible
      case "ja":
        return "x6hhUN36w6T8JjJp0Y9e"; // Japanese-compatible
      case "bn":
        return "PU9whl7aa1ph79ofu6MV"; // Bengali-compatible
      case "ur":
        return "FXYvXDZrVAcrs9xrMNZ1";
      case "es":
        return "qtNhzqTIR7tmoc4jNJgI";
      case "zh":
        return "h3ZLQyTFFiBGIrQLSHFE";
      case "fr":
        return "0vQQ2Mf0iJdS4s7wdVEo";
      case "ar":
        return "pc5iVT2XrkXjKOUZTCtd";
      case "pa":
        return "wh7t8AeVMlcLNW4IQsyv";
      default:
        return "XCj6y0PF0QVxlEhv3Mzr"; // Dark, masculine
    }
  };

  const [displayedText, setDisplayedText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

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
        soundRef.current.setOnPlaybackStatusUpdate(null); // ✅ Clear callback
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
      const words = (answer || "").trim().split(/\s+/);
      const VOICE_ID = getVoiceId(selectedLanguage);

      const playResponse = async () => {
        if (!answer || typeof answer !== "string") return;
        try {
          await stopSpeech(); // Cleanup

          setDisplayedText(""); // Reset text

          // Start animation immediately
          lottieRef.current?.reset();
          lottieRef.current?.play();
          setIsPlaying(true);

          // Start typing effect immediately
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
          }, 400);

          // Now begin fetching ElevenLabs audio in background
          const res = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            {
              method: "POST",
              headers: {
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text: answer,
                voice_settings: {
                  stability: 0.1,
                  similarity_boost: 0.7,
                  style: 0.8,
                  use_speaker_boost: true,
                },
              }),
            }
          );

          if (!res.ok) {
            const errorText = await res.text();
            console.error("TTS failed:", res.status, errorText);
            throw new Error("TTS API call failed");
          }

          const arrayBuffer = await res.arrayBuffer();
          const base64Audio = Buffer.from(arrayBuffer).toString("base64");
          const fileUri =
            FileSystem.documentDirectory + `tts-${Date.now()}.mp3`;

          await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
            encoding: FileSystem.EncodingType.Base64,
          });

          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            playsInSilentModeIOS: true,
          });
          if (soundRef.current) {
            await stopSpeech(); // safety double check
          }

          const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
          soundRef.current = sound;

          await sound.setRateAsync(0.9, true); // Slower playback
          sound.setOnPlaybackStatusUpdate((status) => {
            if ("didJustFinish" in status && status.didJustFinish && isActive) {
              lottieRef.current?.pause(); // Stop animation when voice ends
              setIsPlaying(false);
            }
          });

          await sound.playAsync(); // Play voice
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
            source={
              emotion === "happy"
                ? require("../../assets/lotties/happy.json")
                : emotion === "sad"
                ? require("../../assets/lotties/sad.json")
                : emotion === "angry"
                ? require("../../assets/lotties/angry.json")
                : emotion === "surprise"
                ? require("../../assets/lotties/surprise.json")
                : require("../../assets/lotties/neutral.json")
            }
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
