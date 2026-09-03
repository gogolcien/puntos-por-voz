import { FlatList, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../lib/theme";

function describeEntry(entry) {
  const playerLabel = entry.player === "green" ? "Verde" : "Rojo";

  switch (entry.type) {
    case "start":
      return { title: "Inicio de partida", detail: "Verde 8000 · Rojo 8000", tone: "neutral" };
    case "reset":
      return { title: "Reinicio", detail: "Verde 8000 · Rojo 8000", tone: "neutral" };
    case "undo":
      return { title: "Se deshizo el último cambio", detail: "", tone: "neutral" };
    case "loss":
      return {
        title: `${playerLabel} pierde ${entry.amount}`,
        detail: `${entry.before} → ${entry.after}`,
        tone: "loss",
      };
    case "gain":
      return {
        title: `${playerLabel} gana ${entry.amount}`,
        detail: `${entry.before} → ${entry.after}`,
        tone: "gain",
      };
    case "half":
      return {
        title: `${playerLabel}: mitad de vida`,
        detail: `${entry.before} → ${entry.after}`,
        tone: "loss",
      };
    default:
      return { title: "Cambio", detail: "", tone: "neutral" };
  }
}

function HistoryRow({ entry }) {
  const { title, detail, tone } = describeEntry(entry);
  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.title,
          tone === "gain" && styles.gain,
          tone === "loss" && styles.loss,
        ]}
      >
        {title}
      </Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

export default function HistoryList({ history }) {
  // Más reciente primero.
  const data = [...history].reverse();

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <HistoryRow entry={item} />}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
  },
  row: {
    backgroundColor: colors.historyCard,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  title: {
    ...typography.historyValue,
    color: colors.textOnColor,
  },
  detail: {
    marginTop: spacing.xs / 2,
    color: colors.textMuted,
    fontSize: 13,
  },
  gain: {
    color: colors.gainText,
  },
  loss: {
    color: colors.lossText,
  },
  separator: {
    height: spacing.sm,
  },
});
