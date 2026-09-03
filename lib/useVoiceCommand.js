import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { parseVoiceCommand } from "./voiceCommands";

const ERROR_MESSAGES = {
  "voz-no-disponible": "El módulo de voz no está disponible en este build.",
  "permiso-denegado": "Permiso de micrófono denegado.",
  "error-al-pedir-permiso": "No se pudo pedir el permiso de micrófono.",
  "error-al-iniciar": "No se pudo iniciar el micrófono.",
  "error-desconocido": "Error desconocido del micrófono.",
  "not-allowed": "Permiso de micrófono denegado.",
  "service-not-allowed": "El servicio de reconocimiento no está permitido.",
  "language-not-supported": "El idioma español no está disponible en este dispositivo.",
  "language-unavailable": "Descarga el paquete de voz en español sin conexión en Ajustes del sistema.",
  "audio-capture": "No se pudo capturar audio del micrófono.",
  network: "Este dispositivo requiere red para reconocer voz (no soporta modo offline).",
  busy: "El reconocedor de voz está ocupado.",
  "no-speech": "No se detectó voz.",
};

function describeVoiceError(code) {
  if (!code) return null;
  return ERROR_MESSAGES[code] ?? `Error de voz: ${code}`;
}

const RESET_CONFIRM_WINDOW_MS = 6000;

// Si el módulo nativo no cargó por algún motivo (falla de linking, versión
// incompatible del dispositivo, etc.), `ExpoSpeechRecognitionModule` puede
// llegar como `undefined`, o como un objeto "stub" al que le falta algún
// método (p. ej. `addListener`, que es justo lo que usa por dentro
// `useSpeechRecognitionEvent`). Cualquiera de los dos casos hacía que
// llamar a los hooks de evento reventara con "TypeError: undefined is not
// a function" al montar VoiceSession — por eso se comprueba también que
// `addListener` exista, no solo que el módulo exista.
const isVoiceModuleAvailable =
  Boolean(ExpoSpeechRecognitionModule) &&
  typeof ExpoSpeechRecognitionModule.addListener === "function";

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
  const [voiceError, setVoiceError] = useState(
    isVoiceModuleAvailable ? null : "voz-no-disponible"
  );
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

  // CORRECCIÓN: estos hooks de evento NO son no-op seguros si el módulo
  // nativo no quedó bien enlazado en el build — internamente llaman a un
  // método del módulo nativo (p. ej. addListener) que en ese caso resuelve
  // a `undefined`, y la llamada revienta con "TypeError: undefined is not
  // a function" apenas se monta VoiceSession, tumbando toda la pantalla
  // (capturado luego por el ErrorBoundary de app/index.js).
  //
  // `isVoiceModuleAvailable` es una constante calculada una sola vez, al
  // cargar el módulo — antes de que exista ningún componente — así que su
  // valor nunca cambia durante la vida de la app. Por eso es seguro
  // condicionar estas llamadas a hooks con ella: el orden de hooks se
  // mantiene idéntico en todos los renders de esta instancia, aunque el
  // linter de "rules of hooks" lo marque como sospechoso en general.
  if (isVoiceModuleAvailable) {
    useSpeechRecognitionEvent("start", () => {
      setIsListening(true);
      setVoiceError(null);
    });
    useSpeechRecognitionEvent("end", () => {
      setIsListening(false);
      pendingPlayerRef.current = null;
    });
    useSpeechRecognitionEvent("error", (event) => {
      setIsListening(false);
      pendingPlayerRef.current = null;
      setVoiceError(event?.error ?? "error-desconocido");
    });
  }

  if (isVoiceModuleAvailable) {
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
  }

  // Pide el permiso de micrófono apenas se monta la pantalla, sin esperar
  // a que el usuario toque nada. Si el sistema ya lo tenía concedido, esto
  // no muestra ningún diálogo (los permisos ya otorgados se resuelven al
  // instante). Si falla por cualquier motivo, queda registrado en
  // voiceError para poder mostrarlo en pantalla.
  useEffect(() => {
    if (!isVoiceModuleAvailable) return;
    (async () => {
      try {
        const current = await ExpoSpeechRecognitionModule.getPermissionsAsync();
        if (!current.granted) {
          const requested =
            await ExpoSpeechRecognitionModule.requestPermissionsAsync();
          if (!requested.granted) {
            setVoiceError("permiso-denegado");
          }
        }
      } catch (err) {
        setVoiceError(err?.message ?? "error-al-pedir-permiso");
      }
    })();
  }, []);

  const start = useCallback(async () => {
    if (!isVoiceModuleAvailable) return;
    setVoiceError(null);
    try {
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setVoiceError("permiso-denegado");
        return;
      }

      pendingPlayerRef.current = null;
      ExpoSpeechRecognitionModule.start({
        lang: "es-ES",
        interimResults: false,
        continuous: true,
        requiresOnDeviceRecognition: true, // fuerza reconocimiento offline
        addsPunctuation: false,
      });
    } catch (err) {
      // Nunca dejar que un fallo al iniciar el reconocimiento tumbe la app.
      setVoiceError(err?.message ?? "error-al-iniciar");
    }
  }, []);

  const stop = useCallback(() => {
    if (!isVoiceModuleAvailable) return;
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // ignorar: ya se está deteniendo o el módulo no está disponible.
    }
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

  // Corta el micrófono de forma explícita al pasar a segundo plano, en vez
  // de depender de que el sistema operativo lo haga por su cuenta. Cubre
  // "inactive" (p. ej. al recibir una llamada en iOS) y "background" por
  // igual.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") {
        stop();
      }
    });
    return () => subscription.remove();
  }, [stop]);

  return {
    isListening,
    lastHeard,
    toggle,
    pendingReset,
    confirmPendingReset,
    cancelPendingReset: clearPendingReset,
    isVoiceAvailable: isVoiceModuleAvailable,
    voiceError,
    voiceErrorMessage: describeVoiceError(voiceError),
  };
}
