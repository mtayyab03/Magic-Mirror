import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import { Audio } from "expo-av";
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

import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/font";
import icons from "@/constants/icons";

const OPENAI_API_KEY =
  "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";

const AskMirrorScreen = () => {
  const [question, setQuestion] = useState(""); // ✅ State for input
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<
    "en" | "hi" | "ja" | "bn"
  >("en");

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return alert("Microphone permission required!");

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

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

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

      handleSend(transcribed);
    } catch (err) {
      console.error("Whisper error:", err);
      alert("Transcription failed.");
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
    const input = textToSend || question;
    if (!input.trim()) return;

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
                    : "Bengali"
                }.`,
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
        const answer = data.choices[0].message.content;
        router.push({
          pathname: "/ResponseScreen",
          params: { answer, selectedLanguage },
        }); // Pass language too
      } else {
        console.error("GPT Error:", data);
        alert("Something went wrong. Try again.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Network error.");
    }
  };

  return (
    <ScreenWrapper style={{ alignItems: "center" }}>
      <ThemedText type="title" style={{ marginTop: RFPercentage(5) }}>
        Magic Mirror
      </ThemedText>

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
                <ThemedText type="button">
                  {" "}
                  {isRecording ? "Listening..." : "Speak to the Mirror"}
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
                gap: 10,
                marginTop: RFPercentage(4),
              }}
            >
              {[
                { label: "English", code: "en" },
                { label: "Hindi", code: "hi" },
                { label: "Japanese", code: "ja" },
                { label: "Bangali", code: "bn" },
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
              onPress={() => handleSend()}
              style={styles.loginbutton}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[Colors.purple, "#DB90DD", Colors.purple] as const}
                start={{ x: 0.5, y: 0 }} // top-center
                end={{ x: 0.5, y: 1 }} // bottom-center
                style={styles.button}
              >
                <ThemedText type="button">Send</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
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
    height: "78%",
    marginTop: RFPercentage(4),
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
