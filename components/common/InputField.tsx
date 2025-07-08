import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  TextInput,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

//config
import Colors from "../config/Colors";
import { FontFamily } from "../config/font";

export default function InputField({ placeTitle, value, onChange }) {
  return (
    <View style={styles.emailmain}>
      <TextInput
        onChangeText={onChange}
        value={value}
        placeholder={placeTitle}
        placeholderTextColor={Colors.placeholder}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  emailmain: {
    width: "90%",
    height: RFPercentage(6.5),
    backgroundColor: Colors.white,
    borderWidth: RFPercentage(0.1),
    borderRadius: RFPercentage(1),
    borderColor: Colors.primary,
    color: Colors.blacky,
    paddingHorizontal: RFPercentage(1.5),
    justifyContent: "center",
    marginTop: RFPercentage(1),
  },
  input: { fontFamily: FontFamily.regular },
});
