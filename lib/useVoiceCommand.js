import { useCallback, useEffect, useRef, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { parseVoiceCommand } from "./voiceCommands";

const RESET_CONFIRM_WINDOW_MS = 6000;

/**
 * Conecta el botón de micrófono con el motor de reconocimiento de voz del
 * dispositivo (sin internet, requiresOnDeviceRecognition: true) y aplica
 * los comandos reconocidos sobre el contador de vida.
 *
 * "reiniciar" es de dos pasos: la primera vez que se detecta queda
 * pendiente de confirmación (pendingReset=true) y no borra nada todavía;
 * se ejecuta solo si se vuelve a decir "reiniciar" dentro de la ventana de
 * tiempo, o si el usuario confirma con confirmPendingReset(). Así una sola
 * palabra mal reconocida no reinicia la partida por accidente.
 */
export function useVoiceCommand({ loseLife, gainLife, halveLife, undo, reset }) {
  const [isListening, setIsListening] = useState(false);
  const [lastHeard, setLastHeard] = useState("");
  const [pendingReset, setPendingReset] = useState(false);
  const pendingPlayerRef = useRef(null);
  const resetTimeoutRef = useRef(null);

  const clearPendingReset = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    setPendingReset(false);
  }, []);

  const confirmPendingReset = useCallback(() => {
    clearPendingReset();
    reset();
  }, [clearPendingReset, reset]);

  const armPendingReset = useCallback(() => {
    setPendingReset(true);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => {
      setPendingReset(false);
      resetTimeoutRef.current = null;
    }, RESET_CONFIRM_WINDOW_MS);
  }, []);

  useSpeechRecognitionEvent("start", () => setIsListening(true));
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    pendingPlayerRef.current = null;
  });
  useSpeechRecognitionEvent("error", () => {
    setIsListening(false);
    pendingPlayerRef.current = null;
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript;
    if (!transcript || !event.isFinal) return;
    setLastHeard(transcript);

    const result = parseVoiceCommand(transcript, pendingPlayerRef.current);

    switch (result.type) {
      case "undo":
        clearPendingReset();
        undo();
        pendingPlayerRef.current = null;
        break;
      case "reset":
        pendingPlayerRef.current = null;
        if (pendingReset) {
          confirmPendingReset();
        } else {
          armPendingReset();
        }
        break;
      case "await_second_level":
        pendingPlayerRef.current = result.player;
        break;
      case "loss":
        loseLife(result.player, result.amount);
        pendingPlayerRef.current = null;
        break;
      case "gain":
        gainLife(result.player, result.amount);
        pendingPlayerRef.current = null;
        break;
      case "half":
        halveLife(result.player);
        pendingPlayerRef.current = null;
        break;
      default:
        // No reconocido: se mantiene el estado de "pendiente" tal cual,
        // por si el usuario simplemente titubeó.
        break;
    }
  });

  const start = useCallback(async () => {
    const permission =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) return;

    pendingPlayerRef.current = null;
    ExpoSpeechRecognitionModule.start({
      lang: "es-ES",
      interimResults: false,
      continuous: true,
      requiresOnDeviceRecognition: true, // fuerza reconocimiento offline
      addsPunctuation: false,
    });
  }, []);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  useEffect(() => {
    return () => {
      stop();
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, [stop]);

  return {
    isListening,
    lastHeard,
    toggle,
    pendingReset,
    confirmPendingReset,
    cancelPendingReset: clearPendingReset,
  };
}

