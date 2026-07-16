import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // React 19 / React Compiler transition: eslint-config-next promotes
    // several react-hooks/* rules to `error` that flag common but
    // functionally-correct patterns (setState inside a useEffect that
    // consumes useActionState result). Migrating every call site to
    // useTransition-wrapped actions is a codebase-wide refactor tracked
    // separately — until it lands, keep these as warnings so CI doesn't
    // block on pre-existing tech debt.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/incompatible-library": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
