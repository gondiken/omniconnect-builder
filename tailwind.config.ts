import { defineConfig } from "tailwindcss";
import daisyui from "daisyui";

export default defineConfig({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [daisyui],
  daisyui: {
    themes: ["light","cupcake"], // pick one you like
  },
});
