import { Feather, FontAwesome } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// componenets
import ScreenWrapper from "@/components/Specific/ScreenWrapper";
import { ThemedText } from "@/components/ThemedText";
import { RFPercentage } from "react-native-responsive-fontsize";

// hooks
import { useAudio } from "@/providers/AudioProvider";
import {
  getAuth,
  getFreeCount,
  incrementFreeCount,
} from "@/providers/authStorage";

import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/font";
import icons from "@/constants/icons";

const OPENAI_API_KEY =
  "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";

const AskMirrorScreen = () => {
  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(3); // FREE_LIMIT
  const [question, setQuestion] = useState(""); // ✅ State for input
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // 🔄 To track when transcription is in progress
  // 🔹 Load Remaining Free Questions
  useEffect(() => {
    const init = async () => {
      const authData = await getAuth();
      if (!authData.token || !authData.uid) {
        console.log("❌ No token found — redirecting to login");
        // redirect to login if not logged in
        router.replace("/LoginScreen");
        return;
      }

      console.log("✅ Token found:", authData.token);
      console.log("👤 UID:", authData.uid);
      setToken(authData.token);
      setUid(authData.uid);

      const usedCount = await getFreeCount();
      setRemaining(3 - usedCount); // 10 is FREE_LIMIT
    };
    init();
  }, []);

  const [selectedLanguage, setSelectedLanguage] = useState<
    "en" | "hi" | "ja" | "bn" | "ur" | "es" | "zh" | "fr" | "ar" | "pa"
  >("en");

  const { playLoopingMusic, stopMusic } = useAudio();

  useFocusEffect(
    React.useCallback(() => {
      playLoopingMusic(); // 🔊 start music when HomeScreen is focused
      return () => {};
    }, [])
  );
  useEffect(() => {
    (async () => {
      const status = await Audio.getPermissionsAsync();
      console.log("Current mic permission:", status);
    })();
  }, []);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return alert("Microphone permission required!");

      stopMusic(); // 👈 Stop background music

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };
  /** Stop recording */
  const stopRecording = async () => {
    try {
      if (!recording) return;
      setIsProcessing(true); // Start processing
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      playLoopingMusic(); // 👈 Resume background music

      const formData = new FormData();
      formData.append("file", {
        uri: uri!,
        type: "audio/m4a",
        name: "recording.m4a",
      } as any);
      formData.append("model", "whisper-1");

      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      const transcribed = data.text;
      setQuestion(transcribed);

      // handleSend(transcribed);
    } catch (err) {
      console.error("Whisper error:", err);
      alert("Transcription failed.");
    } finally {
      setIsProcessing(false); // End processing
    }
  };

  useEffect(() => {
    return () => {
      if (recording) {
        try {
          recording.stopAndUnloadAsync();
        } catch (e) {
          console.warn("Recording cleanup error", e);
        }
      }
    };
  }, [recording]);

  const handleSend = async (textToSend?: string) => {
    if (isSending) return; // ⛔ prevent multiple clicks
    const input = textToSend || question;
    if (!input.trim()) return;
    // 🔸 Check if free limit reached
    if (!token || !uid) {
      router.replace("/LoginScreen");
      return;
    }

    const usedCount = await getFreeCount();
    if (usedCount >= 3) {
      router.push("/SubscriptionScreen");
      return;
    }

    // increment usage
    const newCount = await incrementFreeCount();
    setRemaining(3 - newCount);
    setIsSending(true); // 🟢 lock
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are a mystical fortune teller. Your responses are poetic, eerie, and mysterious. Always speak in short, cryptic rhymes. Respond only in ${
                  selectedLanguage === "en"
                    ? "English"
                    : selectedLanguage === "hi"
                    ? "Hindi"
                    : selectedLanguage === "ja"
                    ? "Japanese"
                    : selectedLanguage === "bn"
                    ? "Bengali"
                    : selectedLanguage === "ur"
                    ? "Urdu"
                    : selectedLanguage === "es"
                    ? "Spanish"
                    : selectedLanguage === "zh"
                    ? "Chinese"
                    : selectedLanguage === "fr"
                    ? "French"
                    : selectedLanguage === "ar"
                    ? "Arabic"
                    : selectedLanguage === "pa"
                    ? "Punjabi"
                    : "English"
                }. After the response, on a new line, write the emotion clearly in the format: <emotion: happy> or <emotion: sad>. Valid emotions: happy, sad, angry, surprise, neutral.`,
              },
              {
                role: "user",
                content: input,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.choices?.[0]?.message?.content) {
        const fullContent = data.choices[0].message.content;

        // ✅ Extract the emotion from "<emotion: ...>"
        const match = fullContent.match(/<emotion:\s*(.*?)>/i);
        const emotion = match?.[1]?.trim().toLowerCase();

        // ✅ Extract poetic response without the <emotion> tag
        const answer = fullContent.replace(/<emotion:\s*.*?>/i, "").trim();

        const validEmotions = ["happy", "sad", "angry", "surprise", "neutral"];
        const emotionLabel = validEmotions.includes(emotion)
          ? emotion
          : "neutral";

        stopMusic(); // 👈 Stop background music
        router.push({
          pathname: "/ResponseScreen",
          params: {
            answer,
            selectedLanguage,
            emotion: emotionLabel,
          },
        }); // Pass language too
      } else {
        console.error("GPT Error:", data);
        alert("Something went wrong. Try again.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Network error.");
    } finally {
      setIsSending(false); // 🔓 unlock
    }
  };

  return (
    <ScreenWrapper style={{ alignItems: "center" }}>
      <View
        style={{
          width: "90%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: RFPercentage(5),
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/HomeScreen")}
          style={{ position: "absolute", left: RFPercentage(1) }}
        >
          <Feather color={Colors.primary} size={40} name={"arrow-left"} />
        </TouchableOpacity>
        <ThemedText type="title">Magic Mirror</ThemedText>
      </View>

      <ImageBackground source={icons.roll} style={styles.background}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              width: "85%",
              height: "100%",
              padding: RFPercentage(3),
              paddingVertical: RFPercentage(10),

              alignItems: "center",
            }}
          >
            <ThemedText
              type="default"
              style={{
                fontSize: RFPercentage(3),
                textAlign: "center",
                marginTop: RFPercentage(3),
              }}
            >
              What would you ask the mirror?
            </ThemedText>

            <View
              style={{
                width: "100%",
                marginTop: RFPercentage(3),
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TextInput
                placeholder="Type your question"
                value={question}
                onChangeText={setQuestion}
                style={styles.input}
                placeholderTextColor="#aaa"
                multiline={true} // 👈 enable multiline
                textAlignVertical="top" // 👈 start text at the top-left
              />
            </View>

            {/* speak button */}
            <TouchableOpacity
              onPressIn={startRecording}
              onPressOut={stopRecording}
              style={styles.loginbutton}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[Colors.primary, "#E9C39A", Colors.primary] as const}
                start={{ x: 0.5, y: 0 }} // top-center
                end={{ x: 0.5, y: 1 }} // bottom-center
                style={styles.button}
              >
                <ThemedText type="button" style={{ fontSize: RFPercentage(2) }}>
                  {isRecording ? "Listening..." : "Hold to Speak to the Mirror"}
                </ThemedText>
                <FontAwesome
                  color={Colors.blacky}
                  size={20}
                  name={"microphone"}
                  style={{ marginLeft: RFPercentage(1) }}
                />
              </LinearGradient>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 10,
                marginTop: RFPercentage(4),
              }}
            >
              {[
                { label: "English", code: "en" },
                { label: "Hindi", code: "hi" },
                { label: "Japanese", code: "ja" },
                { label: "Bengali", code: "bn" },
                { label: "Urdu", code: "ur" },
                { label: "Spanish", code: "es" },
                { label: "Chinese", code: "zh" },
                { label: "French", code: "fr" },
                { label: "Arabic", code: "ar" },
                { label: "Punjabi", code: "pa" },
              ].map(({ label, code }) => (
                <TouchableOpacity
                  key={code}
                  onPress={() => setSelectedLanguage(code as any)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor:
                      selectedLanguage === code ? Colors.primary : "#ddd",
                  }}
                >
                  <ThemedText
                    type="default"
                    style={{
                      fontSize: RFPercentage(2),
                      color: selectedLanguage === code ? "white" : "black",
                    }}
                  >
                    {label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              disabled={
                isRecording || isProcessing || !question.trim() || isSending
              }
              onPress={() => handleSend()}
              style={[
                styles.loginbutton,
                { opacity: isRecording || isProcessing ? 0.5 : 1 },
              ]}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[Colors.purple, "#DB90DD", Colors.purple] as const}
                start={{ x: 0.5, y: 0 }} // top-center
                end={{ x: 0.5, y: 1 }} // bottom-center
                style={styles.button}
              >
                <ThemedText type="button">
                  {isSending ? "Sending..." : "Send"}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

            {/* Remaining Free Questions */}
            <View style={{ marginTop: 15, alignItems: "center" }}>
              <ThemedText
                style={{
                  color: Colors.primary,
                  fontSize: 14,
                  fontFamily: FontFamily.Bold,
                }}
              >
                {remaining > 0
                  ? `${remaining} free questions left`
                  : "Free limit reached — upgrade to continue"}
              </ThemedText>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ImageBackground>
    </ScreenWrapper>
  );
};

export default AskMirrorScreen;
const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: "88%",
    marginTop: RFPercentage(2),
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 8,
    color: Colors.blacky,
    backgroundColor: Colors.white,
    maxHeight: RFPercentage(16),
  },
  button: {
    width: "95%",
    height: RFPercentage(5.7),
    borderRadius: RFPercentage(2),
    alignItems: "center",
    justifyContent: "center",
    marginTop: RFPercentage(2),
    flexDirection: "row",
  },
  buttontext: {
    color: Colors.white,
    fontSize: RFPercentage(2.2),
    fontFamily: FontFamily.Bold,
    marginBottom: RFPercentage(0.4),
  },

  loginbutton: {
    width: "95%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: RFPercentage(1),
  },
});
