import { Component } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "./theme";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Se ve en `adb logcat` incluso en build de release.
    console.error("ErrorBoundary capturó un error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Algo falló al abrir la app</Text>
            <Text style={styles.message}>
              {String(this.state.error?.message ?? this.state.error)}
            </Text>
            <Text style={styles.hint}>
              Copia este mensaje y compártelo para poder diagnosticarlo.
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  title: {
    color: colors.red,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.ink,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  hint: {
    color: colors.inkDim,
    fontSize: 12,
  },
});
