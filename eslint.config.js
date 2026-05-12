import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "server/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "blob-report/**",
    ],
  },
  {
    settings: {
      react: { version: "19.2" },
    },
  },
  js.configs.recommended,
  react.configs.flat.recommended,
  {
    files: ["playwright.config.js", "vite.config.js", "vitest.config.js", "eslint.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["src/**/*.{js,jsx}", "e2e/**/*.{js,mjs,cjs}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/display-name": "off",
      "react/no-unescaped-entities": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    files: ["src/socket/**/*.js"],
    rules: {
      "no-console": "off",
    },
  },
  eslintConfigPrettier,
];
