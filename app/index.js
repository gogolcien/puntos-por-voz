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
//
// DIAGNÓSTICO TEMPORAL: en vez del mensaje genérico de siempre, mostramos
// el error real que atrapó el ErrorBoundary (nombre + mensaje + stack).
// Quitar este cambio una vez identificada la causa.
function brokenVoice(error) {
  const detail = error
    ? `${error.name ?? "Error"}: ${error.message ?? String(error)}\n${error.stack ?? "(sin stack)"}`
    : "sin detalle (error nulo)";
  return {
    isListening: false,
    toggle: () => {},
    pendingReset: false,
    confirmPendingReset: () => {},
    cancelPendingReset: () => {},
    voiceErrorMessage: `Voz no disponible — ${detail}`,
  };
}

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
          errorMessage={voice.voiceErrorMessage}
        />
        <PlayerSide
          player="red"
          life={life.red}
          isListening={voice.isListening}
          onPress={voice.toggle}
          errorMessage={voice.voiceErrorMessage}
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
      <ErrorBoundary fallback={(error) => renderScreen(brokenVoice(error))}>
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
