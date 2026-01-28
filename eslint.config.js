export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
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
