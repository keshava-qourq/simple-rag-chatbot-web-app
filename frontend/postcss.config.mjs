// Tailwind 4 through PostCSS. The single-page app uses the Vite plugin instead;
// Next.js owns its own build, so the PostCSS entry point is the way in.
export default {
  plugins: { "@tailwindcss/postcss": {} },
};
