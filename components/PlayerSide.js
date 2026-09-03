import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../lib/theme";

const SIDE_COLORS = {
  green: { bg: colors.green },
  red: { bg: colors.red },
};

/**
 * Media pantalla de un jugador. Toda la mitad es tocable: tocarla
 * enciende o apaga el micrófono (mismo estado global para ambos lados).
 * Debajo del número siempre hay una leyenda que dice si está escuchando
 * o no — así no hace falta ningún botón de micrófono aparte.
 *
 * rotate180 se usa para el lado que debe leerse "boca abajo" desde el
 * otro extremo de la mesa (patrón típico en apps de vida para juegos de
 * mesa a dos jugadores enfrentados).
 */
export default function PlayerSide({
  player,
  life,
  isListening,
  onPress,
  errorMessage,
  rotate180 = false,
}) {
  const palette = SIDE_COLORS[player];
  const label = player === "green" ? "Verde" : "Rojo";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        isListening ? "Detener escucha de voz" : "Activar escucha de voz"
      }
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: palette.bg },
        rotate180 && styles.rotated,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.totalWrap}>
        <Text
          style={styles.total}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.05}
          allowFontScaling={false}
        >
          {life}
        </Text>
      </View>
      <View style={styles.captionRow}>
        <Text style={[styles.caption, isListening && styles.captionActive]}>
          {isListening ? "Escuchando" : "Micrófono sin escuchar"}
        </Text>
        <Text style={[styles.captionIcon, isListening && styles.captionActive]}>
          🎙
        </Text>
      </View>
      {errorMessage ? (
        // DIAGNÓSTICO TEMPORAL: sin límite de líneas para poder leer el
        // stack trace completo. Volver a numberOfLines={2} después.
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  rotated: {
    transform: [{ rotate: "180deg" }],
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    ...typography.label,
    color: colors.textOnColor,
  },
  totalWrap: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  total: {
    ...typography.lifeTotal,
    color: colors.textOnColor,
    width: "100%",
    textAlign: "center",
  },
  captionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  caption: {
    color: "rgba(245,247,250,0.6)",
    fontSize: 13,
    fontWeight: "600",
  },
  captionIcon: {
    fontSize: 14,
    opacity: 0.6,
  },
  captionActive: {
    color: colors.textOnColor,
    opacity: 1,
  },
  errorText: {
    color: "rgba(20,10,10,0.85)",
    backgroundColor: "rgba(255,255,255,0.35)",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: "85%",
  },
});
