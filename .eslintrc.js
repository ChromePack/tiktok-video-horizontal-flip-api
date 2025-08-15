module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    // Code quality rules
    "no-console": "off", // Allow console.log for server logging
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-undef": "error",
    "no-var": "error",
    "prefer-const": "error",

    // Code style rules
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "single"],
    semi: ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],

    // Best practices
    eqeqeq: "error",
    curly: "error",
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-script-url": "error",

    // ES6+ features
    "arrow-spacing": "error",
    "no-duplicate-imports": "error",
    "prefer-template": "error",
    "template-curly-spacing": "error",

    // Node.js specific
    "no-process-exit": "off", // Allow process.exit for server startup/shutdown
    "no-path-concat": "error",
  },
  overrides: [
    {
      files: ["**/*.test.js", "**/*.spec.js"],
      env: {
        jest: true,
      },
    },
  ],
};
