import React from "react";
import { ActivityIndicator, View } from "react-native";

//config
import { Colors } from "../../constants/Colors";

export default function AppLoading() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  );
}
