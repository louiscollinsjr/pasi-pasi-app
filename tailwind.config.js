/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"JetBrains Mono Variable"', 'monospace'],
        mono: ['"JetBrains Mono Variable"', 'monospace'],
        roboto: ['"Roboto Variable"', 'sans-serif'],
        lora: ['"Lora Variable"', 'sans-serif'],
        libreBaskerville: ['"Libre Baskerville"', 'sans-serif'],
        patrickHand: ['"Patrick Hand"', 'sans-serif'],
        patrickHandSc: ['"Patrick Hand SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
