import javascript from "@eslint/js";
import jest from "eslint-plugin-jest";
import prettier from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import imports from "eslint-plugin-simple-import-sort";
import globals from "globals";
import typescript from "typescript-eslint";

const config = {
  files: [{ files: ["**/*.{js,jsx,mjs,ts,tsx}"] }],
  globals: [{ languageOptions: { globals: globals.browser } }],
  ignores: [{ ignores: ["dist"] }],
  imports: [
    {
      plugins: {
        "simple-import-sort": imports,
      },
      rules: {
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
      },
    },
  ],
  javascript: [javascript.configs.recommended],
  jest: [
    {
      files: ["**/*.test.{js,jsx,mjs,ts,tsx}"],
      ...jest.configs["flat/recommended"],
    },
  ],
  prettier: [prettier],
  react: [
    { settings: { react: { version: "detect" } } },
    react.configs.flat.recommended,
    react.configs.flat["jsx-runtime"],
  ],
  tailwind: [
    {
      files: ["tailwind.config.js"],
      languageOptions: { sourceType: "commonjs" },
    },
  ],
  typescript: [...typescript.configs.recommended],
};

export default [
  ...config.files,
  ...config.ignores,
  ...config.globals,
  ...config.javascript,
  ...config.typescript,
  ...config.react,
  ...config.imports,
  ...config.jest,
  ...config.tailwind,
  ...config.prettier,
];
