import { createContext, useContext } from "react";
import { useLifeCounter } from "./useLifeCounter";

const LifeCounterContext = createContext(null);

export function LifeCounterProvider({ children }) {
  const value = useLifeCounter();
  return (
    <LifeCounterContext.Provider value={value}>
      {children}
    </LifeCounterContext.Provider>
  );
}

export function useLifeCounterContext() {
  const ctx = useContext(LifeCounterContext);
  if (!ctx) {
    throw new Error(
      "useLifeCounterContext debe usarse dentro de <LifeCounterProvider>"
    );
  }
  return ctx;
}
