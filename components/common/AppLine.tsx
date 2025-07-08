import React from "react";
import { View } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

//config
import { Colors } from "../../constants/Colors";

export default function AppLine() {
  return (
    <View
      style={{
        width: "100%",
        height: RFPercentage(0.1),
        backgroundColor: Colors.white,
        borderRadius: RFPercentage(0.5),
      }}
    />
  );
}
