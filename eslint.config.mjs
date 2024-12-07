import eslintPluginJs from "@eslint/js";
import globals from "globals";

const config = [
  eslintPluginJs.configs.recommended,
  {
    "files": ["**/*.js"],
    "languageOptions": {
      "globals": {
        ...globals.browser,
        ...globals.node,
        Log: "readonly"
      },
      "sourceType": "commonjs"
    },
    "rules": {
      "capitalized-comments": "off",
      "consistent-this": "off",
      "line-comment-position": "off",
      "max-lines-per-function": ["warn", 275],
      "max-statements": ["warn", 65],
      "multiline-comment-style": "off",
      "no-await-in-loop": "off",
      "no-constant-binary-expression": "warn",
      "no-inline-comments": "off",
      "no-magic-numbers": "off",
      "no-plusplus": "off",
      "no-prototype-builtins": "warn",
      "no-undef": "warn",
      "no-unused-vars": "warn",
      "no-useless-escape": "warn",
      "no-var": "warn",
      "one-var": "off",
      "sort-keys": "off",
      "strict": "off"
    },
  },
  {
    "files": ["**/*.mjs"],
    "languageOptions": {
      "ecmaVersion": "latest",
      "globals": {
        ...globals.node
      },
      "sourceType": "module"
    },
    "rules": {
      "no-magic-numbers": "off"
    }
  }
];

export default config;
