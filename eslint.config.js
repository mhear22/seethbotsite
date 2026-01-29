import globals from "globals";

export default [
  {
    ignores: ["eslint.config.js"]
  },
  {
    files: ["components/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        document: "readonly",
        window: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        requestAnimationFrame: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "warn",
      "semi": ["warn", "always"],
      "quotes": ["warn", "single"],
      "indent": ["warn", 2],
      "no-console": "off"
    }
  },
  {
    files: ["*.js", "server/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.browser,
        document: "readonly",
        window: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        requestAnimationFrame: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "warn",
      "semi": ["warn", "always"],
      "quotes": ["warn", "single"],
      "indent": ["warn", 2],
      "no-console": "off"
    }
  }
];
