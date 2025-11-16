import { Fontisto, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import * as yup from "yup";

// Components
import AppButton from "@/components/common/AppButton";
import ScreenWrapper from "@/components/Specific/ScreenWrapper";

// firebase
import { auth } from "@/firebaseConfig";
import { saveAuth } from "@/providers/authStorage";
import { signInWithEmailAndPassword } from "firebase/auth";

// constants
import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/font";
import { fontSize } from "@/constants/fontUtils";
import icons from "@/constants/icons";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
}

export default function LoginScreen(props: LoginScreenProps) {
  const router = useRouter();
  const [eyeIcon, setEyeIcon] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Validation schema for email and password
  const validationSchema = yup.object().shape({
    email: yup.string().required().email().label("Email"),
    password: yup
      .string()
      .required()
      .min(8)
      .matches(/[A-Z]/, "Must contain at least one uppercase letter")
      .matches(/[a-z]/, "Must contain at least one lowercase letter")
      .matches(/[0-9]/, "Must contain at least one digit")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must contain at least one symbol")
      .label("Password"),
  });

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      const token = await userCredential.user.getIdToken();
      const uid = userCredential.user.uid;

      await saveAuth(token, uid); // 🔥 IMPORTANT

      router.replace("/(screens)/HomeScreen");
    } catch (error) {
      Alert.alert("Login Failed", "Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper style={styles.customBackground}>
      <View style={styles.logocontainer}>
        <Image
          style={{ width: fontSize(100), height: fontSize(100) }}
          source={icons.logo}
        />
        <Text
          style={{
            color: Colors.primary,
            fontFamily: FontFamily.Bold,
            fontSize: RFPercentage(3),
            marginTop: RFPercentage(1),
          }}
        >
          Magic Mirror
        </Text>
      </View>

      {/* login text */}
      <View style={{ marginTop: RFPercentage(5) }} />

      {/* //email input */}
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={handleLogin}
        validationSchema={validationSchema}
      >
        {({
          handleChange,
          handleSubmit,
          errors,
          setFieldTouched,
          touched,
          values,
        }) => (
          <>
            <View style={styles.inputmaincontainer}>
              <View style={styles.emailmain}>
                <Ionicons
                  color={Colors.primary}
                  style={{ marginRight: RFPercentage(2) }}
                  size={RFPercentage(3)}
                  name={"mail"}
                />
                <TextInput
                  style={styles.input}
                  keyboardType="email-address"
                  onChangeText={handleChange("email")}
                  onBlur={() => setFieldTouched("email")}
                  autoCapitalize="none"
                  value={values.email}
                  placeholder="Email Address"
                  placeholderTextColor={Colors.primary}
                />
              </View>
              {touched.email && errors.email && (
                <View style={{ width: "90%" }}>
                  <Text style={styles.error}>{errors.email}</Text>
                </View>
              )}
              <View style={{ marginTop: RFPercentage(2) }} />
              <View style={styles.emailmain}>
                <Fontisto
                  color={Colors.primary}
                  style={{ marginRight: RFPercentage(2) }}
                  size={RFPercentage(3)}
                  name={"locked"}
                />
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("password")}
                  onBlur={() => setFieldTouched("password")}
                  value={values.password}
                  placeholder="Password"
                  placeholderTextColor={Colors.primary}
                  secureTextEntry={!eyeIcon}
                />

                <TouchableOpacity
                  onPress={() => setEyeIcon(!eyeIcon)}
                  activeOpacity={0.7}
                  style={styles.eyeicon}
                >
                  <MaterialCommunityIcons
                    color={Colors.white}
                    style={{ right: RFPercentage(1) }}
                    size={RFPercentage(3)}
                    name={eyeIcon ? "eye-outline" : "eye-off-outline"}
                  />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password && (
                <View style={{ width: "90%" }}>
                  <Text style={styles.error}>{errors.password}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={() => handleSubmit()}
              style={styles.loginbutton}
              activeOpacity={0.7}
            >
              <AppButton
                title={"Login"}
                colors={[Colors.primary, "#E9C39A", Colors.primary] as const}
              />
            </TouchableOpacity>
          </>
        )}
      </Formik>

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          flex: 1,
          marginBottom: RFPercentage(12),
        }}
      >
        <Text
          style={{
            color: Colors.white,
            fontFamily: FontFamily.Regular,
            fontSize: RFPercentage(2.5),
          }}
        >
          Don’t have an account ?
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/SignupScreen")}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color: Colors.primary,
              fontFamily: FontFamily.Bold,
              fontSize: RFPercentage(2.5),
            }}
          >
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

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
  content: {
    alignItems: "center",
  },
  logocontainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: RFPercentage(5),
  },
  logo: {
    width: RFPercentage(15),
    height: RFPercentage(15),
  },
  inputmaincontainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: RFPercentage(1),
  },
  eyeicon: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: RFPercentage(1),
    width: RFPercentage(5),
    height: RFPercentage(5),
  },
  emailmain: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    height: RFPercentage(7),
    borderBottomWidth: RFPercentage(0.2),
    borderBottomColor: Colors.primary,
    color: Colors.blacky,
    paddingLeft: RFPercentage(1.5),
    borderRadius: RFPercentage(1),
  },
  input: {
    width: "70%",
    fontFamily: FontFamily.Regular,
    color: Colors.white,
    fontSize: RFPercentage(2),
  },

  error: {
    color: "#FF0000",
    fontSize: RFPercentage(1.3),
    marginTop: RFPercentage(0.5),
    fontFamily: FontFamily.Regular,
  },

  loginbutton: {
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: RFPercentage(4),
  },

  forgotPasswordButton: {
    marginTop: RFPercentage(2),
    position: "absolute",
    right: RFPercentage(2),
  },
  forgotPasswordText: {
    color: Colors.lightBlack,
    fontFamily: FontFamily.Regular,
    fontSize: RFPercentage(1.8),
  },
  buttontext: {
    color: Colors.white,
    fontSize: RFPercentage(1.8),
    fontFamily: FontFamily.Regular,
  },
  appfbgcontainer: {
    width: "49%",
    paddingVertical: RFPercentage(1.5),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: RFPercentage(0.1),
    borderColor: Colors.primary,
    borderRadius: RFPercentage(1),
  },
  socialmain: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fbglogo: {
    width: RFPercentage(3),
    height: RFPercentage(3),
  },
});
