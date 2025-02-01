import path from "node:path";
import url from "node:url";

import { includeIgnoreFile as ignore } from "@eslint/compat";
import javascript from "@eslint/js";
import jest from "eslint-plugin-jest";
import jsxa11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import refresh from "eslint-plugin-react-refresh";
import imports from "eslint-plugin-simple-import-sort";
import globals from "globals";
import typescript, { config } from "typescript-eslint";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gitignore = path.resolve(__dirname, ".gitignore");

export default config(
  // Globally ignore files based on `.gitignore`

  ignore(gitignore),

  // Configure common language options

  {
    files: ["*.{js,mjs}"],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: ["src/**/*.{js,jsx,mjs,ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Imports (https://github.com/lydell/eslint-plugin-simple-import-sort)

  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    plugins: {
      "simple-import-sort": imports,
    },
    rules: {
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
    },
  },

  // JavaScript (https://github.com/eslint/eslint/tree/main/packages/js)

  {
    files: ["**/*.{js,jsx,mjs}"],
    ...javascript.configs.recommended,
  },

  // TypeScript (https://github.com/typescript-eslint/typescript-eslint)

  {
    files: ["**/*.{ts,tsx}"],
    extends: [...typescript.configs.recommended],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },

  // React

  {
    extends: [
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      jsxa11y.flatConfigs.recommended,
      refresh.configs.vite,
    ],
    files: ["**/*.{jsx,tsx}"],
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      "react-hooks": hooks,
    },
    rules: {
      ...hooks.configs.recommended.rules,
    },
  },

  // Jest (https://github.com/jest-community/eslint-plugin-jest)

  {
    files: ["**/*.test.{js,jsx,mjs,ts,tsx}"],
    ...jest.configs["flat/recommended"],
  },

  // Prettier (https://github.com/prettier/eslint-plugin-prettier)

  prettier,
);
