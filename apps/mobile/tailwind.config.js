/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Brand tokens shared with the web. When the web theme evolves
      // (`src/app/globals.css` for AryTrano), bump these to match —
      // we duplicate intentionally because the web uses OKLCH +
      // CSS variables (not supported in RN), so they can't share a
      // literal stylesheet.
      colors: {
        primary: {
          DEFAULT: '#191970',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f4f4f5',
          foreground: '#71717a',
        },
        border: '#e4e4e7',
        background: '#ffffff',
        foreground: '#0f172a',
      },
      fontFamily: {
        // No remote fonts in v1 — rely on the system serif/sans pair.
        // (Loading custom fonts via expo-font adds ~500KB to the
        // bundle and slows cold start on 3G.)
      },
    },
  },
  plugins: [],
}
