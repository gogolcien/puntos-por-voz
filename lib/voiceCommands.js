// Parser puro de la gramática de comandos de voz.
// No toca el motor de reconocimiento: recibe texto ya transcrito y devuelve
// una acción interpretada. Esto permite probarlo sin micrófono real.

const PLAYER_WORDS = {
  verde: "green",
  rojo: "red",
};

const UNDO_WORDS = ["volver", "vuelve", "deshacer"];
const RESET_WORDS = ["reiniciar", "reinicia", "reset"];
const GAIN_WORDS = ["gana", "ganan", "gano", "ganó", "suma"];
const HALF_WORDS = ["mitad", "mitades"];

// Números hablados más comunes en el rango operativo (25 a 12000), por si el
// motor de voz no los convierte a dígitos. No pretende ser un parser
// numérico general, solo cubrir el vocabulario típico de una partida.
const UNIT_WORDS = {
  cero: 0, uno: 1, un: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, trece: 13, catorce: 14, quince: 15,
  veinte: 20, veinticinco: 25, treinta: 30, cuarenta: 40,
  cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
  cien: 100, ciento: 100, doscientos: 200, trescientos: 300,
  cuatrocientos: 400, quinientos: 500, seiscientos: 600,
  setecientos: 700, ochocientos: 800, novecientos: 900,
  mil: 1000,
};

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extrae el primer número (dígitos) presente en la lista de palabras.
 * Devuelve { amount, matchedWords } o null si no hay dígitos.
 */
function extractDigitAmount(words) {
  for (let i = 0; i < words.length; i++) {
    if (/^\d+$/.test(words[i])) {
      return { amount: parseInt(words[i], 10), index: i };
    }
  }
  return null;
}

/**
 * Fallback: intenta juntar palabras numéricas en español consecutivas
 * (ej. "mil ochocientos") en un solo número. Cobertura simple, suficiente
 * para el rango 25–12000 mencionado en el negocio.
 */
function extractWordAmount(words) {
  let total = 0;
  let found = false;
  let lastIndex = -1;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w in UNIT_WORDS) {
      found = true;
      lastIndex = i;
      const val = UNIT_WORDS[w];
      if (val === 1000 && total > 0) {
        total *= val;
      } else {
        total += val;
      }
    } else if (found) {
      // corta la racha de palabras numéricas al primer no-número
      break;
    }
  }
  return found ? { amount: total, index: lastIndex } : null;
}

function extractAmount(words) {
  return extractDigitAmount(words) || extractWordAmount(words);
}

/**
 * Interpreta una frase completa dicha en un solo tramo, ej:
 * "verde 500", "rojo gana 1000", "rojo mitad", "reiniciar", "volver".
 *
 * pendingPlayer: si el usuario ya dijo "rojo"/"verde" en una frase previa
 * y ahora dice solo el segundo nivel ("500", "gana 1000", "mitad"),
 * se pasa aquí para completar el comando.
 *
 * Devuelve una de:
 *  { type: "undo" }
 *  { type: "reset" }
 *  { type: "await_second_level", player }        // dijo solo rojo/verde
 *  { type: "loss", player, amount }
 *  { type: "gain", player, amount }
 *  { type: "half", player }
 *  { type: "unrecognized", raw }
 */
export function parseVoiceCommand(rawText, pendingPlayer = null) {
  const clean = normalize(rawText);
  const words = clean.split(" ").filter(Boolean);

  if (words.length === 0) {
    return { type: "unrecognized", raw: rawText };
  }

  if (UNDO_WORDS.includes(words[0])) {
    return { type: "undo" };
  }
  if (RESET_WORDS.includes(words[0])) {
    return { type: "reset" };
  }

  // Detecta jugador en cualquier punto de la frase (permite "verde 500" o,
  // si el motor antepone relleno, encontrarlo igual).
  let player = pendingPlayer;
  let playerWordIndex = -1;
  for (let i = 0; i < words.length; i++) {
    if (PLAYER_WORDS[words[i]]) {
      player = PLAYER_WORDS[words[i]];
      playerWordIndex = i;
      break;
    }
  }

  if (!player) {
    return { type: "unrecognized", raw: rawText };
  }

  const restWords =
    playerWordIndex >= 0 ? words.slice(playerWordIndex + 1) : words;

  if (restWords.length === 0) {
    // Solo dijo "rojo" o "verde": espera el segundo nivel en la próxima frase.
    return { type: "await_second_level", player };
  }

  if (restWords.some((w) => HALF_WORDS.includes(w))) {
    return { type: "half", player };
  }

  const isGain = restWords.some((w) => GAIN_WORDS.includes(w));
  const amountResult = extractAmount(restWords);

  if (!amountResult) {
    // Dijo "rojo gana" sin número todavía, o algo no reconocido.
    return { type: "await_second_level", player };
  }

  return isGain
    ? { type: "gain", player, amount: amountResult.amount }
    : { type: "loss", player, amount: amountResult.amount };
}
