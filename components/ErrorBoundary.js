import { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../lib/theme";

/**
 * Si algo dentro de `children` explota durante el render (por ejemplo, un
 * módulo nativo que no quedó bien enlazado en el build), esto evita que se
 * caiga toda la app. Solo se pierde esa parte de la pantalla, con un
 * mensaje explicando qué pasó.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.warn("ErrorBoundary capturó un error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultFallback />;
    }
    return this.props.children;
  }
}

function DefaultFallback() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Esta función no está disponible ahora mismo.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
    backgroundColor: colors.historyCard,
    borderRadius: radii.md,
  },
  text: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
});
