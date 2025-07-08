import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";

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

const AskMirrorScreen = () => {
  const [question, setQuestion] = useState(""); // ✅ State for input
  const router = useRouter();
  return (
    <ScreenWrapper style={{ alignItems: "center" }}>
      <ThemedText type="title" style={{ marginTop: 10 }}>
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
                width: "95%",
                marginTop: RFPercentage(5),
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

              <TouchableOpacity
                style={{
                  width: RFPercentage(4),
                  height: RFPercentage(4),
                  borderRadius: RFPercentage(3),
                  backgroundColor: Colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: RFPercentage(1),
                }}
              >
                <Ionicons color={Colors.white} size={20} name={"send"} />
              </TouchableOpacity>
            </View>

            {/* speak button */}
            <TouchableOpacity
              onPress={() => router.push("/ResponseScreen")}
              style={styles.loginbutton}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[Colors.primary, "#E9C39A", Colors.primary] as const}
                start={{ x: 0.5, y: 0 }} // top-center
                end={{ x: 0.5, y: 1 }} // bottom-center
                style={styles.button}
              >
                <ThemedText type="button">Speak to the Mirror</ThemedText>
                <FontAwesome
                  color={Colors.blacky}
                  size={20}
                  name={"microphone"}
                  style={{ marginLeft: RFPercentage(1) }}
                />
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
    width: "80%",
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
    marginTop: RFPercentage(3),
  },
});
