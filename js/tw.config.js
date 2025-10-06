window.__TW_CONFIG_LOADED__ = true;

// js/tw.config.js
var tailwind = typeof tailwind !== "undefined" ? tailwind : {};
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "Apple Color Emoji",
          "Segoe UI Emoji",
        ],
      },
    },
  },
};
