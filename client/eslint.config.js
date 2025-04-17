import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginPrettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "**/*.config.{js,ts,cjs,mjs}",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/react-in-jsx-scope": "off",         
      "prettier/prettier": "error",              
      indent: ["error", 2],                       
    },
  },

  configPrettier,
]);