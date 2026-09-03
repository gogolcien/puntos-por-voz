import { useCallback, useMemo, useState } from "react";
import { START_LIFE, applyGain, applyLoss, applyHalf } from "./lifeRules";

let nextEntryId = 1;

/**
 * Estado en memoria (useState). Sobrevive mientras la app esté activa,
 * incluso en segundo plano (React Native conserva el estado JS al
 * suspender la app), y se pierde al cerrarla del todo — que es
 * exactamente el comportamiento de historial pedido.
 */
export function useLifeCounter() {
  const [life, setLife] = useState({ green: START_LIFE, red: START_LIFE });
  const [history, setHistory] = useState([
    { id: nextEntryId++, type: "start", green: START_LIFE, red: START_LIFE },
  ]);
  // Pila de snapshots previos, para poder deshacer con "volver".
  const [undoStack, setUndoStack] = useState([]);

  const pushHistory = useCallback((entry) => {
    setHistory((prev) => [...prev, { id: nextEntryId++, ...entry }]);
  }, []);

  const commit = useCallback(
    (player, nextValue, historyEntry) => {
      setLife((prev) => {
        setUndoStack((stack) => [...stack, prev]);
        return { ...prev, [player]: nextValue };
      });
      pushHistory(historyEntry);
    },
    [pushHistory]
  );

  const loseLife = useCallback(
    (player, amount) => {
      setLife((prev) => {
        const next = applyLoss(prev[player], amount);
        setUndoStack((stack) => [...stack, prev]);
        pushHistory({
          type: "loss",
          player,
          amount,
          before: prev[player],
          after: next,
        });
        return { ...prev, [player]: next };
      });
    },
    [pushHistory]
  );

  const gainLife = useCallback(
    (player, amount) => {
      setLife((prev) => {
        const next = applyGain(prev[player], amount);
        setUndoStack((stack) => [...stack, prev]);
        pushHistory({
          type: "gain",
          player,
          amount,
          before: prev[player],
          after: next,
        });
        return { ...prev, [player]: next };
      });
    },
    [pushHistory]
  );

  const halveLife = useCallback(
    (player) => {
      setLife((prev) => {
        const next = applyHalf(prev[player]);
        setUndoStack((stack) => [...stack, prev]);
        pushHistory({
          type: "half",
          player,
          before: prev[player],
          after: next,
        });
        return { ...prev, [player]: next };
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const prevSnapshot = stack[stack.length - 1];
      setLife(prevSnapshot);
      pushHistory({ type: "undo" });
      return stack.slice(0, -1);
    });
  }, [pushHistory]);

  const reset = useCallback(() => {
    setLife((prev) => {
      setUndoStack((stack) => [...stack, prev]);
      return { green: START_LIFE, red: START_LIFE };
    });
    pushHistory({ type: "reset" });
  }, [pushHistory]);

  const canUndo = undoStack.length > 0;

  return useMemo(
    () => ({ life, history, loseLife, gainLife, halveLife, undo, reset, canUndo }),
    [life, history, loseLife, gainLife, halveLife, undo, reset, canUndo]
  );
}
