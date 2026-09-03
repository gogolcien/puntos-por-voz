import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../lib/theme";

const SIDE_COLORS = {
  green: { bg: colors.green, dark: colors.greenDark },
  red: { bg: colors.red, dark: colors.redDark },
};

/**
 * Media pantalla de un jugador. rotate180 se usa para el lado que debe
 * leerse "boca abajo" desde el otro extremo de la mesa (patrón típico en
 * apps de vida para juegos de mesa a dos jugadores enfrentados).
 */
export default function PlayerSide({ player, life, rotate180 = false }) {
  const palette = SIDE_COLORS[player];
  const label = player === "green" ? "Verde" : "Rojo";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.bg },
        rotate180 && styles.rotated,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.total} numberOfLines={1} adjustsFontSizeToFit>
        {life}
      </Text>
    </View>
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
  label: {
    ...typography.label,
    color: colors.textOnColor,
  },
  total: {
    ...typography.lifeTotal,
    color: colors.textOnColor,
  },
});
