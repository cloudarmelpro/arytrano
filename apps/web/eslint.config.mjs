import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Monorepo siblings — each app/package owns its own toolchain.
    // apps/mobile is an Expo/React Native project (different eslint
    // preset, CommonJS configs); packages/shared is pure TS+Zod and
    // has nothing actionable for Next.js's ruleset.
    "apps/**",
    "packages/**",
  ]),
]);

export default eslintConfig;
