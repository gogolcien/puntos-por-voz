// Mismos colores que public/styles.css de la web ("Ligas Tecnocentro"),
// para que la app se sienta como una continuación natural de esa estética.

export const colors = {
  bg: "#12151b",
  panel: "#181c24",
  panel2: "#1f242e",
  line: "#2a303c",
  ink: "#ece9e1",
  inkDim: "#9aa3b2",
  gold: "#d4a537",
  goldInk: "#1b1204",
  teal: "#4fb8a6",
  tealInk: "#082420",
  red: "#c1594f",
  green: "#5cb85c",
  blue: "#4f8fc1",

  // Alias semánticos usados por los componentes de la pantalla principal.
  background: "#12151b",
  divider: "#2a303c",

  greenDark: "#3d8a3d",
  greenGlow: "#5cb85c",

  redDark: "#8a3d35",
  redGlow: "#c1594f",

  textOnColor: "#ece9e1",
  textMuted: "rgba(236,233,225,0.72)",

  micIdle: "#1f242e",
  micActive: "#d4a537",
  micIcon: "#ece9e1",

  historyBg: "#181c24",
  historyCard: "#1f242e",
  gainText: "#5cb85c",
  lossText: "#c1594f",
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const radii = { sm: 6, md: 8, lg: 10, pill: 999, xl: 28 };

export const typography = {
  lifeTotal: {
    fontSize: 320,
    fontWeight: "800",
    letterSpacing: -4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  historyValue: {
    fontSize: 16,
    fontWeight: "700",
  },
};
