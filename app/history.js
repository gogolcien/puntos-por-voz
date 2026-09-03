import { StyleSheet, View } from "react-native";
import HistoryList from "../components/HistoryList";
import { colors } from "../lib/theme";
import { useLifeCounterContext } from "../lib/LifeCounterContext";

export default function HistoryScreen() {
  const { history } = useLifeCounterContext();

  return (
    <View style={styles.container}>
      <HistoryList history={history} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.historyBg,
  },
});
