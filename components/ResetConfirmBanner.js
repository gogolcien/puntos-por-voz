import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../lib/theme";

const WINDOW_MS = 6000;

/**
 * Se muestra cuando se detectó "reiniciar" por primera vez. Da al usuario
 * WINDOW_MS para confirmarlo (diciendo "reiniciar" de nuevo, o tocando el
 * botón) antes de que la solicitud expire sola. Pensado para que una sola
 * palabra mal reconocida no borre el marcador de la partida.
 */
export default function ResetConfirmBanner({ visible, onConfirm, onCancel }) {
  const [msLeft, setMsLeft] = useState(WINDOW_MS);

  useEffect(() => {
    if (!visible) return;
    setMsLeft(WINDOW_MS);
    const start = Date.now();
    const interval = setInterval(() => {
      const left = WINDOW_MS - (Date.now() - start);
      setMsLeft(Math.max(left, 0));
    }, 100);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  const secondsLeft = Math.ceil(msLeft / 1000);

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.card}>
        <Text style={styles.title}>¿Reiniciar a 8000 / 8000?</Text>
        <Text style={styles.subtitle}>
          Di "reiniciar" otra vez o toca para confirmar ({secondsLeft}s)
        </Text>
        <View style={styles.actions}>
          <Pressable
            onPress={onCancel}
            style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Cancelar reinicio"
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            style={({ pressed }) => [styles.button, styles.confirmButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Confirmar reinicio"
          >
            <Text style={styles.confirmText}>Reiniciar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: spacing.xl,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  card: {
    backgroundColor: colors.historyCard,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold,
    maxWidth: 320,
  },
  title: {
    color: colors.textOnColor,
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
  cancelButton: {
    backgroundColor: colors.panel2,
  },
  confirmButton: {
    backgroundColor: colors.gold,
  },
  pressed: {
    opacity: 0.8,
  },
  cancelText: {
    color: colors.textOnColor,
    fontWeight: "700",
    fontSize: 13,
  },
  confirmText: {
    color: colors.goldInk,
    fontWeight: "800",
    fontSize: 13,
  },
});
