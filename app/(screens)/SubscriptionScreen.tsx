import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

// Components
import ScreenWrapper from "@/components/Specific/ScreenWrapper";

// constants
import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/font";
import { fontSize } from "@/constants/fontUtils";
import icons from "@/constants/icons";

const SubscriptionScreen = () => {
  const router = useRouter();
  const plans = [
    {
      id: 1,
      name: "Basic Plan",
      price: "$0.00",
      description: "3 free questions/day",
      buttonText: "Free",
    },
    {
      id: 2,
      name: "Silver Plan",
      price: "$3.99",
      description: "Monthly limited access",
      buttonText: "Paid",
    },
    {
      id: 3,
      name: "Diamond Plan",
      price: "$9.99",
      description: "Yearly unlimited access",
      buttonText: "Paid",
    },
  ];
  return (
    <ScreenWrapper style={styles.customBackground}>
      <View
        style={{
          width: "90%",
          alignItems: "center",
          justifyContent: "center",
          marginTop: RFPercentage(1),
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/SettingsScreen")}
          style={{ position: "absolute", left: RFPercentage(1) }}
        >
          <Feather color={Colors.primary} size={40} name={"arrow-left"} />
        </TouchableOpacity>
      </View>
      <View style={styles.logocontainer}>
        <Image
          style={{ width: fontSize(100), height: fontSize(100) }}
          source={icons.logo}
        />
        <Text style={styles.HeadingText}>Subscriptions</Text>
      </View>

      {plans.map((plan) => (
        <View key={plan.id} style={styles.container}>
          <View>
            <Text style={styles.titleText}>{plan.name}</Text>
            <Text style={styles.priceText}>{plan.price}</Text>

            <View style={styles.dotContainer}>
              <View style={styles.dot} />
              <Text style={styles.subtitleText}>{plan.description}</Text>
            </View>

            <View style={styles.buttonContainer}>
              <Text style={[styles.subtitleText, { color: Colors.lightBlack }]}>
                {plan.buttonText}
              </Text>
            </View>
          </View>
          <Ionicons color={Colors.white} size={80} name={"diamond-outline"} />
        </View>
      ))}
    </ScreenWrapper>
  );
};

export default SubscriptionScreen;
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  customBackground: {
    justifyContent: "center",
    alignItems: "center",
  },
  HeadingText: {
    color: Colors.primary,
    fontFamily: FontFamily.Bold,
    fontSize: RFPercentage(3),
    marginTop: RFPercentage(1),
  },
  priceText: {
    color: Colors.white,
    fontFamily: FontFamily.Bold,
    fontSize: RFPercentage(4),
  },
  logocontainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: RFPercentage(1),
    height: RFPercentage(1),
    borderRadius: RFPercentage(1),
    backgroundColor: Colors.white,
    marginRight: RFPercentage(1),
  },
  dotContainer: {
    marginTop: RFPercentage(1),
    flexDirection: "row",
    alignItems: "center",
  },
  container: {
    width: "90%",
    padding: RFPercentage(2),
    borderRadius: RFPercentage(2),
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: RFPercentage(2),
    paddingHorizontal: RFPercentage(3),
    flexDirection: "row",
    backgroundColor: Colors.primary,
  },
  titleText: {
    color: Colors.lightBlack,
    fontFamily: FontFamily.Bold,
    fontSize: RFPercentage(2),
  },
  subtitleText: {
    color: Colors.white,
    fontFamily: FontFamily.Regular,
    fontSize: RFPercentage(1.5),
  },
  buttonContainer: {
    paddingHorizontal: RFPercentage(1),
    paddingVertical: RFPercentage(0.5),
    backgroundColor: Colors.white,
    marginTop: RFPercentage(2),
    borderRadius: RFPercentage(1),
    justifyContent: "center",
    alignItems: "center",
  },
});
