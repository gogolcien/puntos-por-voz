import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { colors } from "../lib/theme";
import { IconButton } from "./ui";
import { Text } from "react-native";
import { spacing } from "../lib/theme";

/**
 * Barra central. El botón de historial se renderiza siempre (no depende de
 * ningún módulo nativo). El contenido de `children` es el bloque de
 * micrófono; se pasa desde afuera para poder envolverlo en un
 * ErrorBoundary sin que un fallo ahí se lleve también el botón de
 * historial.
 */
export default function DividerBar({ children }) {
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

      {children}
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
});
