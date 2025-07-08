import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnabledMusic, setIsEnabledMusic] = useState(true);
  const [menuid, setmenuid] = useState(1);
  const selectTime = [
    {
      id: 1,
      name: "Mystic",
    },
    {
      id: 2,
      name: "Dark",
    },
    {
      id: 3,
      name: "Humorous",
    },
  ];

  return (
    <ScreenWrapper style={{ alignItems: "center" }}>
      <ThemedText type="title" style={{ marginTop: 10 }}>
        Settings
      </ThemedText>

      <ImageBackground source={icons.roll} style={styles.background}>
        <View
          style={{
            width: "100%",
            height: "100%",
            padding: RFPercentage(3),
            paddingVertical: RFPercentage(10),
            alignItems: "center",
          }}
        >
          <View style={styles.row}>
            <ThemedText type="default">Voice toggle</ThemedText>

            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: "#767577", true: Colors.purple }}
              thumbColor={isEnabled ? Colors.white : "#f4f3f4"}
            />
          </View>

          <View style={[styles.row, { marginTop: RFPercentage(4) }]}>
            <ThemedText type="default">BackgroundMusic toggle</ThemedText>

            <Switch
              value={isEnabledMusic}
              onValueChange={setIsEnabledMusic}
              trackColor={{ false: "#767577", true: Colors.purple }}
              thumbColor={isEnabledMusic ? Colors.white : "#f4f3f4"}
            />
          </View>

          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: RFPercentage(4),
            }}
          >
            <ThemedText type="default">Themes</ThemedText>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              {selectTime.map((item) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setmenuid(item.id)}
                  key={item.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: item.id === 3 ? 0 : RFPercentage(2),
                  }}
                >
                  <View
                    style={{
                      width: RFPercentage(1.7),
                      height: RFPercentage(1.7),
                      borderWidth: RFPercentage(0.2),
                      borderColor: Colors.blacky,
                      borderRadius: RFPercentage(3),
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {menuid === item.id ? (
                      <View
                        style={{
                          width: RFPercentage(1),
                          height: RFPercentage(1),
                          borderRadius: RFPercentage(3),
                          backgroundColor: Colors.blacky,
                        }}
                      />
                    ) : null}
                  </View>
                  <ThemedText
                    type="default"
                    style={{
                      fontSize: RFPercentage(1.8),
                      marginLeft: RFPercentage(0.7),
                    }}
                  >
                    {item.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
    width: "100%",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginTop: RFPercentage(5),
  },
  loginbutton: {
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: RFPercentage(1),
  },
});
