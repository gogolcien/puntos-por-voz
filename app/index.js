import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlayerSide from "../components/PlayerSide";
import DividerBar from "../components/DividerBar";
import ResetConfirmBanner from "../components/ResetConfirmBanner";
import { colors } from "../lib/theme";
import { useLifeCounterContext } from "../lib/LifeCounterContext";
import { useVoiceCommand } from "../lib/useVoiceCommand";

export default function MainScreen() {
  const { life, loseLife, gainLife, halveLife, undo, reset } =
    useLifeCounterContext();

  const {
    isListening,
    lastHeard,
    toggle,
    pendingReset,
    confirmPendingReset,
    cancelPendingReset,
  } = useVoiceCommand({
    loseLife,
    gainLife,
    halveLife,
    undo,
    reset,
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.row}>
        <PlayerSide player="green" life={life.green} />
        <PlayerSide player="red" life={life.red} />
        <DividerBar
          isListening={isListening}
          onToggleMic={toggle}
          lastHeard={lastHeard}
        />
        <ResetConfirmBanner
          visible={pendingReset}
          onConfirm={confirmPendingReset}
          onCancel={cancelPendingReset}
        />
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
