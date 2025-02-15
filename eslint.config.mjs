import path from "node:path";
import url from "node:url";

import { includeIgnoreFile as ignore } from "@eslint/compat";
import javascript from "@eslint/js";
import jest from "eslint-plugin-jest";
import jsxa11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import imports from "eslint-plugin-simple-import-sort";
import globals from "globals";
import typescript, { config } from "typescript-eslint";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gitignore = path.resolve(__dirname, ".gitignore");

export default config(
  // Language options

  {
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Includes

  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
  },

  // Ignores (from .gitignore)

  ignore(gitignore),

  // JavaScript (https://github.com/eslint/eslint/tree/main/packages/js)

  javascript.configs.recommended,

  // TypeScript (https://github.com/typescript-eslint/typescript-eslint)

  typescript.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },

  // React (https://github.com/jsx-eslint/eslint-plugin-react)

  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],

  // React hooks (https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks)

  {
    ...hooks.configs.recommended,
    plugins: {
      "react-hooks": hooks,
    },
  },

  // React accessibility (https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

  jsxa11y.flatConfigs.recommended,

  // Imports (https://github.com/lydell/eslint-plugin-simple-import-sort)

  {
    plugins: {
      "simple-import-sort": imports,
    },
    rules: {
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
    },
  },

  // Jest (https://github.com/jest-community/eslint-plugin-jest)

  {
    ...jest.configs["flat/recommended"],
    files: ["**/*.test.{js,jsx,mjs,ts,tsx}"],
  },

  // Tailwind CSS config

  {
    files: ["tailwind.config.js"],
    languageOptions: { sourceType: "commonjs" },
  },

  // Prettier (https://github.com/prettier/eslint-plugin-prettier)

  prettier,
);
