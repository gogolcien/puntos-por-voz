import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../lib/theme";

/**
 * Se muestra en el lugar del botón de micrófono cuando ese módulo nativo
 * falló al inicializar. La app sigue funcionando (historial, totales),
 * solo se pierde el control por voz.
 */
export default function MicFallback() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎙</Text>
      <Text style={styles.text}>Voz no{"\n"}disponible</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 56,
    alignItems: "center",
    gap: spacing.xs / 2,
    marginBottom: spacing.xl,
    opacity: 0.5,
  },
  icon: {
    fontSize: 20,
  },
  text: {
    color: colors.textMuted,
    fontSize: 10,
    textAlign: "center",
  },
});
