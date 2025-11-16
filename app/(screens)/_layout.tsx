import { Stack } from "expo-router";

export default function ScreenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(screens)/SplashScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(screens)/HomeScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(screens)/AskMirrorScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(screens)/ResponseScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(screens)/SettingsScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(screens)/SignupScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(screens)/LoginScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(screens)/SubscriptionScreen"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
