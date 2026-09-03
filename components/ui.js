import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../lib/theme";

export function IconButton({ onPress, children, active, style, accessibilityLabel }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.iconButton,
        active && styles.iconButtonActive,
        pressed && styles.iconButtonPressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

export function Pill({ children, tone = "neutral" }) {
  return (
    <View style={[styles.pill, tone === "gain" && styles.pillGain, tone === "loss" && styles.pillLoss]}>
      <Text style={styles.pillText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.micIdle,
  },
  iconButtonActive: {
    backgroundColor: colors.micActive,
  },
  iconButtonPressed: {
    opacity: 0.8,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radii.pill,
    backgroundColor: colors.historyCard,
  },
  pillGain: {
    backgroundColor: "rgba(46,204,113,0.15)",
  },
  pillLoss: {
    backgroundColor: "rgba(231,76,60,0.15)",
  },
  pillText: {
    color: colors.textOnColor,
    fontSize: 12,
    fontWeight: "700",
  },
});
