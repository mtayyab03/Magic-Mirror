import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useIAP, type Purchase } from "react-native-iap";
import { RFPercentage } from "react-native-responsive-fontsize";

// Components
import ScreenWrapper from "@/components/Specific/ScreenWrapper";
import { saveSubscriptionStatus } from "@/providers/authStorage";

// constants
import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/font";
import { fontSize } from "@/constants/fontUtils";
import icons from "@/constants/icons";

const productSkus = ["basic_plan_id", "silver_plan_id"]; // your real SKUs
type Product = {
  title: string;
  description: string;
  price: string;
  localizedPrice: string;
  currency: string;
  productId: string; // iOS/Android product identifier
};

const SubscriptionScreen = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);

  const { connected, fetchProducts, requestPurchase, finishTransaction } =
    useIAP({
      onPurchaseError: (error) => {
        console.error("Purchase error", error);
        Alert.alert("Purchase failed", error.message);
      },
      onPurchaseSuccess: async (purchase: Purchase) => {
        const receipt =
          Platform.OS === "ios"
            ? (purchase as any).transactionReceipt
            : purchase.purchaseToken;

        if (!receipt) {
          Alert.alert("Error", "No receipt found");
          return;
        }

        try {
          await finishTransaction({ purchase, isConsumable: false });
          await saveSubscriptionStatus(true);
          Alert.alert("Success", "Subscription activated!");
          router.replace("/HomeScreen");
        } catch (err) {
          console.error("Finish transaction error:", err);
          Alert.alert("Error", "Failed to finalize purchase");
        }
      },
    });

  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: productSkus, type: "subs" }).then((items) => {
        setProducts(items ?? []);
      });
    }
  }, [connected]);

  const plans = [
    {
      id: 1,
      name: "Basic Plan",
      price: "$0.00",
      description: "3 free questions/day",
      buttonText: "Free",
      isPaid: false,
    },
    {
      id: 2,
      name: "Silver Plan",
      price: "$3.99 / month",
      description: "Unlimited access",
      buttonText: "Subscribe",
      isPaid: true,
    },
  ];

  const handlePurchasePress = async (productId: string | undefined) => {
    if (!productId) {
      Alert.alert("Error", "Product ID not found");
      return;
    }

    try {
      const purchase = await requestPurchase(productId as any); // true auto-finishes iOS transaction
      console.log("Purchase requested:", purchase);
    } catch (err: any) {
      console.log("Purchase request error:", err);
      Alert.alert("Payment failed", err.message || "Try again.");
    }
  };

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

      {plans.map((plan) => {
        const product = products.find((p) =>
          (p as Product).productId.includes("silver")
        );
        handlePurchasePress((product as Product).productId);
        return (
          <View key={plan.id} style={styles.container}>
            <View>
              <Text style={styles.titleText}>{plan.name}</Text>
              <Text style={styles.priceText}>{plan.price}</Text>
              <View style={styles.dotContainer}>
                <View style={styles.dot} />
                <Text style={styles.subtitleText}>{plan.description}</Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (plan.isPaid) {
                    const product = products.find((p: any) =>
                      (p as any).productId?.includes("silver")
                    );
                    handlePurchasePress((product as any)?.productId);
                  } else {
                    router.replace("/HomeScreen");
                  }
                }}
                style={styles.buttonContainer}
              >
                <Text
                  style={[styles.subtitleText, { color: Colors.lightBlack }]}
                >
                  {plan.buttonText}
                </Text>
              </TouchableOpacity>
            </View>
            <Ionicons color={Colors.white} size={80} name={"diamond-outline"} />
          </View>
        );
      })}
    </ScreenWrapper>
  );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
  customBackground: { justifyContent: "center", alignItems: "center" },
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
  logocontainer: { alignItems: "center", justifyContent: "center" },
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
