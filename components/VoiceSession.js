import { useVoiceCommand } from "../lib/useVoiceCommand";

/**
 * El único componente que toca el módulo nativo de reconocimiento de voz.
 * Usa el patrón "render prop": expone { isListening, toggle, ... } a quien
 * lo envuelva, en vez de dibujar su propia UI. Así ambos lados de la
 * pantalla (verde y rojo) pueden compartir el mismo estado de escucha y
 * disparar el mismo toggle al tocar el número de vida.
 *
 * Si el módulo nativo falla al montar, el error ocurre aquí — y queda
 * contenido por el ErrorBoundary que lo envuelve en app/index.js, sin
 * tumbar el resto de la app.
 */
export default function VoiceSession({
  loseLife,
  gainLife,
  halveLife,
  undo,
  reset,
  children,
}) {
  const voice = useVoiceCommand({ loseLife, gainLife, halveLife, undo, reset });
  return children(voice);
}
