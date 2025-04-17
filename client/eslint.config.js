import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginPrettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: {
      js,
      prettier: pluginPrettier,
    },
    extends: ["js/recommended", ...configPrettier],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": ["error", { endOfLine: "auto", tabWith: 2}], 
      indent: ["error", 2],
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  prettier
]);
