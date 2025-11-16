// src/utils/authStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "mm_auth_token";
const UID_KEY = "mm_user_uid";
const FREE_COUNT_KEY = "mm_free_count";
const SUB_KEY = "mm_is_subscribed"; // <-- NEW

export async function saveAuth(token: string, uid: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(UID_KEY, uid);
}

export async function getAuth() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const uid = await AsyncStorage.getItem(UID_KEY);
  return { token, uid };
}

export async function clearAuth() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(UID_KEY);
}

// ---- free questions counter helpers
export async function incrementFreeCount() {
  const raw = await AsyncStorage.getItem(FREE_COUNT_KEY);
  const count = parseInt(raw || "0", 10) || 0;
  const next = count + 1;
  await AsyncStorage.setItem(FREE_COUNT_KEY, next.toString());
  return next;
}

export async function getFreeCount() {
  return parseInt((await AsyncStorage.getItem(FREE_COUNT_KEY)) || "0", 10) || 0;
}

export async function resetFreeCount() {
  await AsyncStorage.setItem(FREE_COUNT_KEY, "0");
}

// ---------- SUBSCRIPTION HELPERS ----------
export async function saveSubscriptionStatus(value: boolean) {
  await AsyncStorage.setItem(SUB_KEY, value ? "1" : "0");
}

export async function getSubscriptionStatus() {
  return (await AsyncStorage.getItem(SUB_KEY)) === "1";
}

export async function clearSubscriptionStatus() {
  await AsyncStorage.removeItem(SUB_KEY);
}
