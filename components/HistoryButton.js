import { StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { colors } from "../lib/theme";
import { IconButton } from "./ui";

export default function HistoryButton() {
  return (
    <IconButton
      onPress={() => router.push("/history")}
      accessibilityLabel="Ver historial"
      style={styles.button}
    >
      <Text style={styles.icon}>≡</Text>
    </IconButton>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 10,
    left: "50%",
    marginLeft: -28, // centra el botón de 56px de ancho
    zIndex: 10,
  },
  icon: {
    color: colors.textOnColor,
    fontSize: 20,
    fontWeight: "700",
  },
});
