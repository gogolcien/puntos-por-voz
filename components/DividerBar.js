import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors, radii, spacing } from "../lib/theme";
import { IconButton } from "./ui";

export default function DividerBar({ isListening, onToggleMic, lastHeard }) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <IconButton
        onPress={() => router.push("/history")}
        accessibilityLabel="Ver historial"
        style={styles.historyButton}
      >
        <Text style={styles.historyIcon}>≡</Text>
      </IconButton>

      <View style={styles.spacer} />

      <IconButton
        onPress={onToggleMic}
        active={isListening}
        accessibilityLabel={
          isListening ? "Detener escucha de voz" : "Activar escucha de voz"
        }
        style={styles.micButton}
      >
        <Text style={[styles.micIcon, isListening && styles.micIconActive]}>
          {isListening ? "●" : "🎙"}
        </Text>
      </IconButton>

      {isListening && lastHeard ? (
        <View style={styles.transcriptBubble}>
          <Text style={styles.transcriptText} numberOfLines={1}>
            {lastHeard}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const BAR_WIDTH = 64;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    marginLeft: -BAR_WIDTH / 2,
    width: BAR_WIDTH,
    backgroundColor: colors.divider,
    alignItems: "center",
    paddingVertical: spacing.lg,
    justifyContent: "flex-start",
  },
  historyButton: {
    width: 44,
    height: 44,
  },
  historyIcon: {
    color: colors.textOnColor,
    fontSize: 22,
    fontWeight: "700",
  },
  spacer: {
    flex: 1,
  },
  micButton: {
    marginBottom: spacing.xl,
  },
  micIcon: {
    fontSize: 24,
    color: colors.micIcon,
  },
  micIconActive: {
    color: colors.redGlow,
  },
  transcriptBubble: {
    position: "absolute",
    bottom: spacing.xl + 72,
    width: 220,
    marginLeft: -78,
    backgroundColor: colors.historyCard,
    borderRadius: radii.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  transcriptText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
});
