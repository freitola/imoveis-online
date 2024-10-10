/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A', // Exemplo de cor customizada (azul escuro)
        secondary: '#F59E0B', // Exemplo de cor customizada (amarelo)
      },
    },
  },
  plugins: [],
};