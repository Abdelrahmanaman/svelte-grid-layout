import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite-plus";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
  plugins: [tailwindcss(), sveltekit(), analyzer()],
});
