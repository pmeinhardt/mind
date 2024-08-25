import javascript from "@eslint/js";
import jest from "eslint-plugin-jest";
import prettier from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import imports from "eslint-plugin-simple-import-sort";
import globals from "globals";
import typescript from "typescript-eslint";

const addon = {
  imports: {
    plugins: {
      "simple-import-sort": imports,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  jest: {
    files: ["**/*.test.{js,jsx,mjs,ts,tsx}"],
    ...jest.configs["flat/recommended"],
  },
  tailwind: {
    files: ["tailwind.config.js"],
    languageOptions: { sourceType: "commonjs" },
  },
};

export default [
  { files: ["**/*.{js,jsx,mjs,ts,tsx}"] },
  { ignores: ["dist"] },
  { languageOptions: { globals: globals.browser } },
  javascript.configs.recommended,
  ...typescript.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  addon.imports,
  addon.jest,
  addon.tailwind,
  prettier,
];
