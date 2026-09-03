import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlayerSide from "../components/PlayerSide";
import HistoryButton from "../components/HistoryButton";
import ResetConfirmBanner from "../components/ResetConfirmBanner";
import VoiceSession from "../components/VoiceSession";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { colors } from "../lib/theme";
import { useLifeCounterContext } from "../lib/LifeCounterContext";

// Estado de respaldo si el módulo de voz falla al montar: los totales de
// vida siguen viéndose y tocando la pantalla no hace nada (en vez de
// tumbar la app), con la misma leyenda de "sin escuchar" de siempre.
const BROKEN_VOICE = {
  isListening: false,
  toggle: () => {},
  pendingReset: false,
  confirmPendingReset: () => {},
  cancelPendingReset: () => {},
};

export default function MainScreen() {
  const { life, loseLife, gainLife, halveLife, undo, reset } =
    useLifeCounterContext();

  function renderScreen(voice) {
    return (
      <View style={styles.row}>
        <PlayerSide
          player="green"
          life={life.green}
          isListening={voice.isListening}
          onPress={voice.toggle}
        />
        <PlayerSide
          player="red"
          life={life.red}
          isListening={voice.isListening}
          onPress={voice.toggle}
        />
        <HistoryButton />
        <ResetConfirmBanner
          visible={voice.pendingReset}
          onConfirm={voice.confirmPendingReset}
          onCancel={voice.cancelPendingReset}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
      <ErrorBoundary fallback={() => renderScreen(BROKEN_VOICE)}>
        <VoiceSession
          loseLife={loseLife}
          gainLife={gainLife}
          halveLife={halveLife}
          undo={undo}
          reset={reset}
        >
          {(voice) => renderScreen(voice)}
        </VoiceSession>
      </ErrorBoundary>
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
