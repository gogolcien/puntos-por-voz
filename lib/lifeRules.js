// Reglas de negocio puras (sin dependencias de UI ni de React Native).
// Se pueden probar de forma aislada.

export const START_LIFE = 8000;
export const MIN_LIFE = 0;
export const MAX_LIFE = 99975;

/**
 * Redondea un valor de puntos de vida al múltiplo de 25 más cercano hacia
 * arriba. Los valores del juego siempre terminan en 0, 25, 50 o 75, así que
 * cualquier resultado intermedio (por ejemplo al aplicar "mitad") se ajusta
 * a esa grilla.
 */
export function roundUpToStep(value, step = 25) {
  return Math.ceil(value / step) * step;
}

/** Limita un valor de vida al rango [MIN_LIFE, MAX_LIFE]. */
export function clampLife(value) {
  if (value < MIN_LIFE) return MIN_LIFE;
  if (value > MAX_LIFE) return MAX_LIFE;
  return value;
}

/** Resta puntos de vida, sin bajar de 0. */
export function applyLoss(current, amount) {
  return clampLife(current - Math.abs(amount));
}

/** Suma puntos de vida, sin pasar del máximo de 5 dígitos. */
export function applyGain(current, amount) {
  return clampLife(current + Math.abs(amount));
}

/**
 * Aplica "mitad": divide entre 2 y redondea hacia arriba al múltiplo de 25.
 * Si el valor actual es 1, se mantiene en 1 (piso especial pedido en el
 * negocio, por debajo del cual "mitad" ya no reduce más).
 */
export function applyHalf(current) {
  if (current <= 1) return 1;
  const half = current / 2;
  const rounded = roundUpToStep(half);
  return clampLife(Math.max(rounded, 1));
}

/** true si el valor ya respeta la grilla de 0/25/50/75. */
export function isValidStep(value) {
  return value % 25 === 0;
}
