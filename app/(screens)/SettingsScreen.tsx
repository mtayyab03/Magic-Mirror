import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  Platform,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
// hooks
import { useAudio } from "@/providers/AudioProvider";

// componenets
import ScreenWrapper from "@/components/Specific/ScreenWrapper";
import { ThemedText } from "@/components/ThemedText";
import AppButton from "@/components/common/AppButton";

// constants
import { Colors } from "@/constants/Colors";
import icons from "@/constants/icons";
import { RFPercentage } from "react-native-responsive-fontsize";

const SettingsScreen = () => {
  const router = useRouter();
  const [isEnabledMusic, setIsEnabledMusic] = useState(true);
  const { width } = useWindowDimensions();

  // Decide width based on device size
  const containerWidth = width > 768 ? "90%" : "100%";

  const { playLoopingMusic, stopMusic, musicEnabled, setMusicEnabled } =
    useAudio();

  useFocusEffect(
    React.useCallback(() => {
      if (musicEnabled) {
        playLoopingMusic();
      }
    }, [musicEnabled]) // 👈 depends on toggle
  );

  return (
    <ScreenWrapper style={{ alignItems: "center" }}>
      <ThemedText
        type="title"
        style={{ marginTop: Platform.OS === "ios" ? 10 : RFPercentage(5) }}
      >
        Settings
      </ThemedText>

      <ImageBackground source={icons.roll} style={styles.background}>
        <View
          style={{
            width: containerWidth,
            height: "100%",
            padding: RFPercentage(3),
            paddingVertical: RFPercentage(10),
            alignItems: "center",
          }}
        >
          <View style={[styles.row, { marginTop: RFPercentage(4) }]}>
            <ThemedText type="default">BackgroundMusic toggle</ThemedText>
            <Switch
              value={musicEnabled}
              onValueChange={(val) => {
                setMusicEnabled(val);
                if (!val) stopMusic(); // Stop immediately if turning off
              }}
              trackColor={{ false: "#767577", true: Colors.purple }}
              thumbColor={musicEnabled ? Colors.white : "#f4f3f4"}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/SubscriptionScreen")}
            style={[styles.row, { marginTop: RFPercentage(3) }]}
          >
            <ThemedText type="default">Subscription</ThemedText>
            <MaterialIcons
              color={Colors.lightBlack}
              size={30}
              name={"arrow-forward-ios"}
            />
          </TouchableOpacity>

          {/* buttons */}
          <View style={{ marginTop: RFPercentage(5) }} />
          <TouchableOpacity style={styles.loginbutton} activeOpacity={0.7}>
            <AppButton
              title={"Export chat History"}
              colors={[Colors.primary, "#E9C39A", Colors.primary] as const}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginbutton}
            activeOpacity={0.7}
            onPress={() => router.push("/HomeScreen")}
          >
            <AppButton
              title={"Go to Home"}
              colors={[Colors.purple, "#DB90DD", Colors.purple] as const}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.loginbutton}
            activeOpacity={0.7}
            onPress={() => router.push("/LoginScreen")}
          >
            <AppButton
              title={"Logout"}
              colors={[Colors.white, Colors.white, Colors.white] as const}
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </ScreenWrapper>
  );
};

export default SettingsScreen;
const styles = StyleSheet.create({
  background: {
    width: "100%",
    height: "90%",
    marginTop: RFPercentage(2),
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    width: "95%",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginTop: RFPercentage(6),
    backgroundColor: "##E9C39A",
  },
  loginbutton: {
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: RFPercentage(1),
  },
});
