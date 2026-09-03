import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LifeCounterProvider } from "../lib/LifeCounterContext";
import { colors } from "../lib/theme";

export default function RootLayout() {
  return (
    <LifeCounterProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.historyBg },
          headerTintColor: colors.textOnColor,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="history"
          options={{ title: "Historial", presentation: "modal" }}
        />
      </Stack>
    </LifeCounterProvider>
  );
}
