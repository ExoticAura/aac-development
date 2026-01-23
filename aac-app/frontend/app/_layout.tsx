import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "AAC Board" }} />
        <Stack.Screen name="student/board" options={{ title: "AAC Board" }} />
        <Stack.Screen name="teacher/packs" options={{ title: "Packs" }} />
        <Stack.Screen name="(auth)/login" options={{ title: "Login" }} />
        <Stack.Screen name="(auth)/signup" options={{ title: "Sign Up" }} />
      </Stack>
    </AuthProvider>
  );
}
