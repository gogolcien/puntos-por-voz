import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../lib/theme";
import { IconButton } from "./ui";
import ResetConfirmBanner from "./ResetConfirmBanner";
import { useVoiceCommand } from "../lib/useVoiceCommand";

/**
 * El único componente que toca el módulo nativo de reconocimiento de voz.
 * Si ese módulo no está bien enlazado en el build, el error ocurre aquí —
 * y queda contenido por el ErrorBoundary que lo envuelve en app/index.js,
 * sin tumbar el resto de la app.
 */
export default function MicControl({ loseLife, gainLife, halveLife, undo, reset }) {
  const {
    isListening,
    lastHeard,
    toggle,
    pendingReset,
    confirmPendingReset,
    cancelPendingReset,
  } = useVoiceCommand({ loseLife, gainLife, halveLife, undo, reset });

  return (
    <>
      <IconButton
        onPress={toggle}
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

      <ResetConfirmBanner
        visible={pendingReset}
        onConfirm={confirmPendingReset}
        onCancel={cancelPendingReset}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
