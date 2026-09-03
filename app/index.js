import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlayerSide from "../components/PlayerSide";
import DividerBar from "../components/DividerBar";
import MicControl from "../components/MicControl";
import MicFallback from "../components/MicFallback";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { colors } from "../lib/theme";
import { useLifeCounterContext } from "../lib/LifeCounterContext";

export default function MainScreen() {
  const { life, loseLife, gainLife, halveLife, undo, reset } =
    useLifeCounterContext();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.row}>
        <PlayerSide player="green" life={life.green} />
        <PlayerSide player="red" life={life.red} />
        <DividerBar>
          <ErrorBoundary fallback={<MicFallback />}>
            <MicControl
              loseLife={loseLife}
              gainLife={gainLife}
              halveLife={halveLife}
              undo={undo}
              reset={reset}
            />
          </ErrorBoundary>
        </DividerBar>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
});
