import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native"; // ✅ Lottie import
import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
  Animated,
  AppState,
  Easing,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
// componenets
import { ThemedText } from "@/components/ThemedText";
import AppButton from "@/components/common/AppButton";
import AppModal from "@/components/common/AppModal";
// constants
import { FontFamily } from "@/constants/font";
import { Buffer } from "buffer";
import { RFPercentage } from "react-native-responsive-fontsize";
import { Colors } from "../../constants/Colors";
global.Buffer = global.Buffer || Buffer;

const ELEVENLABS_API_KEY =
  "sk_a54c3ecf393a06eb066abc38d177bbaa47899466f4c0aa95";
const OPENAI_API_KEY =
  "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";

const FREE_LIMIT = 10;

const incrementFreeCount = async () => {
  const count = parseInt((await AsyncStorage.getItem("freeCount")) || "0");
  const newCount = count + 1;
  await AsyncStorage.setItem("freeCount", newCount.toString());
  return newCount;
};

const getFreeCount = async () => {
  return parseInt((await AsyncStorage.getItem("freeCount")) || "0");
};

const ResponseScreen = () => {
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(FREE_LIMIT);
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef<LottieView>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState("");
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

  const reportReasons = [
    "Hate / Harassment",
    "Sexual Content",
    "Violence / Self-harm",
    "Illegal / Dangerous",
    "Spam / Scam",
    "Other (please describe)",
  ];
  useEffect(() => {
    const fetchCount = async () => {
      const used = await getFreeCount();
      setRemaining(FREE_LIMIT - used);
    };
    fetchCount();
  }, []);

  const handleSend = async () => {
    if (!selectedReason) {
      alert("Please select a reason");
      return;
    }

    try {
      setSelectedReason(null);
      setDescription("");
      setIsModalVisible(false);

      if (Platform.OS === "android") {
        ToastAndroid.show("Thanks—your report was sent.", ToastAndroid.SHORT);
      } else {
        Alert.alert("Report Submitted", "Thanks—your report was sent.");
      }
    } catch (err: any) {
      console.error("sendReportEmail error:", JSON.stringify(err, null, 2));
      console.error("Raw error:", err);

      Alert.alert(
        "Error",
        err.message || "Failed to send report. Please try again."
      );
    }
  };

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
  const [continueModal, setContinueModal] = useState(false);

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

  const playResponse = async (text: string, lang: string) => {
    try {
      await stopSpeech();
      setDisplayedText("");

      const words = text.trim().split(/\s+/);
      const VOICE_ID = getVoiceId(lang);

      // Start animation
      lottieRef.current?.reset();
      lottieRef.current?.play();
      setIsPlaying(true);

      // Typing effect
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index < words.length) {
          setDisplayedText((prev) => prev + words[index++] + " ");
        } else {
          clearInterval(typingInterval);
        }
      }, 400);

      // Fetch TTS audio
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
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
        console.error("TTS failed:", await res.text());
        throw new Error("TTS failed");
      }

      const arrayBuffer = await res.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString("base64");
      const fileUri = FileSystem.documentDirectory + `tts-${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      soundRef.current = sound;

      await sound.setRateAsync(0.9, true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if ("didJustFinish" in status && status.didJustFinish) {
          lottieRef.current?.pause();
          setIsPlaying(false);
          setTimeout(() => setContinueModal(true), 1000);
        }
      });

      await sound.playAsync();
    } catch (err) {
      console.error("playResponse error:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (answer && typeof answer === "string") {
        playResponse(answer, selectedLanguage);
      }
      return stopSpeech;
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
  const handleYes = async () => {
    const used = await getFreeCount();

    // 🟡 Check limit
    if (used >= FREE_LIMIT) {
      Alert.alert(
        "Limit Reached",
        "You’ve used your 3 free questions. Subscribe to reveal more mysteries.",
        [
          // { text: "Buy one", onPress: () => purchaseOneQuestion() },
          { text: "Buy one", onPress: () => setContinueModal(false) },
          { text: "Not Now", onPress: () => setContinueModal(false) },
          {
            text: "Subscribe",
            onPress: () => {
              setContinueModal(false); // 👈 close modal first
              router.push("/SubscriptionScreen");
            },
          },
        ]
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are a mystical fortune teller. Continue your previous prophecy in the same tone. Respond briefly in ${selectedLanguage}. After the response, write emotion as <emotion: happy/sad/...>.`,
              },
              { role: "user", content: "Yes, tell me more." },
            ],
          }),
        }
      );

      const data = await response.json();
      const newText = data.choices?.[0]?.message?.content || "";

      // ✅ Increment usage count
      const newCount = await incrementFreeCount();
      setRemaining(FREE_LIMIT - newCount);

      // ✅ Stop any old playback
      await stopSpeech();
      setDisplayedText("");

      // ✅ Update text after small delay
      setTimeout(() => {
        setDisplayedText(newText);
        setContinueModal(false);
        playResponse(newText, selectedLanguage);
      }, 400);
    } catch (err) {
      console.error("Continuation error:", err);
      Alert.alert("Error", "Could not continue the prophecy.");
    } finally {
      setLoading(false);
    }
  };

  const handleNo = async () => {
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
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            style={styles.loginbutton}
            activeOpacity={0.7}
          >
            <AppButton
              title={"Report"}
              colors={[Colors.primary, "#E9C39A", Colors.primary] as const}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <AppModal
        modalVisible={isModalVisible}
        setModalVisible={setIsModalVisible}
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
        RecStyle={{ width: "75%", marginBottom: RFPercentage(6) }}
      >
        {/* Reasons */}
        {reportReasons.map((reason, index) => (
          <TouchableOpacity
            key={index}
            style={styles.reasonOption}
            onPress={() => setSelectedReason(reason)}
          >
            <View
              style={[
                styles.radioCircle,
                selectedReason === reason && styles.radioCircleSelected,
              ]}
            />
            <Text style={styles.reasonText}>{reason}</Text>
          </TouchableOpacity>
        ))}

        {/* Description */}
        <TextInput
          style={styles.input}
          placeholder="Add description (optional)"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.sendBtn]}
            onPress={handleSend}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </AppModal>

      <AppModal
        modalVisible={continueModal}
        setModalVisible={setContinueModal}
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
        RecStyle={{
          width: "80%",
          marginBottom: RFPercentage(6),
          alignItems: "center",
          backgroundColor: Colors.primary,
        }}
      >
        <ThemedText
          type="default"
          style={{
            fontSize: RFPercentage(3),
            textAlign: "center",
            marginBottom: RFPercentage(2),
            color: Colors.white,
            fontFamily: FontFamily.Bold,
          }}
        >
          Would you like to know more?
        </ThemedText>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            marginTop: RFPercentage(1),
          }}
        >
          {/* YES */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleYes}
            style={{ opacity: loading ? 0.6 : 1, width: "45%" }}
            disabled={loading}
          >
            <AppButton
              title={loading ? "..." : "Yes"}
              colors={[Colors.purple, "#DB90DD", Colors.purple] as const}
            />
          </TouchableOpacity>

          {/* NO */}
          <TouchableOpacity
            style={{ opacity: loading ? 0.6 : 1, width: "45%" }}
            activeOpacity={0.8}
            onPress={handleNo}
          >
            <AppButton
              title={"No"}
              colors={[Colors.purple, "#DB90DD", Colors.purple] as const}
            />
          </TouchableOpacity>
        </View>
      </AppModal>
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
    width: "33%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: RFPercentage(1),
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: 10,
  },
  radioCircleSelected: {
    backgroundColor: Colors.primary,
  },
  reasonText: {
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    minHeight: 60,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  cancelBtn: {
    marginRight: 10,
    backgroundColor: "#eee",
  },
  sendBtn: {
    backgroundColor: Colors.primary,
  },
  cancelText: {
    color: "#333",
    fontWeight: "600",
  },
  sendText: {
    color: "#fff",
    fontWeight: "600",
  },
});
